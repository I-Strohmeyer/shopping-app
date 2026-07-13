import { useState, useEffect, useRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn } from "../../lib/cn";
import { getSuggestedSectionId } from "../../lib/itemSuggestions";
import type { ListItem, ItemHistoryEntry } from "../../store/types";

interface AddItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  editItem: ListItem | null;
}

export function AddItemSheet({
  open,
  onOpenChange,
  listId,
  editItem,
}: AddItemSheetProps) {
  const addItem = useAppStore((s) => s.addItem);
  const updateItem = useAppStore((s) => s.updateItem);
  const history = useAppStore((s) => s.history);
  const sections = useAppStore((s) => s.sections);
  const stores = useAppStore((s) => s.stores);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<ItemHistoryEntry[]>([]);
  const [showSugg, setShowSugg] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  // Tracks whether the user (or history autocomplete) has explicitly chosen a
  // section. When false, the section field is auto-filled from the dictionary.
  const userPickedSection = useRef(false);
  const isEditing = editItem !== null;

  // Populate form when opening
  useEffect(() => {
    if (!open) return;
    userPickedSection.current = false;
    if (editItem) {
      setName(editItem.name);
      setQuantity(editItem.quantity > 0 ? String(editItem.quantity) : "");
      setUnit(editItem.unit);
      setSectionId(editItem.sectionId ?? "");
      setSelectedStores(editItem.storeIds);
      setNotes(editItem.notes ?? "");
      // editing an existing item — treat its section as explicitly set
      userPickedSection.current = true;
    } else {
      setName("");
      setQuantity("");
      setUnit("");
      setSectionId("");
      setSelectedStores([]);
      setNotes("");
    }
  }, [open, editItem]);

  // Autocomplete + dictionary-based section suggestion
  useEffect(() => {
    if (name.trim().length === 0) {
      setSuggestions([]);
      if (!userPickedSection.current) setSectionId("");
      return;
    }
    const q = name.toLowerCase();
    setSuggestions(
      history
        .filter((h) => h.name.toLowerCase().includes(q))
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 6),
    );
    // Auto-fill section from dictionary when user hasn't picked one manually
    if (!userPickedSection.current) {
      const suggested = getSuggestedSectionId(name, sections);
      setSectionId(suggested ?? "");
    }
  }, [name, history, sections]);

  const pickSuggestion = (h: ItemHistoryEntry) => {
    setName(h.name);
    setUnit(h.unit);
    setSectionId(h.sectionId ?? "");
    setSelectedStores(h.storeIds);
    setSuggestions([]);
    setShowSugg(false);
    // Section came from history — treat as explicitly set
    userPickedSection.current = true;
  };

  const toggleStore = (id: string) =>
    setSelectedStores((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const handleSubmit = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      quantity: parseFloat(quantity) || 0,
      unit: unit.trim(),
      sectionId: sectionId || undefined,
      storeIds: selectedStores,
      notes: notes.trim() || undefined,
    };
    if (isEditing && editItem) {
      updateItem(listId, editItem.id, payload);
    } else {
      addItem(listId, payload);
    }
    onOpenChange(false);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Item" : "Add Item"}
      description="Add details about the item"
    >
      <div className="space-y-4">
        {/* Name + autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Item name
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowSugg(true);
            }}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            placeholder="e.g. Apples"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-slate-400 text-xs">
                    {s.unit || "pcs"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity + Unit */}
        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <Input
              label="Qty"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="kg, L, pcs…"
            />
          </div>
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Section / Aisle
          </label>
          <SelectPrimitive.Root
            value={sectionId}
            onValueChange={(val) => {
              setSectionId(val);
              userPickedSection.current = true;
            }}
          >
            <SelectPrimitive.Trigger className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 data-[placeholder]:text-slate-400 text-slate-900">
              <SelectPrimitive.Value placeholder="Choose section…" />
              <SelectPrimitive.Icon>
                <ChevronDown size={16} className="text-slate-400" />
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                position="popper"
                sideOffset={4}
                className="z-[100] w-[var(--radix-select-trigger-width)] bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <SelectPrimitive.Viewport className="p-1 max-h-60">
                  <SelectPrimitive.Item
                    value=""
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-slate-500 data-[highlighted]:bg-slate-50"
                  >
                    <SelectPrimitive.ItemText>None</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check size={14} className="text-emerald-500" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                  {sortedSections.map((sec) => (
                    <SelectPrimitive.Item
                      key={sec.id}
                      value={sec.id}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-slate-700 data-[highlighted]:bg-slate-50"
                    >
                      <SelectPrimitive.ItemText>
                        {sec.name}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator>
                        <Check size={14} className="text-emerald-500" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>

        {/* Store multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Available at
          </label>
          <div className="flex flex-wrap gap-2">
            {stores.map((store) => {
              const selected = selectedStores.includes(store.id);
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => toggleStore(store.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selected
                      ? "text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                  style={
                    selected
                      ? {
                          backgroundColor: store.color,
                          outline: `2px solid ${store.color}`,
                          outlineOffset: "2px",
                        }
                      : {}
                  }
                >
                  {store.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes…"
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {isEditing ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
