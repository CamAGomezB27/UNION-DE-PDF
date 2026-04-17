export type PdfFile = {
  name: string;
  path: string;
};

export type LogType = "info" | "success" | "warn" | "error";

export type LogEntry = {
  time: string;
  type: LogType;
  message: string;
};