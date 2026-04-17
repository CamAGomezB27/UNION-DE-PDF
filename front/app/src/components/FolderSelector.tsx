import { useState } from "react";

type Props = {
  files: string[];
  onLoad: (path: string) => void;
  onSelect: (selected: string[]) => void;
};

export default function FolderSelector({
  files,
  onLoad,
  onSelect,
}: Props) {
  const [path, setPath] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleFile = (file: string) => {
    setSelected((prev) =>
      prev.includes(file)
        ? prev.filter((f) => f !== file)
        : [...prev, file]
    );
  };

  return (
    <div className="p-4 border rounded-xl">
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Ruta: /home/user/pdf"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={() => onLoad(path)}
        >
          Cargar
        </button>
      </div>

      <ul className="max-h-64 overflow-auto">
        {files.map((file) => (
          <li key={file} className="flex gap-2">
            <input
              type="checkbox"
              onChange={() => toggleFile(file)}
            />
            <span>{file}</span>
          </li>
        ))}
      </ul>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        onClick={() => onSelect(selected)}
      >
        Unir PDFs
      </button>
    </div>
  );
}