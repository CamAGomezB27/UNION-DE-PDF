import os
import pytesseract
from pdf2image import convert_from_path

def read_pdfs(folder_path):
    files_data = []

    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf"):
            full_path = os.path.join(folder_path, filename)

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
                print(f"Error leyendo {filename}: {e}")

    return files_data