from app.services.pdf_reader import read_pdfs
from app.services.matcher import match_files
from app.services.merger import merge_pdfs

def process_pdfs(folder_a, folder_b):
    files_a = read_pdfs(folder_a)
    files_b = read_pdfs(folder_b)

    matches = match_files(files_a, files_b)

    results = []
    for match in matches:
        output_path = merge_pdfs(match)
        results.append(output_path)

    return results