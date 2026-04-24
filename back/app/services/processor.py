from app.services.pdf_reader import read_all_pdfs
from app.services.matcher import group_by_nit   # 👈 crea/usa este archivo
from app.services.merger import merge_group
from app.utils.date_utils import extract_date
from app.utils.log_utils import log


def process_pdfs(folder_path):
    files = read_all_pdfs(folder_path)

    # 🔥 separar facturas individuales
    groups = group_by_nit(files)
    log("🔥 TERMINÓ AGRUPACIÓN")
    exploded = files  # 👈 para no romper lo de abajo

    results = []

    # 🔹 3. Procesar cada grupo
    for nit, file_list in groups.items():
    # 🔹 limpiar duplicados + ordenar
        paths = file_list["paths"]
        log("----")
        log(f"NIT: {nit}")
        log("Archivos:" + str(paths))
        # 🔹 4. Merge solo si hay más de uno
        merged = merge_group(nit, paths)

        if merged:
            log("✅ MERGE REALIZADO")
            # 🔍 leer texto de uno de los archivos del grupo
            sample = next((f for f in exploded if f["path"] in paths), None)

            if not sample:
                log(f"⚠️ No se encontró sample para NIT {nit}")
                continue

            year, month = extract_date(sample["text"])

            merged["year"] = year or "SIN_ANO"
            merged["month"] = month or "SIN_MES"

            results.append(merged)

    return results