import re

IGNORED_NITS = {"900347494"}

def normalize_nit(nit):
    return re.sub(r"\D", "", nit)[:9]  # 👈 solo los primeros 9

def is_valid_nit(nit):
    return nit and len(nit) >= 8 and nit not in IGNORED_NITS


def extract_nit(text, filename):
    text = text.upper()
    filename = filename.upper()

    # 🔵 CASO 1: archivos tipo BEC → usar EMISOR
    if "BEC" in filename:
        match = re.search(
            r"DATOS DEL EMISOR.*?NIT[:\s]*([\d\.\- ]+)",
            text,
            re.DOTALL
        )
        if match:
            nit = normalize_nit(match.group(1))
            if is_valid_nit(nit):
                return nit

    # 🟢 CASO 2: archivos normales → usar PROVEEDOR
    if "FC" in filename:
        match = re.search(
            r"PROVEEDOR[\s\S]{0,200}?NIT[:\s]*([\d\.\- ]+)",
            text,
            re.DOTALL
        )
        if match:
            nit = normalize_nit(match.group(1))
            if is_valid_nit(nit):
                return nit

    # 🟡 FALLBACK (por si algo falla)
    matches = re.findall(r"NIT[:\s]*([\d\.\- ]+)", text)

    valid_nits = []

    for m in matches:
        nit = normalize_nit(m)
        if is_valid_nit(nit):
            valid_nits.append(nit)

    # 🔥 priorizar el que más se repite
    if valid_nits:
        return max(set(valid_nits), key=valid_nits.count)

    return None