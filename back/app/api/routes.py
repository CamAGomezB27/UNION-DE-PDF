from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from app.services.processor import process_pdfs
from pydantic import BaseModel
from typing import List
from PyPDF2 import PdfMerger
import os
import shutil
import uuid

from app.services.processor import process_pdfs  # ojo nombre correcto


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
def upload_and_process(files: list[UploadFile] = File(...)):

    session_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_BASE, session_id)

    folder_a = os.path.join(input_dir, "folder_a")
    folder_b = os.path.join(input_dir, "folder_b")

    os.makedirs(folder_a, exist_ok=True)
    os.makedirs(folder_b, exist_ok=True)

    for file in files:
        filename_upper = file.filename.upper()

        # 🔥 evitar rutas tipo "carpeta/archivo.pdf"
        filename = os.path.basename(file.filename)

        if "BEC" in filename_upper:
            save_path = os.path.join(folder_b, filename)
        else:
            save_path = os.path.join(folder_a, filename)

        # 🔥 asegurar carpeta (por seguridad)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # 🔥 procesar
    results = process_pdfs(folder_a, folder_b)

    if not results:
        return {"message": "No se encontraron coincidencias"}

    return FileResponse(
        path=results[0],
        media_type="application/pdf",
        filename="resultado.pdf"
    )