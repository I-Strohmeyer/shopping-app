import { useState } from "react";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Header } from "../components/layout/Header";
import { ListCard } from "../components/lists/ListCard";

export default function HomePage() {
  const lists = useAppStore((s) => s.lists);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const activeLists = lists.filter((l) => !l.isArchived);
  const archivedLists = lists.filter((l) => l.isArchived);

  return (
    <div>
      <Header title="My Lists" />

      <div className="p-4">
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
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3"
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
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5">
        <ShoppingCart size={36} className="text-emerald-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        No lists yet
      </h2>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
        Tap the <strong className="text-slate-500">+</strong> button to create
        your first shopping list
      </p>
    </div>
  );
}
