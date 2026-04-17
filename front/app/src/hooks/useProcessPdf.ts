import { useState } from "react";
import { uploadAndProcess } from "../api/pdfService";
import type { LogEntry, LogType } from "../types/pdf";

export const useProcessPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // ✅ FALTABA
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
      setProgress(0);

      addLog("process", "Subiendo archivos...");
      
      // 🔥 simulación de progreso
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 200);

      const res = await uploadAndProcess(files);

      clearInterval(interval);

      addLog("process", "Procesando PDFs...");
      setProgress(100);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "resultado.pdf";
      a.click();

      addLog("success", "PDF generado correctamente");

    } catch (err) {
      console.error(err);
      addLog("error", "Error procesando los archivos");
    } finally {
      setIsLoading(false);

      setTimeout(() => setProgress(0), 1200);
    }
  };

  return {
    merge,
    logs,
    isLoading,
    progress, // ✅ EXPORTARLO
    clearLogs,
  };
};