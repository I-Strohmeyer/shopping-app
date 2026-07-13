import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Store,
  Section,
  ShoppingList,
  ListItem,
  ItemHistoryEntry,
} from "./types";
import { DEFAULT_STORES, DEFAULT_SECTIONS } from "../lib/defaults";

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

interface AppState {
  lists: ShoppingList[];
  stores: Store[];
  sections: Section[];
  history: ItemHistoryEntry[];

  // List actions
  createList: (name: string) => string;
  updateListName: (listId: string, name: string) => void;
  deleteList: (listId: string) => void;
  archiveList: (listId: string) => void;
  restoreList: (listId: string) => void;
  importList: (payload: { name: string; items: ListItem[] }) => void;

  // Item actions
  addItem: (
    listId: string,
    item: Omit<ListItem, "id" | "addedAt" | "checked">,
  ) => void;
  updateItem: (
    listId: string,
    itemId: string,
    updates: Partial<Omit<ListItem, "id" | "addedAt">>,
  ) => void;
  deleteItem: (listId: string, itemId: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  clearChecked: (listId: string) => void;

  // Store actions
  addStore: (store: Omit<Store, "id">) => void;
  updateStore: (storeId: string, updates: Partial<Omit<Store, "id">>) => void;
  deleteStore: (storeId: string) => void;

  // Section actions
  addSection: (section: Omit<Section, "id">) => void;
  updateSection: (
    sectionId: string,
    updates: Partial<Omit<Section, "id">>,
  ) => void;
  deleteSection: (sectionId: string) => void;

  // History
  upsertHistory: (
    item: Pick<ListItem, "name" | "unit" | "sectionId" | "storeIds">,
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lists: [],
      stores: DEFAULT_STORES,
      sections: DEFAULT_SECTIONS,
      history: [],

      createList: (name) => {
        const id = uid();
        set((s) => ({
          lists: [
            ...s.lists,
            {
              id,
              name,
              createdAt: now(),
              updatedAt: now(),
              items: [],
              isArchived: false,
            },
          ],
        }));
        return id;
      },

      updateListName: (listId, name) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, name, updatedAt: now() } : l,
          ),
        })),

      deleteList: (listId) =>
        set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),

      archiveList: (listId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, isArchived: true, updatedAt: now() } : l,
          ),
        })),

      restoreList: (listId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, isArchived: false, updatedAt: now() } : l,
          ),
        })),

      importList: (payload) => {
        const newList: ShoppingList = {
          id: uid(),
          name: payload.name,
          createdAt: now(),
          updatedAt: now(),
          isArchived: false,
          items: payload.items.map((item) => ({
            ...item,
            id: uid(),
            checked: false,
            addedAt: now(),
          })),
        };
        set((s) => ({ lists: [...s.lists, newList] }));
      },

      addItem: (listId, item) => {
        const newItem: ListItem = {
          ...item,
          id: uid(),
          checked: false,
          addedAt: now(),
        };
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: [...l.items, newItem], updatedAt: now() }
              : l,
          ),
        }));
        get().upsertHistory(item);
      },

      updateItem: (listId, itemId, updates) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  updatedAt: now(),
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, ...updates } : i,
                  ),
                }
              : l,
          ),
        })),

      deleteItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  updatedAt: now(),
                  items: l.items.filter((i) => i.id !== itemId),
                }
              : l,
          ),
        })),

      toggleItem: (listId, itemId) => {
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  updatedAt: now(),
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, checked: !i.checked } : i,
                  ),
                }
              : l,
          ),
        }));
        if ("vibrate" in navigator) navigator.vibrate(20);
      },

      clearChecked: (listId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  updatedAt: now(),
                  items: l.items.filter((i) => !i.checked),
                }
              : l,
          ),
        })),

      addStore: (store) =>
        set((s) => ({ stores: [...s.stores, { ...store, id: uid() }] })),

      updateStore: (storeId, updates) =>
        set((s) => ({
          stores: s.stores.map((st) =>
            st.id === storeId ? { ...st, ...updates } : st,
          ),
        })),

      deleteStore: (storeId) =>
        set((s) => ({ stores: s.stores.filter((st) => st.id !== storeId) })),

      addSection: (section) =>
        set((s) => ({ sections: [...s.sections, { ...section, id: uid() }] })),

      updateSection: (sectionId, updates) =>
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, ...updates } : sec,
          ),
        })),

      deleteSection: (sectionId) =>
        set((s) => ({
          sections: s.sections.filter((sec) => sec.id !== sectionId),
        })),

      upsertHistory: (item) => {
        const { history } = get();
        const existing = history.find(
          (h) => h.name.toLowerCase() === item.name.toLowerCase(),
        );
        if (existing) {
          set((s) => ({
            history: s.history.map((h) =>
              h.id === existing.id
                ? { ...h, ...item, lastUsed: now(), useCount: h.useCount + 1 }
                : h,
            ),
          }));
        } else {
          set((s) => ({
            history: [
              ...s.history,
              {
                id: uid(),
                name: item.name,
                unit: item.unit,
                sectionId: item.sectionId,
                storeIds: item.storeIds,
                lastUsed: now(),
                useCount: 1,
              },
            ],
          }));
        }
      },
    }),
    { name: "shopping-app-storage" },
  ),
);
