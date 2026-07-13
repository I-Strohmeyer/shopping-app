import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatRelative } from "../../lib/formatDate";
import type { ShoppingList } from "../../store/types";

interface ListCardProps {
  list: ShoppingList;
  archived?: boolean;
}

export function ListCard({ list, archived = false }: ListCardProps) {
  const navigate = useNavigate();
  const deleteList = useAppStore((s) => s.deleteList);
  const archiveList = useAppStore((s) => s.archiveList);
  const restoreList = useAppStore((s) => s.restoreList);
  const updateListName = useAppStore((s) => s.updateListName);
  const stores = useAppStore((s) => s.stores);

  const [renameOpen, setRenameOpen] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const checkedCount = list.items.filter((i) => i.checked).length;
  const totalCount = list.items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  // Unique stores referenced by items
  const listStoreIds = [...new Set(list.items.flatMap((i) => i.storeIds))];
  const listStores = stores
    .filter((s) => listStoreIds.includes(s.id))
    .slice(0, 3);

  const handleRename = () => {
    if (!editName.trim()) return;
    updateListName(list.id, editName.trim());
    setRenameOpen(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/list/${list.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/list/${list.id}`)}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {/* Title row */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {list.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalCount === 0
                ? "Empty"
                : `${checkedCount} / ${totalCount} items`}
              {" · "}
              {formatRelative(list.updatedAt)}
            </p>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                aria-label="List options"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[160px] bg-white rounded-xl shadow-lg border border-slate-100 py-1"
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer outline-none data-[highlighted]:bg-slate-50"
                  onSelect={() => {
                    setEditName(list.name);
                    setRenameOpen(true);
                  }}
                >
                  <Pencil size={14} /> Rename
                </DropdownMenu.Item>

                {archived ? (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer outline-none data-[highlighted]:bg-slate-50"
                    onSelect={() => restoreList(list.id)}
                  >
                    <ArchiveRestore size={14} /> Restore
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer outline-none data-[highlighted]:bg-slate-50"
                    onSelect={() => archiveList(list.id)}
                  >
                    <Archive size={14} /> Archive
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer outline-none data-[highlighted]:bg-red-50"
                  onSelect={() => deleteList(list.id)}
                >
                  <Trash2 size={14} /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {listStores.map((store) => (
              <span
                key={store.id}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: store.color }}
              >
                {store.name}
              </span>
            ))}
            {listStoreIds.length > 3 && (
              <span className="text-[10px] text-slate-400">
                +{listStoreIds.length - 3}
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <ShoppingCart size={12} /> Shop
          </span>
        </div>
      </div>

      {/* Rename Sheet */}
      <Sheet open={renameOpen} onOpenChange={setRenameOpen} title="Rename List">
        <div className="space-y-4">
          <Input
            label="List name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRename}
              disabled={!editName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
