import { useRef, useEffect } from "react";

type Props = {
  onSelect: (files: FileList) => void;
  isLoading: boolean;
  progress: number;
};

export default function FolderSelector({
  onSelect,
  isLoading,
  progress,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

  return (
    <div className="p-6 border rounded-xl space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onSelect(e.target.files);
          }
        }}
        className="block w-full text-sm text-zinc-400"
      />

      {isLoading && (
        <div className="text-sm text-blue-400">
          Procesando... {progress}%
        </div>
      )}
    </div>
  );
}