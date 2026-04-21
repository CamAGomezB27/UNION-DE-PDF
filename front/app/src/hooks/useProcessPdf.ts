import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { uploadAndProcess } from "../api/pdfService";
import { loginRequest } from "../auth/authConfig";
import type { LogEntry, LogType } from "../types/pdf";

export const useProcessPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const { instance, accounts } = useMsal();

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

      if (!accounts.length) {
        addLog("error", "No hay usuario autenticado");
        return;
      }

      addLog("process", "Autenticando usuario...");

      // 🔐 TOKEN DEL USUARIO
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const idToken = tokenResponse.idToken;

      addLog("process", "Preparando archivos...");

      // 📦 FormData
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      addLog("process", "Subiendo archivos...");

      // 🔥 progreso simulado
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 300);

      // 🚀 enviar con token (TU LÓGICA ORIGINAL)
      await uploadAndProcess(formData, idToken);

      clearInterval(interval);
      setProgress(100);

      addLog("success", "Proceso completado correctamente");
    } catch (err) {
      console.error(err);
      addLog("error", "Error procesando archivos");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return {
    merge,
    logs,
    isLoading,
    progress,
    clearLogs,
  };
};
