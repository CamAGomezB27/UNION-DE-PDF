from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.processor import process_pdfs

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}


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