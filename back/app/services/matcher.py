from app.utils.regex_utils import extract_nit

def match_files(files_a, files_b):
    matches = []

    for file_a in files_a:
        nit_a = extract_nit(file_a["text"])
        if not nit_a:
            continue

        for file_b in files_b:
            nit_b = extract_nit(file_b["text"])

            if nit_a and nit_b and nit_a == nit_b:
                matches.append({
                    "id": nit_a,
                    "file_a": file_a["path"],
                    "file_b": file_b["path"]
                })

    return matches