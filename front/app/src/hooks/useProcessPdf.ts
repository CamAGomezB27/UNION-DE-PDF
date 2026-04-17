import { useState } from "react";
import { getFiles, mergePdfs } from "../api/pdfService";

export const useProcessPdf = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await getFiles(path);
      setFiles(res.data);
      setLogs((prev) => [...prev, "Archivos cargados"]);
      } catch (error) {
        console.error("Error cargando archivos:", error); // opcional pero muy útil
        setLogs((prev) => [...prev, "Error cargando archivos"]);
      } finally {
      setLoading(false);
    }
  };

  const merge = async (selected: string[]) => {
    setLoading(true);
    try {
      const res = await mergePdfs({
        files: selected,
        outputName: "resultado.pdf",
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultado.pdf";
      a.click();

      setLogs((prev) => [...prev, "PDF unido correctamente"]);
    } catch {
      setLogs((prev) => [...prev, "Error uniendo PDFs"]);
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    logs,
    loadFiles,
    merge,
  };
};