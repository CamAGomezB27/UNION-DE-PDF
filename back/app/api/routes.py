import os
import shutil
import uuid
import time
import json
import redis

from fastapi import APIRouter, UploadFile, File, Header, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfMerger

from app.services.processor import process_pdfs
from app.utils.auth import verify_token
from app.services.graph_auth import get_graph_token
from app.services.sharepoint import upload_to_sharepoint  # ✅ CAMBIO
from app.utils.progres_utils import set_progress
from app.utils.log_utils import add_log, log
from app.utils.context import set_current_job_id

router = APIRouter()
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

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
    authorization: str = Header(None),
    background_tasks: BackgroundTasks = None
):
    job_id = str(uuid.uuid4())
    print(f"✅ Nuevo job creado: {job_id}")
    
    # Inicializar job con logs vacíos
    redis_client.set(job_id, json.dumps({
        "progress": 0,
        "status": "iniciando",
        "logs": []
    }))
    add_log(job_id, "🔹 Inicio de procesamiento de archivos")
    print(f"📝 Job inicializado en Redis con progreso 0%")

    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")

    # 📁 CREAR SESIÓN
    add_log(job_id, "📁 Creando sesión de subida")
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

    background_tasks.add_task(run_background_job, job_id, input_dir, token)

    return {
        "job_id": job_id,
        "message": "Proceso iniciado",
        "status": "iniciando"
    }


def run_background_job(job_id: str, input_dir: str, token: str):
    set_current_job_id(job_id)
    add_log(job_id, "⚙️ Iniciando procesamiento de PDFs")
    set_progress(job_id, 20, "procesando PDFs")

    try:
        user = verify_token(token)
        add_log(job_id, "✅ Token validado")
    except Exception as e:
        add_log(job_id, f"❌ ERROR TOKEN: {str(e)}")
        set_progress(job_id, 100, "error en validación de token")
        return

    results = process_pdfs(input_dir)

    if not results:
        set_progress(job_id, 100, "sin coincidencias")
        return

    add_log(job_id, f"📌 {len(results)} PDFs detectados")
    set_progress(job_id, 25, f"{len(results)} PDFs detectados")

    add_log(job_id, "🔐 Obteniendo token Graph")
    set_progress(job_id, 50, "obteniendo token graph")
    graph_token = get_graph_token()

    uploaded_files = []
    total = len(results)
    uploaded = 0
    skipped = 0
    errors = 0

    for idx, item in enumerate(results):
        result_file = item["file"]
        nit = item["nit"]

        try:
            res = upload_to_sharepoint(
                result_file,
                f"Bearer {graph_token}",
                job_id
            )

            if res.get("status") == "skipped":
                skipped += 1
                add_log(job_id, f"⚠️ SKIP NIT {nit}")
            else:
                uploaded += 1
                add_log(job_id, f"✅ Subido NIT {nit}")

            uploaded_files.append({
                "nit": nit,
                "url": res.get("webUrl"),
                "status": res.get("status", "uploaded")
            })

        except Exception as e:
            msg = str(e).lower()
            if "ya existe" in msg or "already exists" in msg:
                add_log(job_id, f"⚠️ SKIP NIT {nit}")
                skipped += 1
                uploaded_files.append({
                    "nit": nit,
                    "status": "skipped"
                })
            else:
                add_log(job_id, f"❌ ERROR NIT {nit}: {msg}")
                errors += 1
                uploaded_files.append({
                    "nit": nit,
                    "status": "error",
                    "reason": msg
                })

        progress = 50 + int(((idx + 1) / total) * 50)
        set_progress(job_id, progress, f"procesando NIT {nit}")

    if uploaded == 0 and skipped == total:
        status = "todos los archivos ya estaban en SharePoint"
    elif uploaded > 0 and skipped > 0:
        status = "proceso completado con archivos existentes"
    elif uploaded > 0 and skipped == 0:
        status = "todos los archivos subidos correctamente"
    else:
        status = "proceso completado con errores"

    add_log(job_id, "✅ Finalizando proceso")
    set_progress(job_id, 95, "finalizando...")
    time.sleep(0.2)
    add_log(job_id, f"📌 Estado final: {status}")
    set_progress(job_id, 100, status)

@router.get("/progress/{job_id}")
def get_progress(job_id: str):
    data = redis_client.get(job_id)

    if not data:
        print(f"❌ Job {job_id} no encontrado en Redis")
        return {"error": "job no existe"}

    job = json.loads(data)
    
    # Asegurar que el progreso es un número
    job["progress"] = int(job.get("progress", 0))
    job["logs"] = job.get("logs", [])
    job["status"] = job.get("status", "")
    
    print(f"📤 Devolviendo progreso: {job['progress']}% | logs: {len(job['logs'])}")
    
    return job