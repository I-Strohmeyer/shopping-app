import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutList,
  Building2,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Header } from "../components/layout/Header";
import { ListCard } from "../components/lists/ListCard";
import { cn } from "../lib/cn";
import type { Store, Section } from "../store/types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoreGroup {
  listId: string;
  listName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    sectionId?: string;
  }>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const lists = useAppStore((s) => s.lists);
  const stores = useAppStore((s) => s.stores);
  const sections = useAppStore((s) => s.sections);

  const [tab, setTab] = useState<"lists" | "store">("lists");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const activeLists = useMemo(
    () => lists.filter((l) => !l.isArchived),
    [lists],
  );
  const archivedLists = useMemo(
    () => lists.filter((l) => l.isArchived),
    [lists],
  );

  // Stores that have ≥1 unchecked item across active lists
  const storesWithItems = useMemo(() => {
    const seen = new Set<string>();
    for (const list of activeLists)
      for (const item of list.items)
        if (!item.checked) item.storeIds.forEach((id) => seen.add(id));
    return stores.filter((s) => seen.has(s.id));
  }, [activeLists, stores]);

  // Fall back to first available store when nothing is selected
  const effectiveStoreId = selectedStoreId ?? storesWithItems[0]?.id ?? null;
  const selectedStore = stores.find((s) => s.id === effectiveStoreId) ?? null;

  // Items grouped by list for the selected store (unchecked only)
  const storeGroups = useMemo((): StoreGroup[] => {
    if (!effectiveStoreId) return [];
    return activeLists
      .map((list) => ({
        listId: list.id,
        listName: list.name,
        items: list.items
          .filter((i) => !i.checked && i.storeIds.includes(effectiveStoreId))
          .map(({ id, name, quantity, unit, sectionId }) => ({
            id,
            name,
            quantity,
            unit,
            sectionId,
          })),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeLists, effectiveStoreId]);

  return (
    <div>
      <Header title="My IDNA" />

      <div className="p-4 max-w-4xl">
        {/* ── Tab toggle ── */}
        <div className="flex gap-1 p-1 bg-slate-200 rounded-xl mb-4 w-fit">
          <button
            onClick={() => setTab("lists")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              tab === "lists"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <LayoutList size={14} />
            Lists
          </button>
          <button
            onClick={() => setTab("store")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              tab === "store"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Building2 size={14} />
            By Store
          </button>
        </div>

        {/* ── Lists view ── */}
        {tab === "lists" && (
          <>
            {activeLists.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            )}

            {archivedLists.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setArchivedOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  {archivedOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  Archived ({archivedLists.length})
                </button>

                {archivedOpen && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {archivedLists.map((list) => (
                      <ListCard key={list.id} list={list} archived />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── By Store view ── */}
        {tab === "store" && (
          <StoreView
            storesWithItems={storesWithItems}
            selectedStore={selectedStore}
            selectedStoreId={effectiveStoreId}
            onSelectStore={setSelectedStoreId}
            groups={storeGroups}
            sections={sections}
          />
        )}
      </div>
    </div>
  );
}

// ── Store view ────────────────────────────────────────────────────────────────
interface StoreViewProps {
  storesWithItems: Store[];
  selectedStore: Store | null;
  selectedStoreId: string | null;
  onSelectStore: (id: string) => void;
  groups: StoreGroup[];
  sections: Section[];
}

function StoreView({
  storesWithItems,
  selectedStore,
  selectedStoreId,
  onSelectStore,
  groups,
  sections,
}: StoreViewProps) {
  const navigate = useNavigate();

  if (storesWithItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          No items are tagged to a store yet. Open a list and assign stores to
          your items.
        </p>
      </div>
    );
  }

  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="space-y-4">
      {/* Store chips */}
      <div className="flex gap-2 flex-wrap">
        {storesWithItems.map((store) => (
          <button
            key={store.id}
            onClick={() => onSelectStore(store.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
              selectedStoreId === store.id
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
            )}
            style={
              selectedStoreId === store.id
                ? { backgroundColor: store.color }
                : {}
            }
          >
            {store.name}
          </button>
        ))}
      </div>

      {/* Summary */}
      {selectedStore && (
        <p className="text-xs text-slate-500">
          {totalItems === 0
            ? `Nothing left to buy at ${selectedStore.name}`
            : `${totalItems} item${totalItems !== 1 ? "s" : ""} to buy at ${selectedStore.name}`}
        </p>
      )}

      {/* Groups */}
      {groups.length === 0 ? (
        <p className="py-10 text-center text-slate-500 text-sm">
          No unchecked items for this store
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.listId}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              {/* List header — tapping navigates to that list */}
              <button
                onClick={() => navigate(`/list/${group.listId}`)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {group.listName}
                </span>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <span className="text-xs">
                    {group.items.length}{" "}
                    {group.items.length !== 1 ? "items" : "item"}
                  </span>
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Items */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => {
                  const section = sections.find((s) => s.id === item.sectionId);
                  const qtyLabel = [
                    item.quantity > 0 ? item.quantity : "",
                    item.unit,
                  ]
                    .filter(Boolean)
                    .join("\u00a0");

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: selectedStore?.color ?? "#94a3b8",
                        }}
                      />
                      <span className="flex-1 text-sm text-slate-800">
                        {item.name}
                      </span>
                      {qtyLabel && (
                        <span className="text-xs text-slate-500 shrink-0">
                          {qtyLabel}
                        </span>
                      )}
                      {section && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full shrink-0 leading-none">
                          {section.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty state (Lists tab) ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-5">
        <ShoppingCart size={36} className="text-emerald-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        No lists yet
      </h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Tap the <strong className="text-slate-500">+</strong> button to create
        your first shopping list
      </p>
    </div>
  );
}
