from app.utils.regex_utils import extract_nit
from app.utils.log_utils import log
from rapidfuzz import fuzz
import re


def clean_nit(nit):
    if not nit:
        return None
    return re.sub(r"\D", "", nit)[:9]


def normalize_name(name):


    name = name.upper()

    # ❌ eliminar números (clave)
    name = re.sub(r"\d+", " ", name)

    # limpiar símbolos
    name = re.sub(r"[^A-Z ]", " ", name)

    # normalizar espacios
    name = re.sub(r"\s+", " ", name).strip()

    # 🔥 eliminar ruido común
    stopwords = [
        "FACTURA", "FC", "PDF",
        "SAS", "SA", "LTDA",
        "COLOMBIA", "BOGOTA",
        "DE", "DEL", "LA",
        "TV"
    ]

    for word in stopwords:
        name = name.replace(word, "")

    return re.sub(r"\s+", " ", name).strip()


def group_by_nit(files):
    groups = {}

    for file in files:
        filename = file["filename"]
        text = file["text"]

        log("\n====== DEBUG OCR ======")
        log(f"Archivo: {filename}")
        log(text[:500])
        log("=======================\n")

        nit = clean_nit(extract_nit(text, filename))
        name = normalize_name(filename)

        log(f"NIT detectado: {nit}")
        log(f"Nombre normalizado: {name}")

        matched = False

        # 🔥 BUSCAR SI YA EXISTE UN GRUPO COMPATIBLE
        for key, data in groups.items():

            # 1️⃣ MATCH POR NIT
            if nit and key == nit[:9]:
                log(f"✅ MATCH POR NIT: {nit}")

                if file["path"] not in data["paths"]:
                    data["paths"].append(file["path"])

                matched = True
                break

            # 2️⃣ MATCH POR NOMBRE (FUZZY)
            # 🔥 SOLO usar nombre si ninguno tiene NIT
            if not nit and not key.isdigit():
                score = fuzz.partial_ratio(name, data["name"])

                if score > 90:
                    log(f"🟡 MATCH POR NOMBRE ({score}) con {data['name']}")

                    if file["path"] not in data["paths"]:
                        data["paths"].append(file["path"])

                    matched = True
                    break

        # 🔥 SI NO HIZO MATCH → CREAR NUEVO GRUPO
        if not matched:
            key = nit if nit else f"GROUP_{len(groups)}"

            log(f"🆕 NUEVO GRUPO: {key}")

            groups[key] = {
                "paths": [file["path"]],
                "name": name
            }
    log(f"🚀 TOTAL GRUPOS: {len(groups)}")
    return groups
