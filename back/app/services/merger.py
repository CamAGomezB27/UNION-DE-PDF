from PyPDF2 import PdfMerger
import os  # 👈 FALTABA ESTO

OUTPUT_DIR = "storage/output"

# 👇 crea la carpeta si no existe
os.makedirs(OUTPUT_DIR, exist_ok=True)


def merge_pdfs(match):
    merger = PdfMerger()

    merger.append(match["file_a"])
    merger.append(match["file_b"])

    output_filename = f"{match['id']}.pdf"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    merger.write(output_path)
    merger.close()

    return output_path