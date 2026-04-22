# UNION-DE-PDF

## Descripción

Proyecto fullstack para procesar y unir archivos PDF en un flujo de carga, análisis y subida a SharePoint.

- Backend: FastAPI + Redis para gestionar el estado, los logs y el progreso de cada job.
- Frontend: React + TypeScript + Vite con UI para subir carpetas/archivos, ver progreso en tiempo real y revisar logs de proceso.

## Estructura del proyecto

- `back/`
  - `app/main.py`: aplicación FastAPI y configuración CORS.
  - `app/api/routes.py`: endpoints disponibles.
  - `app/services/`: lógica de procesamiento, autenticación MS Graph y SharePoint.
  - `app/utils/`: utilidades de logs, progreso y contexto.
  - `requirements.txt`: dependencias Python.
- `front/app/`
  - `package.json`: dependencias y scripts del frontend.
  - `src/`: código React/TypeScript.
  - `vite.config.ts`: configuración de Vite.

## Requisitos

- Python 3.11+ (o compatible con los paquetes de `requirements.txt`)
- Node.js 18+ / npm
- Redis en `localhost:6379`
- Si se usan variables de entorno, crear un archivo `.env` en `back/`.

## Instalación

### Backend

```bash
cd back
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
cd front/app
npm install
```

## Ejecución

### Iniciar Redis

Asegúrate de tener Redis en ejecución en `localhost:6379`.

### Backend

```bash
cd back
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd front/app
npm run dev
```

Luego abre `http://localhost:5173`.

## Endpoints principales

- `GET /health` — healthcheck.
- `POST /merge` — unir manualmente PDFs locales.
- `GET /files?path=<ruta>` — listar PDFs en una ruta de entrada.
- `POST /upload-and-process` — subir archivos PDF y crear un job de procesamiento.
- `GET /progress/{job_id}` — consultar progreso, estado y logs del job.

## Flujo de uso

1. Ejecutar backend y frontend.
2. Seleccionar archivos o carpeta en la UI.
3. Subir los PDFs.
4. El backend inicia un job en segundo plano y devuelve `job_id`.
5. El frontend consulta periódicamente el endpoint de progreso.
6. Ver la barra de progreso y los logs en vivo.

## Notas importantes

- El backend usa Redis para mantener el estado de cada trabajo (`progress`, `status`, `logs`).
- El endpoint `/upload-and-process` devuelve el `job_id` inmediatamente y procesa en background.
- El frontend debe hacer polling de `/progress/{job_id}` para mostrar avance en tiempo real.

## Mejores prácticas

- Para pruebas locales rápidas, puedes permitir CORS con `allow_origins=["*"]` en `back/app/main.py`.
- Si el proyecto se despliega, define variables de entorno para credenciales y configuraciones de SharePoint.
- Limpia los directorios `storage/input` y `storage/output` periódicamente si se generan muchos archivos.
