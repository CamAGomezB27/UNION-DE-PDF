import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001", // tu backend FastAPI
});

// Obtener archivos de una ruta
export const getFiles = (path: string) =>
  API.get(`/files`, { params: { path } });

// Unir PDFs
export const mergePdfs = (data: {
  files: string[];
  outputName: string;
}) => API.post(`/merge`, data, { responseType: "blob" });