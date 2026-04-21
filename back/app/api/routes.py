import os
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfMerger

from app.services.processor import process_pdfs
from app.utils.auth import verify_token
from app.services.graph_auth import get_graph_token
from app.services.sharepoint import upload_to_sharepoint  # ✅ CAMBIO
from app.utils.progres_utils import jobs  # 🆕 IMPORTAMOS EL DICCIONARIO DE PROGRESO
from app.utils.progres_utils import set_progress  # 🆕 IMPORTAMOS LA FUNCIÓN DE PROGRESO

router = APIRouter()

UPLOAD_BASE = "storage/input"

# =========================
# 📦 Modelo request
# =========================
class MergeRequest(BaseModel):
    files: List[str]
    outputName: str

# =========================
# ❤️ Healthcheck
# =========================
@router.get("/health")
def health():
    return {"status": "ok"}

# =========================
# 📎 Merge manual
# =========================
@router.post("/merge")
def merge_pdfs_manual(request: MergeRequest):
    merger = PdfMerger()

    for file_path in request.files:
        merger.append(file_path)

    output_path = f"storage/output/{request.outputName}.pdf"

    merger.write(output_path)
    merger.close()

    return {
        "message": "PDF unido correctamente",
        "file": output_path
    }

# =========================
# 📂 Listar archivos
# =========================
@router.get("/files")
def get_files(path: str):
    full_path = os.path.join("storage/input", path)

    if not os.path.exists(full_path):
        return {"error": "Ruta no existe"}

    files = [
        f"{full_path}/{f}"
        for f in os.listdir(full_path)
        if f.endswith(".pdf")
    ]

    return {"files": files}

# =========================
# 🚀 Upload + Process + Auth
# =========================
@router.post("/upload-and-process")
def upload_and_process(
    files: list[UploadFile] = File(...),
    authorization: str = Header(None)
):
    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "progress": 0,
        "status": "iniciando"
    }

    # 🔐 VALIDACIÓN DE TOKEN
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")
    set_progress(job_id, 5, "validando token")

    try:
        user = verify_token(token)
        print("TOKEN DECODED:", user)
    except Exception as e:
        print("❌ ERROR REAL TOKEN:", str(e))
        raise HTTPException(status_code=401, detail=str(e))

    # 📁 CREAR SESIÓN
    set_progress(job_id, 10, "creando sesión")
    session_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_BASE, session_id)
    os.makedirs(input_dir, exist_ok=True)

    # 📂 GUARDAR ARCHIVOS
    for i, file in enumerate(files):
        filename = os.path.basename(file.filename)
        save_path = os.path.join(input_dir, filename)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        set_progress(
            job_id,
            10 + int((i + 1) / len(files) * 10),
            "guardando archivos"
        )

    # ⚙️ PROCESAR PDFs
    set_progress(job_id, 20, "procesando PDFs")
    results = process_pdfs(input_dir)

    if not results:
        set_progress(job_id, 100, "sin coincidencias")
        return {
            "job_id": job_id,
            "message": "No se encontraron coincidencias",
            "files": []
        }

    set_progress(job_id, 25, f"{len(results)} PDFs detectados")

    # 🔐 TOKEN GRAPH
    set_progress(job_id, 50, "obteniendo token graph")
    graph_token = get_graph_token()

    uploaded_files = []

    total = len(results)
    uploaded = 0
    skipped = 0
    errors = 0

    # 🚀 SUBIDA
    for idx, item in enumerate(results):
        result_file = item["file"]
        nit = item["nit"]

        try:
            res = upload_to_sharepoint(
                result_file,
                f"Bearer {graph_token}"
            )

            print(f"✅ Subido NIT {nit}")

            uploaded += 1

            uploaded_files.append({
                "nit": nit,
                "url": res.get("webUrl"),
                "status": "uploaded"
            })

        except Exception as e:
            msg = str(e).lower()

            # 🟡 YA EXISTE (NO ES ERROR REAL)
            if "ya existe" in msg or "already exists" in msg:
                print(f"⚠️ SKIP NIT {nit}")

                skipped += 1

                uploaded_files.append({
                    "nit": nit,
                    "status": "skipped"
                })

            # 🔴 ERROR REAL
            else:
                print(f"❌ ERROR NIT {nit}: {msg}")

                errors += 1

                uploaded_files.append({
                    "nit": nit,
                    "status": "error",
                    "reason": msg
                })

        # 📊 PROGRESO
        progress = 50 + int(((idx + 1) / total) * 50)
        set_progress(job_id, progress, f"procesando NIT {nit}")

    # 📥 STATUS FINAL (DESPUÉS DEL LOOP)
    if uploaded == 0 and skipped == total:
        status = "todos los archivos ya estaban en SharePoint"
    elif uploaded > 0 and skipped > 0:
        status = "proceso completado con archivos existentes"
    elif uploaded == total:
        status = "todos los archivos subidos correctamente"
    else:
        status = "proceso completado con errores"

    set_progress(job_id, 100, status)

    return {
        "job_id": job_id,
        "message": status,
        "summary": {
            "total": total,
            "uploaded": uploaded,
            "skipped": skipped,
            "errors": errors
        },
        "files": uploaded_files
    }

@router.get("/progress/{job_id}")
def get_progress(job_id: str):
    return jobs.get(job_id, {"error": "job no existe"})