import os
import shutil
import uuid
import requests


from fastapi import APIRouter, UploadFile, File, Header
from fastapi.responses import FileResponse
from app.services.processor import process_pdfs
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfMerger
from app.services.processor import process_pdfs  # ojo nombre correcto
from app.services.sharepoint import upload_to_sharepoint


router = APIRouter()

UPLOAD_BASE = "storage/input"

# 📦 Modelo request
class MergeRequest(BaseModel):
    files: List[str]
    outputName: str

@router.get("/health")
def health():
    return {"status": "ok"}


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


@router.post("/process")
def process():
    results = process_pdfs()

    if not results:
        return {"message": "No se encontraron coincidencias"}

    # 🔥 devolver el primer PDF generado
    file_path = results[0]

    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename="resultado.pdf"
    )

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

@router.post("/upload-and-process")
def upload_and_process(
    files: list[UploadFile] = File(...),
    authorization: str = Header(None)
):
    session_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_BASE, session_id)

    folder_a = os.path.join(input_dir, "folder_a")
    folder_b = os.path.join(input_dir, "folder_b")

    os.makedirs(folder_a, exist_ok=True)
    os.makedirs(folder_b, exist_ok=True)

    # =========================
    # 📂 GUARDAR ARCHIVOS
    # =========================
    for file in files:
        filename = os.path.basename(file.filename)
        filename_upper = filename.upper()

        if "BEC" in filename_upper:
            save_path = os.path.join(folder_b, filename)
        else:
            save_path = os.path.join(folder_a, filename)

        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # =========================
    # ⚙️ PROCESAR PDFs
    # =========================
    results = process_pdfs(folder_a, folder_b)

    if not results:
        return {"message": "No se encontraron coincidencias"}

    result_file = results[0]

    # =========================
    # 🔐 SUBIR A SHAREPOINT
    # =========================
    if authorization:
        try:
            site_id = "TU_SITE_ID"
            drive_id = "TU_DRIVE_ID"

            filename = os.path.basename(result_file)

            url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root:/{filename}:/content"

            headers = {
                "Authorization": authorization,  # 👈 "Bearer xxx"
                "Content-Type": "application/pdf"
            }

            with open(result_file, "rb") as f:
                res = requests.put(url, headers=headers, data=f)

            if res.status_code in [200, 201]:
                print("✅ Archivo subido a SharePoint correctamente")
            else:
                print("⚠️ Error SharePoint:", res.status_code, res.text)

        except Exception as e:
            print("❌ ERROR SUBIENDO A SHAREPOINT:", str(e))

    else:
        print("⚠️ No se recibió token, no se sube a SharePoint")

    # =========================
    # 📥 RESPUESTA AL FRONT
    # =========================
    return FileResponse(
        path=result_file,
        media_type="application/pdf",
        filename="resultado.pdf"
    )