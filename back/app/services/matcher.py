from app.utils.regex_utils import extract_nit

def match_files(files_a, files_b):
    matches = []

    for file_a in files_a:
        nit_a = extract_nit(file_a["text"], file_a["filename"])
        if not nit_a:
            continue

        for file_b in files_b:
            nit_b = extract_nit(file_b["text"], file_b["filename"])
            if not nit_b:
                continue

            # 🔥 NORMALIZAR (por si acaso)
            nit_a_base = nit_a[:9]
            nit_b_base = nit_b[:9]

            print("----")
            print("A:", file_a["filename"], "->", nit_a_base)
            print("B:", file_b["filename"], "->", nit_b_base)

            if nit_a_base == nit_b_base:
                print("✅ MATCH!")

                matches.append({
                    "id": nit_a_base,
                    "file_a": file_a["path"],
                    "file_b": file_b["path"]
                })

    return matches