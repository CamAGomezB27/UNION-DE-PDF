import os
import shutil
import uuid
import requests

from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfMerger

from app.services.processor import process_pdfs
from app.services.sharepoint import upload_to_sharepoint
from app.utils.auth import verify_token

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
def merge_pdfs(request: MergeRequest):
    merger = PdfMerger()

    for file_path in request.files:
        merger.append(file_path)

    output_path = f"storage/output/{request.outputName}.pdf"

    merger.write(output_path)
    merger.close()

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=f"{request.outputName}.pdf"
    )

# =========================
# ⚙️ Procesamiento directo
# =========================
@router.post("/process")
def process():
    results = process_pdfs()

    if not results:
        return {"message": "No se encontraron coincidencias"}

    file_path = results[0]

    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename="resultado.pdf"
    )

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
    # 🔐 =========================
    # VALIDACIÓN DE TOKEN
    # =========================
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")

    try:
        user = verify_token(token)
        user_email = user.get("preferred_username")
        print("👤 Usuario:", user_email)
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    # 📁 =========================
    # CREAR SESIÓN
    # =========================
    session_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_BASE, session_id)

    folder_a = os.path.join(input_dir, "folder_a")
    folder_b = os.path.join(input_dir, "folder_b")

    os.makedirs(folder_a, exist_ok=True)
    os.makedirs(folder_b, exist_ok=True)

    # 📂 =========================
    # GUARDAR ARCHIVOS
    # =========================
    for file in files:
        filename = os.path.basename(file.filename)
        filename_upper = filename.upper()

        if "BEC" in filename_upper:
            save_path = os.path.join(folder_b, filename)
        else:
            save_path = os.path.join(folder_a, filename)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # ⚙️ =========================
    # PROCESAR PDFs
    # =========================
    results = process_pdfs(folder_a, folder_b)

    if not results:
        return {"message": "No se encontraron coincidencias"}

    result_file = results[0]

    # ☁️ =========================
    # SUBIR A SHAREPOINT
    # =========================
    try:
        site_id = "TU_SITE_ID"
        drive_id = "TU_DRIVE_ID"

        filename = os.path.basename(result_file)

        # 🔥 OPCIONAL: guardar por usuario
        sharepoint_path = f"{user_email}/{filename}"

        url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root:/{sharepoint_path}:/content"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/pdf"
        }

        with open(result_file, "rb") as f:
            res = requests.put(url, headers=headers, data=f)

        if res.status_code in [200, 201]:
            print("✅ Archivo subido a SharePoint")
        else:
            print("⚠️ Error SharePoint:", res.status_code, res.text)

    except Exception as e:
        print("❌ ERROR SHAREPOINT:", str(e))

    # 📥 =========================
    # RESPUESTA
    # =========================
    return FileResponse(
        path=result_file,
        media_type="application/pdf",
        filename="resultado.pdf"
    )