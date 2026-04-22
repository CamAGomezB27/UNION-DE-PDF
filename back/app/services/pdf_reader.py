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
                        text += pytesseract.image_to_string(img, lang="spa")

                    files_data.append({
                        "filename": filename,
                        "path": full_path,
                        "text": text
                    })

                except Exception as e:
                    log(f"Error leyendo {filename}: {e}")

    return files_data