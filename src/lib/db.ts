import Dexie, { type Table } from "dexie";
import type { Page } from "../types";

interface NavState {
  key: "state";
  activePageId: string | null;
  expandedIds: string[];
  recentPageIds: string[];
}

class TrackerDB extends Dexie {
  pages!: Table<Page, string>;
  nav!: Table<NavState, string>;

  constructor() {
    super("tracker-db");
    this.version(1).stores({
      pages: "id, parentId, deleted, updatedAt, createdAt",
      nav: "key",
    });
  }
}

export const db = new TrackerDB();
