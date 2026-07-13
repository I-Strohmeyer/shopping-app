import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { cn } from "../../lib/cn";
import type { ListItem } from "../../store/types";

interface ItemRowProps {
  item: ListItem;
  listId: string;
  onEdit: () => void;
}

export function ItemRow({ item, listId, onEdit }: ItemRowProps) {
  const toggleItem = useAppStore((s) => s.toggleItem);
  const deleteItem = useAppStore((s) => s.deleteItem);
  const stores = useAppStore((s) => s.stores);

  const itemStores = stores.filter((s) => item.storeIds.includes(s.id));
  const qtyLabel = [item.quantity > 0 ? item.quantity : "", item.unit]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 group",
        "hover:border-slate-200 transition-colors",
      )}
    >
      {/* Checkbox */}
      <CheckboxPrimitive.Root
        checked={item.checked}
        onCheckedChange={() => toggleItem(listId, item.id)}
        className={cn(
          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
          item.checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-slate-300 hover:border-emerald-400",
        )}
        aria-label={`Mark ${item.name} as ${item.checked ? "unchecked" : "checked"}`}
      >
        <CheckboxPrimitive.Indicator>
          <Check size={11} className="text-white" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm font-medium text-slate-900 truncate",
              item.checked && "line-through text-slate-400",
            )}
          >
            {item.name}
          </span>
          {qtyLabel && (
            <span className="text-xs text-slate-400 shrink-0">{qtyLabel}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {itemStores.map((store) => (
            <span
              key={store.id}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white leading-none"
              style={{ backgroundColor: store.color }}
            >
              {store.name}
            </span>
          ))}
        </div>

        {item.notes && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{item.notes}</p>
        )}
      </div>

      {/* Context menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
            aria-label="Item options"
          >
            <MoreVertical size={14} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[140px] bg-white rounded-xl shadow-lg border border-slate-100 py-1"
            align="end"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer outline-none data-[highlighted]:bg-slate-50"
              onSelect={onEdit}
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer outline-none data-[highlighted]:bg-red-50"
              onSelect={() => deleteItem(listId, item.id)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
