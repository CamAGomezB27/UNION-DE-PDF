import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { uploadAndProcess } from "../api/pdfService";
import { loginRequest } from "../auth/authConfig";
import type { LogEntry, LogType } from "../types/pdf";
import { getProgress } from "../api/progressService";
import { useRef } from "react";

export const useProcessPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastStatusRef = useRef<string | null>(null);
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

        const tokenResponse = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    const accessToken = tokenResponse.accessToken;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    addLog("process", "Inicio lectura de archivos...");

    const res = await uploadAndProcess(formData, accessToken);

    const jobId = res.data.job_id;

    if (!jobId) {
      throw new Error("job_id no recibido del backend");
    }
    if (!jobId) return;

    // 🚀 2. polling de progreso REAL
    const interval = setInterval(async () => {
      try {
        const progressRes = await getProgress(jobId);
        const data = progressRes.data;

        console.log("PROGRESS RESPONSE:", data);
        setProgress(Math.min(100, Math.max(0, Number(data?.progress ?? 0))));

        if (data.status && data.status !== lastStatusRef.current) {
          addLog("process", data.status);
          lastStatusRef.current = data.status;
        }
        // 🧠 cuando termina
        if (data.progress >= 100 || data.status?.includes("SharePoint") || data.status?.includes("existían")) { 
          clearInterval(interval);

          const summary = data.summary;

          if (!summary) return;

          if (summary.uploaded === 0 && summary.skipped === summary.total) {
            addLog("warn", "Todos los archivos ya existían en SharePoint");
          } 
          else if (summary.uploaded === summary.total) {
            addLog("success", "Todos los archivos fueron subidos correctamente");
          } 
          else if (summary.uploaded > 0 && summary.skipped > 0) {
            addLog("success", "Proceso completado: algunos archivos ya existían");
          } 
          else {
            addLog("error", "Proceso completado con errores");
          }

          setIsLoading(false);
          setTimeout(() => setProgress(0), 1200);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        addLog("error", "Error leyendo progreso");
      }
    }, 800);

  } catch (err) {
    console.error(err);
    addLog("error", "Error procesando archivos");
    setIsLoading(false);
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
