export type PdfFile = {
  name: string;
  path: string;
};

export type LogType = "info" | "success" | "warn" | "error" | "process";

export type LogEntry = {
  time: string;
  type: LogType;
  message: string;
};

export type ProcessedFile = {
  nit: string;
  status: "uploaded" | "skipped" | "error";
  url?: string;
  reason?: string;
};
// Interfaz para el estado del procesamiento
export interface ProcessStatus {
  isLoading: boolean;
  progress: number;
  currentTask?: string;
}