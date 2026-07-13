import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { ItemRow } from "../components/items/ItemRow";
import { AddItemSheet } from "../components/items/AddItemSheet";
import { buildShareUrl } from "../lib/share";
import type { ListItem } from "../store/types";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lists = useAppStore((s) => s.lists);
  const stores = useAppStore((s) => s.stores);
  const sections = useAppStore((s) => s.sections);
  const clearChecked = useAppStore((s) => s.clearChecked);

  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ListItem | null>(null);
  const [checkedOpen, setCheckedOpen] = useState(false);

  const list = lists.find((l) => l.id === id);

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center p-8">
        <p className="text-slate-500 mb-4">List not found</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Go back
        </Button>
      </div>
    );
  }

  // Filter by active store
  const filteredItems = useMemo(
    () =>
      activeStore
        ? list.items.filter((i) => i.storeIds.includes(activeStore))
        : list.items,
    [list.items, activeStore],
  );

  const uncheckedItems = filteredItems.filter((i) => !i.checked);
  const checkedItems = filteredItems.filter((i) => i.checked);

  // Group unchecked items by section (sorted by section.order)
  const groupedItems = useMemo(() => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const groups: {
      sectionId: string | null;
      name: string;
      items: ListItem[];
    }[] = [];

    for (const sec of sorted) {
      const items = uncheckedItems.filter((i) => i.sectionId === sec.id);
      if (items.length > 0)
        groups.push({ sectionId: sec.id, name: sec.name, items });
    }

    // Items with no / unknown section
    const knownIds = new Set(sections.map((s) => s.id));
    const unassigned = uncheckedItems.filter(
      (i) => !i.sectionId || !knownIds.has(i.sectionId),
    );
    if (unassigned.length > 0)
      groups.push({ sectionId: null, name: "Other", items: unassigned });

    return groups;
  }, [uncheckedItems, sections]);

  // Stores that appear in this list (for filter bar)
  const listStoreIds = useMemo(
    () => [...new Set(list.items.flatMap((i) => i.storeIds))],
    [list.items],
  );
  const availableStores = stores.filter((s) => listStoreIds.includes(s.id));

  const handleShare = async () => {
    const url = buildShareUrl(list);
    try {
      if (navigator.share) {
        await navigator.share({ title: list.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Share link copied to clipboard!");
      }
    } catch {
      // User cancelled or clipboard unavailable
    }
  };

  const sheetOpen = addOpen || editItem !== null;
  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false);
      setEditItem(null);
    }
  };

  return (
    <div>
      <Header
        title={list.name}
        onBack={() => navigate("/")}
        right={
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            aria-label="Share list"
          >
            <Share2 size={18} />
          </button>
        }
      />

      {/* Store filter chips */}
      {availableStores.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveStore(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeStore === null
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {availableStores.map((store) => (
            <button
              key={store.id}
              onClick={() =>
                setActiveStore(activeStore === store.id ? null : store.id)
              }
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeStore === store.id
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={
                activeStore === store.id ? { backgroundColor: store.color } : {}
              }
            >
              {store.name}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-6 max-w-3xl">
        {/* Empty state */}
        {groupedItems.length === 0 && checkedItems.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-16">
            {activeStore
              ? "No items for this store"
              : "No items yet — tap + to add some"}
          </p>
        )}

        {/* Grouped unchecked items */}
        {groupedItems.map((group) => (
          <div key={group.sectionId ?? "__other"}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {group.name}
              <span className="ml-1.5 font-normal normal-case text-slate-300">
                ({group.items.length})
              </span>
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  listId={list.id}
                  onEdit={() => setEditItem(item)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <button
                onClick={() => setCheckedOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
              >
                {checkedOpen ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
                Got it ({checkedItems.length})
              </button>
              {checkedOpen && (
                <button
                  onClick={() => clearChecked(list.id)}
                  className="ml-auto text-xs text-red-400 hover:text-red-500 transition-colors font-medium"
                >
                  Remove all
                </button>
              )}
            </div>

            {checkedOpen && (
              <div className="space-y-2 opacity-55">
                {checkedItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    listId={list.id}
                    onEdit={() => setEditItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200/60 flex items-center justify-center hover:bg-emerald-600 active:bg-emerald-700 transition-colors z-30 md:bottom-8 md:right-8"
        aria-label="Add item"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <AddItemSheet
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        listId={list.id}
        editItem={editItem}
      />
    </div>
  );
}
