from app.services.pdf_reader import read_all_pdfs
from app.services.matcher import group_by_nit   # 👈 crea/usa este archivo
from app.services.merger import merge_group
from app.utils.date_utils import extract_date
from app.utils.log_utils import log


def process_pdfs(folder_path):
    # 🔹 1. Leer todos los PDFs
    files = read_all_pdfs(folder_path)

    # 🔹 2. Agrupar por NIT
    groups = group_by_nit(files)

    results = []

    # 🔹 3. Procesar cada grupo
    for nit, file_list in groups.items():
    # 🔹 limpiar duplicados + ordenar
        file_list = sorted(list(set(file_list["paths"])))
        log("----")
        log(f"NIT: {nit}")
        log("Archivos:" + str(file_list))
        # 🔹 4. Merge solo si hay más de uno
        merged = merge_group(nit, file_list)

        if merged:
            log("✅ MERGE REALIZADO")
            # 🔍 leer texto de uno de los archivos del grupo
            sample_file = files[0]
            year, month = extract_date(sample_file["text"])

            merged["year"] = year or "SIN_ANO"
            merged["month"] = month or "SIN_MES"

            results.append(merged)

    return results