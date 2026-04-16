from app.services.pdf_reader import read_pdfs
from app.services.matcher import match_files
from app.services.merger import merge_pdfs

FOLDER_A = "storage/input/folder_a"
FOLDER_B = "storage/input/folder_b"

def process_pdfs():
    files_a = read_pdfs(FOLDER_A)
    files_b = read_pdfs(FOLDER_B)

    matches = match_files(files_a, files_b)

    results = []
    for match in matches:
        output_path = merge_pdfs(match)
        results.append(output_path)

    return results