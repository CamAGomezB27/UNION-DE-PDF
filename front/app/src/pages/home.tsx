import FolderSelector from "../components/FolderSelector";
import { useProcessPdf } from "../hooks/useProcessPdf";

export default function Home() {
  const { files, loadFiles, merge, logs } = useProcessPdf();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Unificador de PDFs</h1>

      <FolderSelector
        files={files}
        onLoad={loadFiles}
        onSelect={merge}
      />

      <div className="bg-black text-green-400 p-4 rounded h-40 overflow-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}