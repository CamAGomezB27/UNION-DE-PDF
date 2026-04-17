import { useRef, useEffect } from "react";
import FolderSelector from "../components/FolderSelector";
import { useProcessPdf } from "../hooks/useProcessPdf";

export default function Home() {
  const { files, loadFiles, merge, logs, isLoading, progress } = useProcessPdf();
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="bg-red-500 text-white p-4">
  Test Tailwind
</div>
      <h1 className="text-2xl font-medium">Unificador de PDFs</h1>

      <FolderSelector
        files={files}
        onLoad={loadFiles}
        onSelect={merge}
        isLoading={isLoading}
        progress={progress}
      />

      {/* Console */}
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2">
          <span className="text-xs font-medium text-neutral-500">Consola</span>
          <button className="text-xs text-neutral-400 hover:text-neutral-600">Limpiar</button>
        </div>
        <div ref={consoleRef} className="h-40 overflow-y-auto bg-[#0f1117] p-4 font-mono text-xs leading-7">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-neutral-600">{log.time}</span>
              <span className={
                log.type === "success" ? "text-green-400" :
                log.type === "warn" ? "text-amber-400" :
                log.type === "error" ? "text-red-400" : "text-teal-400"
              }>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}