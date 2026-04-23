import { useMsal } from "@azure/msal-react";
import { useState, useRef, useEffect } from "react";
import { uploadAndProcess } from "../api/pdfService";
import { loginRequest, graphRequest } from "../auth/authConfig";
import type { LogEntry, LogType, ProgressResponse } from "../types/pdf";
import { getProgress } from "../api/progressService";


export const useProcessPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastStatusRef = useRef<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const intervalRef = useRef<number | null>(null);
  const processedLogsRef = useRef<Set<string>>(new Set()); // Para trackear logs ya procesados
  const inputRefRef = useRef<HTMLInputElement | null>(null);

  const { instance, accounts } = useMsal();

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  const resetInput = (inputElement: HTMLInputElement | null) => {
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const merge = async (files: FileList) => {
    try {
      // Limpiar intervalo anterior si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Resetear estado para nuevo procesamiento
      setIsLoading(true);
      setProgress(0);
      lastStatusRef.current = null;
      processedLogsRef.current.clear(); // Limpiar logs procesados

      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const accessToken = tokenResponse.accessToken;

      // Acquire Graph token
      let graphToken: string | undefined;
      try {
        const graphTokenResponse = await instance.acquireTokenSilent({
          ...graphRequest,
          account: accounts[0],
        });
        graphToken = graphTokenResponse.accessToken;
        addLog("process", "✅ Token Graph obtenido");
      } catch (error) {
        addLog("warn", "⚠️ No se pudo obtener token Graph. Se usará token de aplicación.");
        console.warn("Graph token error:", error);
      }

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      addLog("process", "Inicio lectura de archivos...");

      const res = await uploadAndProcess(formData, accessToken, graphToken);
      const jobId = res.data.job_id;

      if (!jobId) throw new Error("job_id no recibido del backend");

      intervalRef.current = setInterval(async () => {
        try {
          const progressRes = await getProgress(jobId);
          const data: ProgressResponse = progressRes.data;

          console.log("PROGRESS RESPONSE:", data);

          setProgress(Math.min(100, Math.max(0, data.progress ?? 0)));

          // 🧠 Procesar TODOS los logs nuevos del backend
          if (data.logs?.length) {
            const newLogs = data.logs.filter(log => !processedLogsRef.current.has(log));
            
            newLogs.forEach(logMessage => {
              if (logMessage.trim()) {
                addLog("process", logMessage);
                processedLogsRef.current.add(logMessage);
              }
            });
          }

          const p = data.progress ?? 0;

          // Solo mostrar mensajes de progreso si no hay logs detallados del backend
          if (!data.logs?.length || data.logs.length === 0) {
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
          }

          // 🧠 FIN
          if (p >= 100) {
            clearInterval(intervalRef.current!);

            // Mostrar el status final del backend si existe
            if (data.status && data.status !== "finalizando...") {
              if (data.status.includes("ya estaban") || data.status.includes("existían")) {
                addLog("warn", `⚠️ ${data.status}`);
              } else if (data.status.includes("correctamente") || data.status.includes("completado")) {
                addLog("success", `✅ ${data.status}`);
              } else if (data.status.includes("errores")) {
                addLog("error", `❌ ${data.status}`);
              } else {
                addLog("success", `✅ ${data.status}`);
              }
            }

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

            setIsLoading(false);
            setTimeout(() => setProgress(0), 1200);
            // Resetear input para permitir seleccionar nuevamente
            resetInput(inputRefRef.current);
          }
        } catch (err) {
          console.error(err);
          clearInterval(intervalRef.current!);
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
    setInputRef: (inputElement: HTMLInputElement | null) => {
      inputRefRef.current = inputElement;
    },
  };
};