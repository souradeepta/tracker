import React, { useEffect, useRef } from "react";
import { Copy, Star, Lock, Trash2, Download, ExternalLink } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props {
  pageId: string;
  x: number;
  y: number;
  onClose: () => void;
  onExport: (id: string) => void;
}

export function ContextMenu({ pageId, x, y, onClose, onExport }: Props) {
  const { pages, toggleFavorite, toggleLocked, trashPage, duplicatePage, setActive } = usePageStore();
  const page = pages[pageId];
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!page) return null;

  const Item = ({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) => (
    <button
      onClick={() => { onClick(); onClose(); }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "6px 12px",
        textAlign: "left", fontSize: 13, border: "none", cursor: "pointer",
        background: "transparent", borderRadius: 6,
        color: danger ? "#dc2626" : "var(--text2)",
        transition: "background 80ms, color 80ms",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = danger ? "#FEF2F2" : "var(--hover)";
        el.style.color = danger ? "#b91c1c" : "var(--text)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "transparent";
        el.style.color = danger ? "#dc2626" : "var(--text2)";
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: Math.min(y, window.innerHeight - 240),
        left: Math.min(x, window.innerWidth - 200),
        zIndex: 50,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        padding: "4px",
        width: 196,
      }}
    >
      <Item icon={<ExternalLink size={13} />} label="Open" onClick={() => setActive(pageId)} />
      <Item icon={<Copy size={13} />} label="Duplicate" onClick={() => duplicatePage(pageId)} />
      <Item
        icon={<Star size={13} fill={page.favorited ? "currentColor" : "none"} />}
        label={page.favorited ? "Unfavorite" : "Add to favorites"}
        onClick={() => toggleFavorite(pageId)}
      />
      <Item icon={<Lock size={13} />} label={page.locked ? "Unlock page" : "Lock page"} onClick={() => toggleLocked(pageId)} />
      <Item icon={<Download size={13} />} label="Export as Markdown" onClick={() => onExport(pageId)} />
      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
      <Item icon={<Trash2 size={13} />} label="Move to trash" danger onClick={() => trashPage(pageId)} />
    </div>
  );
}
