import { useState } from "react";
import { Image, X } from "lucide-react";
import { usePageStore } from "../store/pages";

export const COVERS: Record<string, string> = {
  aurora: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  sunset: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  forest: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  fire: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  night: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  peach: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  mint: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  slate: "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)",
  rose: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  lemon: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  berry: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
};

interface Props {
  pageId: string;
  cover: string | null;
}

export function Cover({ pageId, cover }: Props) {
  const { updateCover } = usePageStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!cover) {
    return (
      <div className="group relative h-8 flex items-center">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-opacity px-1"
        >
          <Image size={13} />
          Add cover
        </button>
        {pickerOpen && <CoverPicker onPick={(k) => { updateCover(pageId, k); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="h-44 w-full rounded-b-none" style={{ background: COVERS[cover] ?? cover }} />
      <div className="absolute bottom-2 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="bg-white/80 hover:bg-white text-xs text-gray-700 px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm"
        >
          <Image size={11} /> Change
        </button>
        <button
          onClick={() => updateCover(pageId, null)}
          className="bg-white/80 hover:bg-white text-xs text-gray-700 px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm"
        >
          <X size={11} /> Remove
        </button>
      </div>
      {pickerOpen && (
        <div className="absolute bottom-12 right-4 z-40">
          <CoverPicker onPick={(k) => { updateCover(pageId, k); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />
        </div>
      )}
    </div>
  );
}

function CoverPicker({ onPick, onClose }: { onPick: (k: string) => void; onClose: () => void }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 p-3 w-72">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Choose a gradient</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(COVERS).map(([key, grad]) => (
          <button
            key={key}
            title={key}
            onClick={() => onPick(key)}
            className="h-10 rounded-lg hover:scale-105 transition-transform border border-transparent hover:border-gray-300"
            style={{ background: grad }}
          />
        ))}
      </div>
    </div>
  );
}
