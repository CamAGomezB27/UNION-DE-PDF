from PyPDF2 import PdfMerger
import os
from app.utils.name_utils import extract_fc_number

OUTPUT_DIR = "storage/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def merge_group(nit, file_paths):
    if len(file_paths) < 2:
        print(f"⚠️ NIT {nit} sin coincidencias (solo 1 archivo)")
        return None

    merger = PdfMerger()

    fc_number = None

    for path in file_paths:
        merger.append(path)

        filename = os.path.basename(path)
        fc_number = extract_fc_number(filename)

        if fc_number:
            break  # tomamos el primero que encontremos

    # fallback si no encuentra FC
    if not fc_number:
        fc_number = "SIN_NUMERO"

    output_filename = f"FC - {fc_number}.pdf"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    merger.write(output_path)
    merger.close()

    return {
        "nit": nit,
        "file": output_path
    }