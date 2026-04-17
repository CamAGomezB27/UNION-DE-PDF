import { useRef, useEffect } from "react";

type Props = {
  onSelect: (files: FileList) => void;
  isLoading: boolean;
  progress: number;
};

export default function FolderSelector({ onSelect, isLoading, progress }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.setAttribute("webkitdirectory", "true");
  }, []);

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border border-dashed border-indigo-500/35 bg-indigo-500/[0.03] p-14 text-center cursor-pointer transition-all duration-300 hover:border-indigo-500/70 hover:bg-indigo-500/[0.06] group overflow-hidden"
      >
        {/* Radial glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

        {/* Orbiting icon */}
        <div className="relative w-18 h-18 mx-auto mb-5" style={{ width: 72, height: 72 }}>
          <div className="absolute inset-[-8px] border border-indigo-500/20 rounded-full"
               style={{ animation: "orbit 8s linear infinite" }} />
          <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="10" y="8" width="36" height="46" rx="3" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
            <path d="M46 8 L56 18 L46 18 Z" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.4)" strokeWidth="1"/>
            <line x1="20" y1="24" x2="42" y2="24" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5"/>
            <line x1="20" y1="30" x2="42" y2="30" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>
            <line x1="20" y1="36" x2="33" y2="36" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"/>
            <circle cx="52" cy="52" r="12" fill="#0c0d11" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5"/>
            <line x1="52" y1="46" x2="52" y2="58" stroke="#6366f1" strokeWidth="2"/>
            <line x1="46" y1="52" x2="58" y2="52" stroke="#6366f1" strokeWidth="2"/>
          </svg>
        </div>

        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}
           className="text-xl text-white tracking-tight mb-2">
          Seleccionar Carpeta
        </p>
        <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-600 mb-7">
          Arrastra o haz clic para seleccionar archivos PDF
        </p>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 hover:bg-indigo-400 active:scale-[0.97] relative overflow-hidden group/btn"
          style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
        >
          <span className="absolute inset-0 bg-white/15 -translate-x-full skew-x-[-15deg] group-hover/btn:translate-x-full transition-transform duration-500" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Cargar Documentos
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => { if (e.target.files) onSelect(e.target.files); }}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          <div className="h-px bg-indigo-500/10 overflow-hidden">
            <div className="h-full w-3/5"
                 style={{
                   background: "linear-gradient(90deg, #6366f1, #a5b4fc, #6366f1)",
                   backgroundSize: "200%",
                   animation: "shimmer 1.5s ease infinite"
                 }} />
          </div>
          <p className="text-[11px] text-indigo-500 tracking-wide font-mono">
            ↯ Procesando documentos... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}