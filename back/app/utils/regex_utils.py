import re

def normalize_nit(nit):
    # Quita todo lo que no sea número
    return re.sub(r"\D", "", nit)


import re

def normalize_nit(nit):
    return re.sub(r"\D", "", nit)


def extract_nit(text):
    text = text.upper()

    # 🔥 1. EMISOR
    match = re.search(
        r"DATOS DEL EMISOR.*?NIT[:\s]*([\d\.\- ]+)",
        text,
        re.DOTALL
    )
    if match:
        nit = normalize_nit(match.group(1))
        if len(nit) >= 8:
            return nit

    # 🔥 2. PROVEEDOR (TU CASO REAL)
    match = re.search(
        r"PROVEEDOR.*?NIT[:\s]*([\d\.\- ]+)",
        text,
        re.DOTALL
    )
    if match:
        nit = normalize_nit(match.group(1))
        if len(nit) >= 8:
            return nit

    # 🔥 3. fallback (último recurso)
    matches = re.findall(r"NIT[:\s]*([\d\.\- ]+)", text)

    for m in matches:
        nit = normalize_nit(m)
        if len(nit) >= 8:
            return nit

    return None