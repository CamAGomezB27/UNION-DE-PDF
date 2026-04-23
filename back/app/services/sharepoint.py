import os
import requests
import re
from datetime import datetime
from pdf2image import convert_from_path
from app.utils.month_utils import get_month_name
import pytesseract
from app.utils.log_utils import add_log, log


def extract_date_from_pdf(file_path):
    try:
        images = convert_from_path(file_path)
        text = ""

        for img in images:
            text += pytesseract.image_to_string(img, lang="spa")

        # formato 2025-01-29
        match = re.search(r"(\d{4})[-/](\d{2})[-/](\d{2})", text)
        if match:
            year, month, _ = match.groups()
            return year, month

        # formato 29/01/2025
        match = re.search(r"(\d{2})/(\d{2})/(\d{4})", text)
        if match:
            _, month, year = match.groups()
            return year, month

    except Exception as e:
        log("Error leyendo fecha: " + str(e))

    today = datetime.today()
    return str(today.year), f"{today.month:02}"


def ensure_folder(drive_id, path, token):
    url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{path}"

    headers = {"Authorization": token}

    res = requests.get(url, headers=headers)

    # ✔ ya existe
    if res.status_code == 200:
        return

    # ❌ no existe → crear
    parent = "/".join(path.split("/")[:-1])
    folder_name = path.split("/")[-1]

    if parent:
        create_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{parent}:/children"
    else:
        create_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root/children"

    body = {
        "name": folder_name,
        "folder": {},
        "@microsoft.graph.conflictBehavior": "rename"
    }

    requests.post(create_url, headers={
        "Authorization": token,
        "Content-Type": "application/json"
    }, json=body)

def file_exists(drive_id, path, token):
    url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{path}"

    headers = {
        "Authorization": token,
        "Accept": "application/json"
    }

    res = requests.get(url, headers=headers)

    return res.status_code == 200

def upload_to_sharepoint(file_path: str, token: str, job_id: str, user_display: str = None):
    filename = os.path.basename(file_path)

    drive_id = os.getenv("SHAREPOINT_DRIVE_ID")

    year, month = extract_date_from_pdf(file_path)

    add_log(job_id, f"📅 Año: {year}, Mes: {month}")
    
    if user_display:
        add_log(job_id, f"👤 Usuario SharePoint: {user_display}")

    base = "FC CONSOLIDADOS"
    year_path = f"{base}/{year}"
    month_name = get_month_name(month)
    month_path = f"{year_path}/{month_name}"

    ensure_folder(drive_id, base, token)
    ensure_folder(drive_id, year_path, token)
    ensure_folder(drive_id, month_path, token)

    upload_path = f"{month_path}/{filename}"

    if file_exists(drive_id, upload_path, token):
        log(f"⚠️ Ya existe: {upload_path}")

        # obtener metadata y devolver URL sin re-subir
        meta_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{upload_path}"
        
        headers = {
            "Authorization": token,
            "Accept": "application/json"
        }

        meta_res = requests.get(meta_url, headers=headers)

        web_url = None
        if meta_res.status_code == 200:
            web_url = meta_res.json().get("webUrl")

        return {
            "webUrl": web_url,
            "status": "skipped"
        }
    

    # ✅ UPLOAD CORRECTO
    url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{upload_path}:/content"

    headers = {
        "Authorization": token,
        "Content-Type": "application/pdf"
    }

    with open(file_path, "rb") as f:
        res = requests.put(url, headers=headers, data=f)

    log("📦 RESPUESTA UPLOAD: " + res.text)

    if res.status_code not in [200, 201]:
        raise Exception(f"Upload failed: {res.status_code} {res.text}")

    # ✅ METADATA CORRECTA
    meta_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/{upload_path}"

    meta_res = requests.get(meta_url, headers=headers)

    if meta_res.status_code != 200:
        raise Exception(f"Meta failed: {meta_res.status_code} {meta_res.text}")

    web_url = meta_res.json().get("webUrl")
    
    # 🔐 Intentar actualizar el campo "createdBy" con el usuario
    if user_display:
        try:
            item_id = meta_res.json().get("id")
            if item_id:
                # Actualizar campos del listItem
                fields_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/items/{item_id}/fields"
                
                update_headers = {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
                
                # Campo personalizado para registrar el usuario
                update_body = {
                    "CreatedByUser": user_display
                }
                
                update_res = requests.patch(fields_url, headers=update_headers, json=update_body)
                add_log(job_id, f"📤 RESPUESTA ACTUALIZACION: {update_res.status_code} - {update_res.text}")
                
                if update_res.status_code in [200, 201]:
                    add_log(job_id, f"✅ Usuario registrado en SharePoint: {user_display}")
                else:
                    add_log(job_id, f"⚠️ No se pudo registrar usuario. Error: {update_res.status_code}")
        except Exception as e:
            add_log(job_id, f"⚠️ Error al actualizar usuario: {str(e)}")

    return {
        "webUrl": web_url,
        "status": "uploaded"
    }