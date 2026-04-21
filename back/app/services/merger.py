from PyPDF2 import PdfMerger
import os

OUTPUT_DIR = "storage/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def merge_group(nit, file_paths):
    if len(file_paths) < 2:
        print(f"⚠️ NIT {nit} sin coincidencias (solo 1 archivo)")
        return None  # 👈 esto reemplaza el continue

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