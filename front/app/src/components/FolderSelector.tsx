import { useState } from "react";
import type { PdfFile } from "../types/pdf";

type Props = {
  files: PdfFile[];
  onLoad: (path: string) => void;
  onSelect: (selected: PdfFile[]) => void;
  isLoading: boolean;
  progress: number;
};

export default function FolderSelector({
  files,
  onLoad,
  onSelect,
  isLoading,
  progress,
}: Props) {
  const [path, setPath] = useState("");
  const [selected, setSelected] = useState<PdfFile[]>([]);

  const toggleFile = (file: PdfFile) => {
    setSelected((prev) =>
      prev.find((f) => f.path === file.path)
        ? prev.filter((f) => f.path !== file.path)
        : [...prev, file]
    );
  };

  return (
    <div className="p-4 border rounded-xl">
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Ruta"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <button
          onClick={() => onLoad(path)}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Cargar
        </button>
      </div>

      <ul>
        {files.map((file) => (
          <li key={file.path}>
            <input
              type="checkbox"
              onChange={() => toggleFile(file)}
            />
            {file.name}
          </li>
        ))}
      </ul>

      {isLoading && (
        <div className="mt-2 text-sm">Procesando... {progress}%</div>
      )}

      <button
        onClick={() => onSelect(selected)}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Unir PDFs
      </button>
    </div>
  );
}