import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3033",
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
export const uploadAndProcess = (formData: FormData, token: string, graphToken?: string) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  
  if (graphToken) {
    headers["X-Graph-Token"] = `Bearer ${graphToken}`;
  }
  
  return API.post("/upload-and-process", formData, { headers });
};
