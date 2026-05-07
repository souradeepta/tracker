import React from "react";
import { ChevronRight } from "lucide-react";
import { usePageStore } from "../store/pages";

export function Breadcrumbs({ pageId }: { pageId: string }) {
  const { pages, setActive } = usePageStore();

  const chain: { id: string; title: string; icon: string }[] = [];
  let current = pages[pageId];
  while (current) {
    chain.unshift({ id: current.id, title: current.title || "Untitled", icon: current.icon });
    current = current.parentId ? pages[current.parentId] : null!;
  }

  if (chain.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500 mb-1 flex-wrap">
      {chain.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 && <ChevronRight size={11} className="flex-shrink-0" />}
          <button
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors
              ${i === chain.length - 1 ? "text-gray-700 dark:text-neutral-200 font-medium" : ""}`}
          >
            <span>{item.icon}</span>
            <span className="truncate max-w-32">{item.title}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
