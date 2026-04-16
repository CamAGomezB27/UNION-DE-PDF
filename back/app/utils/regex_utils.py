import re

def normalize_nit(nit):
    # Quita todo lo que no sea número
    return re.sub(r"\D", "", nit)


def extract_nit(text):
    """
    Detecta NIT en formatos como:
    830.122.566-1
    830122566
    830 122 566
    """

    # Busca secuencias tipo NIT
    matches = re.findall(r"\b[\d\.\-\s]{8,20}\b", text)

    for match in matches:
        clean = normalize_nit(match)

        # Validación básica (NIT suele tener mínimo 8 dígitos)
        if len(clean) >= 8:
            return clean

    return None