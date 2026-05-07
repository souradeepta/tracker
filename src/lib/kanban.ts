import type { Page, PageStatus } from "../types";

export interface KanbanColumn {
  status: PageStatus;
  label: string;
  color: string;
  pages: Page[];
}

const COLUMN_ORDER: { status: PageStatus; label: string; color: string }[] = [
  { status: "none",        label: "No Status",   color: "#94a3b8" },
  { status: "todo",        label: "Todo",         color: "#60a5fa" },
  { status: "in-progress", label: "In Progress",  color: "#fbbf24" },
  { status: "done",        label: "Done",         color: "#34d399" },
];

export function groupPagesByStatus(pages: Page[]): KanbanColumn[] {
  const buckets: Record<PageStatus, Page[]> = {
    none: [], todo: [], "in-progress": [], done: [],
  };
  for (const page of pages) {
    buckets[page.status].push(page);
  }
  return COLUMN_ORDER.map(({ status, label, color }) => ({
    status, label, color, pages: buckets[status],
  }));
}
