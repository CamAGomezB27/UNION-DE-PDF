from fastapi import APIRouter
from app.services.processor import process_pdfs

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/process")
def process():
    result = process_pdfs()
    return {
        "message": "Procesamiento completado",
        "files_generated": result
    }