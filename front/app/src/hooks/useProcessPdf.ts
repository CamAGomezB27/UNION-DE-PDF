import { useMsal } from "@azure/msal-react";
import { useState, useRef } from "react";
import { uploadAndProcess } from "../api/pdfService";
import { loginRequest } from "../auth/authConfig";
import type { LogEntry, LogType, ProcessedFile } from "../types/pdf";
import { getProgress } from "../api/progressService";

type ProgressResponse = {
  progress: number;
  status: string;
  summary?: {
    total: number;
    uploaded: number;
    skipped: number;
    errors: number;
  };
  files?: ProcessedFile[];
  logs?: string[];
};

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

      if (!jobId) throw new Error("job_id no recibido del backend");

      const interval = setInterval(async () => {
        try {
          const progressRes = await getProgress(jobId);
          const data: ProgressResponse = progressRes.data;

          console.log("PROGRESS RESPONSE:", data);

          setProgress(Math.min(100, Math.max(0, data.progress ?? 0)));

          // 🧠 logs backend
          if (data.logs?.length) {
            const lastLog = data.logs[data.logs.length - 1];

            if (lastLog !== lastStatusRef.current) {
              addLog("process", lastLog);
              lastStatusRef.current = lastLog;
            }
          }

          const p = data.progress ?? 0;

          if (p >= 5 && p < 20 && lastStatusRef.current !== "upload") {
            addLog("process", "📤 Subiendo archivos al servidor...");
            lastStatusRef.current = "upload";
          }

          if (p >= 20 && p < 50 && lastStatusRef.current !== "process") {
            addLog("process", "⚙️ Procesando PDFs...");
            lastStatusRef.current = "process";
          }

          if (p >= 50 && p < 90 && lastStatusRef.current !== "sharepoint") {
            addLog("process", "☁️ Subiendo a SharePoint...");
            lastStatusRef.current = "sharepoint";
          }

          if (p >= 90 && lastStatusRef.current !== "final") {
            addLog("process", "✅ Finalizando proceso...");
            lastStatusRef.current = "final";
          }

          // 🧠 FIN
          if (p >= 100) {
            clearInterval(interval);

            const summary = data.summary;
            const files = data.files ?? [];

            // logs por archivo
            files.forEach((f) => {
              if (f.status === "skipped") {
                addLog("warn", `⚠️ SKIP NIT ${f.nit}`);
              } else if (f.status === "uploaded") {
                addLog("success", `✅ SUBIDO NIT ${f.nit}`);
              } else {
                addLog("error", `❌ ERROR NIT ${f.nit}`);
              }
            });

            // resumen
            if (summary) {
              if (summary.uploaded === 0 && summary.skipped === summary.total) {
                addLog("warn", "Todos los archivos ya existían en SharePoint");
              } else if (summary.uploaded === summary.total) {
                addLog("success", "Todos los archivos fueron subidos correctamente");
              } else if (summary.uploaded > 0 && summary.skipped > 0) {
                addLog("success", "Proceso completado: algunos archivos ya existían");
              } else {
                addLog("error", "Proceso completado con errores");
              }
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