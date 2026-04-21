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
    # 🔐 VALIDACIÓN DE TOKEN
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")

    try:
        user = verify_token(token)
        print("TOKEN DECODED:", user)
    except Exception as e:
        print("❌ ERROR REAL TOKEN:", str(e))
        raise HTTPException(status_code=401, detail=str(e))

    # 📁 CREAR SESIÓN
    session_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_BASE, session_id)
    os.makedirs(input_dir, exist_ok=True)

    # 📂 GUARDAR ARCHIVOS
    for file in files:
        filename = os.path.basename(file.filename)
        save_path = os.path.join(input_dir, filename)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # ⚙️ PROCESAR PDFs
    results = process_pdfs(input_dir)

    if not results:
        return {"message": "No se encontraron coincidencias"}

    # 🔐 TOKEN GRAPH
    graph_token = get_graph_token()

    uploaded_files = []

    # 🚀 SUBIDA (SIMPLIFICADA Y CORRECTA)
    for item in results:
        result_file = item["file"]
        nit = item["nit"]

        try:
            res = upload_to_sharepoint(
                result_file,
                f"Bearer {graph_token}"  # 👈 importante
            )

            print(f"✅ Subido NIT {nit}")
            print("📂 URL:", res.get("webUrl"))

            uploaded_files.append({
                "nit": nit,
                "url": res.get("webUrl")
            })

        except Exception as e:
            print(f"❌ ERROR NIT {nit}:", str(e))

    # 📥 RESPUESTA FINAL
    return {
        "message": "Proceso completado",
        "total": len(uploaded_files),
        "files": uploaded_files
    }