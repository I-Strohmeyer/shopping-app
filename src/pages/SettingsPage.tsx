import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Sheet } from "../components/ui/Sheet";
import { cn } from "../lib/cn";
import { PRESET_COLORS } from "../lib/defaults";
import type { Store, Section } from "../store/types";

export default function SettingsPage() {
  const navigate = useNavigate();
  const stores = useAppStore((s) => s.stores);
  const sections = useAppStore((s) => s.sections);
  const addStore = useAppStore((s) => s.addStore);
  const updateStore = useAppStore((s) => s.updateStore);
  const deleteStore = useAppStore((s) => s.deleteStore);
  const addSection = useAppStore((s) => s.addSection);
  const updateSection = useAppStore((s) => s.updateSection);
  const deleteSection = useAppStore((s) => s.deleteSection);

  // Store sheet state
  const [storeSheet, setStoreSheet] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeColor, setStoreColor] = useState(PRESET_COLORS[0]);

  // Section sheet state
  const [sectionSheet, setSectionSheet] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionOrder, setSectionOrder] = useState("");

  const openAddStore = () => {
    setEditStore(null);
    setStoreName("");
    setStoreColor(PRESET_COLORS[0]);
    setStoreSheet(true);
  };
  const openEditStore = (store: Store) => {
    setEditStore(store);
    setStoreName(store.name);
    setStoreColor(store.color);
    setStoreSheet(true);
  };
  const handleSaveStore = () => {
    if (!storeName.trim()) return;
    editStore
      ? updateStore(editStore.id, { name: storeName.trim(), color: storeColor })
      : addStore({ name: storeName.trim(), color: storeColor });
    setStoreSheet(false);
  };

  const openAddSection = () => {
    const maxOrder =
      sections.length > 0 ? Math.max(...sections.map((s) => s.order)) : 0;
    setEditSection(null);
    setSectionName("");
    setSectionOrder(String(maxOrder + 1));
    setSectionSheet(true);
  };
  const openEditSection = (section: Section) => {
    setEditSection(section);
    setSectionName(section.name);
    setSectionOrder(String(section.order));
    setSectionSheet(true);
  };
  const handleSaveSection = () => {
    if (!sectionName.trim()) return;
    const order = parseInt(sectionOrder) || 99;
    editSection
      ? updateSection(editSection.id, { name: sectionName.trim(), order })
      : addSection({ name: sectionName.trim(), order });
    setSectionSheet(false);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <Header title="Settings" onBack={() => navigate("/")} />

      <div className="p-4 max-w-xl space-y-8">
        {/* ── Stores ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stores
            </h2>
            <Button size="sm" variant="secondary" onClick={openAddStore}>
              <Plus size={14} /> Add store
            </Button>
          </div>
          <div className="space-y-2">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: store.color }}
                />
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {store.name}
                </span>
                <button
                  onClick={() => openEditStore(store)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                  aria-label="Edit store"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteStore(store.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
                  aria-label="Delete store"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {stores.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">
                No stores yet
              </p>
            )}
          </div>
        </section>

        {/* ── Sections ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sections / Aisles
            </h2>
            <Button size="sm" variant="secondary" onClick={openAddSection}>
              <Plus size={14} /> Add section
            </Button>
          </div>
          <div className="space-y-2">
            {sortedSections.map((sec) => (
              <div
                key={sec.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
              >
                <span className="w-6 text-xs text-slate-400 text-center font-mono shrink-0">
                  {sec.order}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {sec.name}
                </span>
                <button
                  onClick={() => openEditSection(sec)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                  aria-label="Edit section"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteSection(sec.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
                  aria-label="Delete section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">
                No sections yet
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 px-1">
            Lower order number = appears earlier when shopping.
          </p>
        </section>
      </div>

      {/* ── Store Sheet ── */}
      <Sheet
        open={storeSheet}
        onOpenChange={setStoreSheet}
        title={editStore ? "Edit Store" : "Add Store"}
      >
        <div className="space-y-4">
          <Input
            label="Store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveStore()}
            placeholder="e.g. Whole Foods"
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Colour
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setStoreColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    storeColor === color
                      ? "border-slate-700 scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select colour ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setStoreSheet(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveStore}
              disabled={!storeName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Sheet>

      {/* ── Section Sheet ── */}
      <Sheet
        open={sectionSheet}
        onOpenChange={setSectionSheet}
        title={editSection ? "Edit Section" : "Add Section"}
      >
        <div className="space-y-4">
          <Input
            label="Section name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
            placeholder="e.g. Frozen Foods"
            autoFocus
          />
          <Input
            label="Order (lower = earlier in list)"
            type="number"
            value={sectionOrder}
            onChange={(e) => setSectionOrder(e.target.value)}
            placeholder="1"
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setSectionSheet(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveSection}
              disabled={!sectionName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
