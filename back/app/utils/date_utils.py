import re
from datetime import datetime

def extract_date(text):
    """
    Busca fechas tipo:
    2025-01-29
    29/01/2025
    2025/01/29
    """

    # formato YYYY-MM-DD o YYYY/MM/DD
    match = re.search(r"(20\d{2})[-/](\d{2})[-/](\d{2})", text)
    if match:
        year, month, _ = match.groups()
        return year, month

    # formato DD/MM/YYYY
    match = re.search(r"(\d{2})/(\d{2})/(20\d{2})", text)
    if match:
        _, month, year = match.groups()
        return year, month

    return None, None