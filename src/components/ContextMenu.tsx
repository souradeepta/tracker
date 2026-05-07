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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!page) return null;

  const Item = ({
    icon,
    label,
    danger,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
    onClick: () => void;
  }) => (
    <button
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm rounded
        ${danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
        }`}
      onClick={() => { onClick(); onClose(); }}
    >
      {icon}
      {label}
    </button>
  );

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: Math.min(y, window.innerHeight - 220),
    left: Math.min(x, window.innerWidth - 200),
  };

  return (
    <div
      ref={ref}
      style={menuStyle}
      className="z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 w-48"
    >
      <Item icon={<ExternalLink size={13} />} label="Open" onClick={() => setActive(pageId)} />
      <Item icon={<Copy size={13} />} label="Duplicate" onClick={() => duplicatePage(pageId)} />
      <Item
        icon={<Star size={13} fill={page.favorited ? "currentColor" : "none"} />}
        label={page.favorited ? "Unfavorite" : "Add to favorites"}
        onClick={() => toggleFavorite(pageId)}
      />
      <Item
        icon={<Lock size={13} />}
        label={page.locked ? "Unlock page" : "Lock page"}
        onClick={() => toggleLocked(pageId)}
      />
      <Item icon={<Download size={13} />} label="Export as Markdown" onClick={() => onExport(pageId)} />
      <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />
      <Item icon={<Trash2 size={13} />} label="Move to trash" danger onClick={() => trashPage(pageId)} />
    </div>
  );
}
