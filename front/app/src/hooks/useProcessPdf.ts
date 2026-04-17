import { useState } from "react";
import { uploadAndProcess } from "../api/pdfService";
import type { LogEntry, LogType } from "../types/pdf";

export const useProcessPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: LogType, message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        type,
        message,
      },
    ]);
  };

  const clearLogs = () => setLogs([]);

  const merge = async (files: FileList) => {
    try {
      setIsLoading(true);

      addLog("info", "Subiendo archivos...");
      addLog("process", "Procesando PDFs con OCR...");

      const res = await uploadAndProcess(files);

      addLog("success", "PDF generado correctamente");

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "resultado.pdf";
      a.click();

    } catch (err) {
      addLog("error", "Error procesando los PDFs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    merge,
    logs,
    isLoading,
    clearLogs,
  };
};