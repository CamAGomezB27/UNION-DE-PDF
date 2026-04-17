import { useState } from "react";
import { uploadAndProcess } from "../api/pdfService";
import type { LogEntry, LogType } from "../types/pdf";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";

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

      addLog("process", "Autenticando usuario...");

      // 🔐 obtener token
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const accessToken = tokenResponse.accessToken;

      addLog("process", "Subiendo archivos...");

      // 📦 FormData
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // 🔥 fake progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 300);

      // 🚀 request
      await uploadAndProcess(formData, accessToken);

      clearInterval(interval);
      setProgress(100);

      addLog("success", "Archivo subido a SharePoint");

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