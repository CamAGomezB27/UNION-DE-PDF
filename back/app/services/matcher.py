from app.utils.regex_utils import extract_nit

def match_files(files_a, files_b):
    matches = []

    for file_a in files_a:
        nit_a = extract_nit(file_a["text"])
        if not nit_a:
            continue

        for file_b in files_b:
            nit_b = extract_nit(file_b["text"])
            if not nit_b:
                continue

            # 🔥 NORMALIZAR (quitar DV si existe)
            nit_a_base = nit_a[:-1] if len(nit_a) > 9 else nit_a
            nit_b_base = nit_b[:-1] if len(nit_b) > 9 else nit_b

            print("COMPARE:", nit_a_base, nit_b_base)

            if nit_a_base == nit_b_base:
                matches.append({
                    "id": nit_a_base,
                    "file_a": file_a["path"],
                    "file_b": file_b["path"]
                })

    return matches