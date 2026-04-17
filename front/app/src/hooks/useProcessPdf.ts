import { useState } from "react";
import { getFiles, mergePdfs } from "../api/pdfService";
import type { PdfFile, LogEntry } from "../types/pdf";

export const useProcessPdf = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        type,
        message,
      },
    ]);
  };

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const res = await getFiles(path);

      // ⚠️ IMPORTANTE: adapta esto a tu backend
      const mapped: PdfFile[] = res.data.map((f: string) => ({
        name: f.split("/").pop(),
        path: f,
      }));

      setFiles(mapped);
      addLog("success", "Archivos cargados");
    } catch {
      addLog("error", "Error cargando archivos");
    } finally {
      setIsLoading(false);
    }
  };

  const merge = async (selected: PdfFile[]) => {
    setIsLoading(true);
    setProgress(0);

    try {
      const res = await mergePdfs({
        files: selected.map((f) => f.path),
        outputName: "resultado.pdf",
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultado.pdf";
      a.click();

      setProgress(100);
      addLog("success", "PDF unido correctamente");
    } catch {
      addLog("error", "Error uniendo PDFs");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files,
    loadFiles,
    merge,
    logs,
    isLoading,
    progress,
  };
};