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

export const uploadAndProcess = (files: FileList) => {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  return API.post("/upload-and-process", formData, {
    responseType: "blob",
  });
};