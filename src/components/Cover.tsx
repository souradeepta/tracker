import { useState } from "react";
import { Image, X } from "lucide-react";
import { usePageStore } from "../store/pages";

export const COVERS: Record<string, string> = {
  aurora: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  sunset: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  ocean:  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  forest: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  fire:   "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  night:  "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  peach:  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  mint:   "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  slate:  "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)",
  rose:   "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  lemon:  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  berry:  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
};

interface Props { pageId: string; cover: string | null; }

export function Cover({ pageId, cover }: Props) {
  const { updateCover } = usePageStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!cover) {
    return (
      <div
        style={{ position: "relative", height: 32, display: "flex", alignItems: "center" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <button
            onClick={() => setPickerOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12,
              color: "var(--text3)", background: "transparent", border: "none",
              cursor: "pointer", padding: "0 4px",
            }}
          >
            <Image size={13} /> Add cover
          </button>
        )}
        {pickerOpen && <CoverPicker onPick={(k) => { updateCover(pageId, k); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 176, width: "100%", background: COVERS[cover] ?? cover }} />
      {hovered && (
        <div style={{ position: "absolute", bottom: 8, right: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 12,
              background: "rgba(255,255,255,0.85)", color: "#374151", padding: "4px 8px",
              borderRadius: 6, border: "none", cursor: "pointer", backdropFilter: "blur(4px)",
            }}
          >
            <Image size={11} /> Change
          </button>
          <button
            onClick={() => updateCover(pageId, null)}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 12,
              background: "rgba(255,255,255,0.85)", color: "#374151", padding: "4px 8px",
              borderRadius: 6, border: "none", cursor: "pointer", backdropFilter: "blur(4px)",
            }}
          >
            <X size={11} /> Remove
          </button>
        </div>
      )}
      {pickerOpen && (
        <div style={{ position: "absolute", bottom: 48, right: 16, zIndex: 40 }}>
          <CoverPicker onPick={(k) => { updateCover(pageId, k); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />
        </div>
      )}
    </div>
  );
}

function CoverPicker({ onPick, onClose }: { onPick: (k: string) => void; onClose: () => void }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      border: "1px solid var(--border)", padding: 12, width: 288,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>Choose a gradient</span>
        <button onClick={onClose} className="icon-btn" style={{ width: 20, height: 20, borderRadius: 4 }}><X size={13} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {Object.entries(COVERS).map(([key, grad]) => (
          <button
            key={key}
            title={key}
            onClick={() => onPick(key)}
            style={{
              height: 40, borderRadius: 8, background: grad, border: "2px solid transparent",
              cursor: "pointer", transition: "transform 100ms, border-color 100ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            }}
          />
        ))}
      </div>
    </div>
  );
}
