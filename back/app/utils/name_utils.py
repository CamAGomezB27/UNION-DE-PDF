import re

def extract_fc_number(filename: str):
    match = re.search(r"FC\s*[-]?\s*(\d{3})", filename.upper())
    if match:
        return match.group(1)
    return None