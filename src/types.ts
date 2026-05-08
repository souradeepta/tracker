import type { PartialBlock } from "@blocknote/core";

export type PageStatus = "none" | "todo" | "in-progress" | "done";
export type PagePriority = "none" | "low" | "medium" | "high";

export interface Page {
  id: string;
  title: string;
  content: PartialBlock[];
  parentId: string | null;
  icon: string;
  cover: string | null;
  favorited: boolean;
  deleted: boolean;
  deletedAt: number | null;
  locked: boolean;
  description?: string;
  tags: string[];
  status: PageStatus;
  priority: PagePriority;
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  key: string;
  name: string;
  icon: string;
  description: string;
  content: PartialBlock[];
}
