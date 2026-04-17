import re

def normalize_nit(nit):
    return re.sub(r"\D", "", nit)[:9]  # 👈 solo los primeros 9


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
            if len(nit) >= 8:
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
            if len(nit) >= 8:
                return nit

    # 🟡 FALLBACK (por si algo falla)
    matches = re.findall(r"NIT[:\s]*([\d\.\- ]+)", text)

    for m in matches:
        nit = normalize_nit(m)
        if len(nit) >= 8:
            return nit

    return None