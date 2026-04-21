import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
});

// Obtener archivos de una ruta
export const getFiles = (path: string) =>
  API.get(`/files`, { params: { path } });

// Unir PDFs (flujo antiguo)
export const mergePdfs = (data: { files: string[]; outputName: string }) =>
  API.post(`/merge`, data, {
    responseType: "blob",
  });

/**
 * 🔥 NUEVO (con token)
 */
export const uploadAndProcess = (formData: FormData, token: string) => {
  return API.post("/upload-and-process", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", // 🔥 ESTO FALTABA
  });
};
