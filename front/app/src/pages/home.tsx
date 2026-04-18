import { useRef, useEffect } from "react";
import { HiOutlineTerminal, HiOutlineTrash, HiOutlineDocumentText } from "react-icons/hi";
import { VscCheckAll, VscWarning, VscError, VscInfo } from "react-icons/vsc";
import FolderSelector from "../components/FolderSelector";
import { useProcessPdf } from "../hooks/useProcessPdf";
import type { LogType } from "../types/pdf";

import { useMsal } from "@azure/msal-react";

export default function Home() {
  const { merge, logs, isLoading, clearLogs, progress } = useProcessPdf();
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTo({ top: consoleRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case "success": return <VscCheckAll className="text-emerald-400 mt-0.5" />;
      case "warn":    return <VscWarning className="text-amber-400 mt-0.5" />;
      case "error":   return <VscError className="text-rose-400 mt-0.5" />;
      case "process": return <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mt-1.5 shrink-0" />;
      default:        return <VscInfo className="text-sky-400 mt-0.5" />;
    }
  };

  const logColor = (type: LogType) => {
    switch (type) {
      case "success": return "text-emerald-300 font-semibold";
      case "warn":    return "text-yellow-300 font-semibold";
      case "error":   return "text-red-400 font-bold";
      case "process": return "text-indigo-300 italic";
      default:        return "text-sky-300";
    }
  };

    const { accounts } = useMsal();
    const user = accounts[0];
    console.log(user?.username); // correo

  return (
    <div className="min-h-screen bg-black text-zinc-300 selection:bg-indigo-500/30 overflow-hidden relative"
         style={{ fontFamily: "'Space Mono', monospace" }}>

      {/* Grid background */}
      <div className="fixed inset-0 z-0"
           style={{
             backgroundImage: `linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)`,
             backgroundSize: "48px 48px"
           }} />

      {/* Scan line */}
      <div className="fixed left-0 right-0 h-px z-10 pointer-events-none"
           style={{
             background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
             animation: "scanDown 6s linear infinite"
           }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes scanDown {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }
        @keyframes orbit { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .console-scrollbar::-webkit-scrollbar { width: 4px; }
        .console-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .console-scrollbar::-webkit-scrollbar-thumb { background: #222234; border-radius: 2px; }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-8">

        {/* ── HEADER ── */}
        <header className="flex items-end justify-between">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: -2, color: "#fff" }}>
              PDF<span style={{ color: "transparent", WebkitTextStroke: "2px #6366f1" }}>Merge</span>
            </h1>
            <p className="text-[11px] tracking-[0.3em] uppercase text-indigo-500 mt-2">
              Procesamiento de alto rendimiento
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500 border border-indigo-500/30 bg-indigo-500/5"
               style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
            <span className="relative flex w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-indigo-500 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-indigo-500" />
            </span>
            Engine Active
          </div>
        </header>

        {/* ── MAIN CARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT: SELECTOR ── */}
          <main className="relative bg-[#0c0d11] border border-white/10 p-8 overflow-hidden">
          {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px"
               style={{ background: "linear-gradient(90deg, transparent, #6366f1, transparent)" }} />
            {/* Corner marks */}
            {(["tl","tr","bl","br"] as const).map(c => (
              <div key={c} className="absolute w-4 h-4 border-indigo-500" style={{
                borderStyle: "solid",
                top:    c.startsWith("t") ? 0 : "auto",
                bottom: c.startsWith("b") ? 0 : "auto",
                left:   c.endsWith("l")   ? 0 : "auto",
                right:  c.endsWith("r")   ? 0 : "auto",
                borderWidth: `${c.startsWith("t") ? 2 : 0}px ${c.endsWith("r") ? 2 : 0}px ${c.startsWith("b") ? 2 : 0}px ${c.endsWith("l") ? 2 : 0}px`,
              }} />
            ))}
            <span className="absolute top-4 right-5 text-[9px] tracking-widest text-indigo-500/15 font-mono">
              0x4D455247455F50444600
            </span>

          <FolderSelector 

        onSelect={merge} 
        isLoading={isLoading} 
        progress={progress} 
      
           />
        </main>

         {/* ── RIGHT: CONSOLE ── */}
        <div className="space-y-3">

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 text-indigo-400 text-[11px] uppercase tracking-[0.3em]">
              <HiOutlineTerminal size={16} />
              Live Output
            </div>

            <button
              onClick={clearLogs}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-rose-400 transition-colors active:scale-95 font-bold"
            >
              <HiOutlineTrash size={13} />
              Borrar logs
            </button>
          </div>

          <div className="bg-[#050507] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">

            {/* top bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-indigo-500/20 bg-indigo-500/5">
              <span className="text-[10px] text-indigo-300 tracking-widest uppercase">
                terminal — bash
              </span>
              <span className="text-[10px] text-indigo-400">UTF-8</span>
            </div>

            <div
              ref={consoleRef}
              className="h-80 overflow-y-auto p-5 text-[13px] leading-relaxed console-scrollbar"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <HiOutlineDocumentText size={52} className="text-indigo-500 opacity-20" />
                  <p className="text-[11px] uppercase tracking-[0.35em] text-indigo-400/40">
                    Ready for instructions
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 items-start">

                      <span className="text-[10px] text-zinc-500 min-w-[55px]">
                        {log.time}
                      </span>

                      <span>{getLogIcon(log.type)}</span>

                      <span className={`${logColor(log.type)} text-[13px]`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
        

        {/* ── FOOTER ── */}
        <footer className="pt-6 border-t border-white/[0.04] flex justify-between items-center text-[9px] tracking-[0.25em] uppercase text-green-300">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            Security Verified
          </div>
        </footer>
      </div>
    </div>
  );
}