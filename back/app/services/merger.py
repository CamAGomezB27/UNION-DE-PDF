from PyPDF2 import PdfMerger
import os  # 👈 FALTABA ESTO

OUTPUT_DIR = "storage/output"

# 👇 crea la carpeta si no existe
os.makedirs(OUTPUT_DIR, exist_ok=True)

def merge_group(nit, file_paths):
    if len(file_paths) < 2:
        return None

    merger = PdfMerger()

    for path in file_paths:
        merger.append(path)

    output_filename = f"{nit}.pdf"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    merger.write(output_path)
    merger.close()

    return {
        "nit": nit,
        "file": output_path
    }