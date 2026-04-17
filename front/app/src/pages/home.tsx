import { useRef, useEffect } from "react";
import { HiOutlineTerminal, HiOutlineTrash, HiOutlineDocumentText } from "react-icons/hi";
import { VscCheckAll, VscWarning, VscError, VscInfo } from "react-icons/vsc";
import FolderSelector from "../components/FolderSelector";
import { useProcessPdf } from "../hooks/useProcessPdf";
import type { LogType } from "../types/pdf";

export default function Home() {
  const { merge, logs, isLoading, clearLogs } = useProcessPdf();
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTo({
        top: consoleRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case "success": return <VscCheckAll className="text-emerald-400" />;
      case "warn": return <VscWarning className="text-amber-400" />;
      case "error": return <VscError className="text-rose-400" />;
      case "process": return <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mt-1.5" />;
      default: return <VscInfo className="text-blue-400" />;
    }
  };

  return (
    // Fondo principal ultra oscuro
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-12 px-4 selection:bg-indigo-500/30">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header con brillo suave */}
        <header className="flex items-end justify-between px-2">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              PDF<span className="text-indigo-500">Merge</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium">
              Procesamiento de documentos de alto rendimiento
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Engine Active
            </div>
          </div>
        </header>

        {/* Zona de Acción - Tarjeta con contraste sutil */}
        <main className="bg-[#121214] rounded-2xl border border-white/5 shadow-2xl p-8">
          <FolderSelector
            onSelect={merge}
            isLoading={isLoading}
            progress={0} // temporal
          />
        </main>

        {/* Sección de la Consola - Máximo Resalte */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <HiOutlineTerminal className="text-xl text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Live Output</span>
            </div>
            <button 
              onClick={clearLogs}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-400 transition-all active:scale-95"
            >
              <HiOutlineTrash size={16} />
              BORRAR LOGS
            </button>
          </div>

          <div className="console-container ring-1 ring-white/10">
            {/* Toolbar estilo editor de código */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#1a1b1e]/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <span className="ml-4 text-[10px] text-zinc-500 font-mono tracking-wider uppercase">terminal — bash</span>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono italic">UTF-8</div>
            </div>

            <div 
              ref={consoleRef} 
              className="h-72 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed console-scrollbar bg-[#0d0f14]/80"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
                  <HiOutlineDocumentText size={48} className="opacity-20" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Ready for instructions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className="log-entry flex gap-4 group">
                      <span className="text-zinc-600 shrink-0 select-none text-[11px] mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        {log.time}
                      </span>
                      <span className="mt-1 shrink-0 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                        {getLogIcon(log.type)}
                      </span>
                      <span className={`
                        ${log.type === "success" ? "text-emerald-400 brightness-110" : ""}
                        ${log.type === "warn" ? "text-amber-300" : ""}
                        ${log.type === "error" ? "text-rose-400 font-bold" : ""}
                        ${log.type === "process" ? "text-indigo-400 italic" : ""}
                        ${log.type === "info" ? "text-sky-400" : ""}
                        text-zinc-300
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {/* Cursor parpadeante al final de los logs */}
                  <div className="w-2 h-4 bg-indigo-500/50 animate-pulse inline-block ml-2" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Dark */}
        <footer className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
          <p>© 2026 Innovasoft Systems</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Security Verified
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}