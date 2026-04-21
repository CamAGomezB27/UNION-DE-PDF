from collections import defaultdict
from app.utils.regex_utils import extract_nit

def group_by_nit(files):
    groups = defaultdict(list)

    for file in files:
        nit = extract_nit(file["text"], file["filename"])

        if not nit:
            continue

        nit_base = nit[:9]

        print(f"{file['filename']} -> {nit_base}")

        groups[nit_base].append(file["path"])

    return groups