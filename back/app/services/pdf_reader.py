import os
import pytesseract
from pdf2image import convert_from_path
from app.utils.log_utils import log

def read_all_pdfs(folder_path):
    files_data = []

    for root, _, files in os.walk(folder_path):  # 🔥 IMPORTANTE
        for filename in files:
            if filename.endswith(".pdf"):
                full_path = os.path.join(root, filename)

                try:
                    images = convert_from_path(full_path)
                    text = ""

                    for img in images:
                        config = "--oem 3 --psm 6"
                        text += pytesseract.image_to_string(img, lang="spa", config=config)
                        
                        clean_text = text.strip()

                        if len(clean_text) < 50:
                            log(f"⚠️ OCR vacío o muy corto: {filename}")
                            continue

                    files_data.append({
                        "filename": filename,
                        "path": full_path,
                        "text": clean_text
                    })

                except Exception as e:
                    log(f"Error leyendo {filename}: {e}")

    return files_data