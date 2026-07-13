import type { Store, Section } from "../store/types";

export const DEFAULT_STORES: Store[] = [
  { id: "rewe", name: "Rewe", color: "#d32f2f", isDefault: true },
  { id: "lidl", name: "Lidl", color: "#1565c0", isDefault: true },
  { id: "edeka", name: "Edeka", color: "#f57c00", isDefault: true },
  { id: "aldi", name: "Aldi", color: "#1976d2", isDefault: true },
  { id: "penny", name: "Penny", color: "#b71c1c", isDefault: true },
  { id: "netto", name: "Netto", color: "#f9a825", isDefault: true },
  { id: "kaufland", name: "Kaufland", color: "#c62828", isDefault: true },
  { id: "dm", name: "dm", color: "#ad1457", isDefault: true },
  { id: "rossmann", name: "Rossmann", color: "#00838f", isDefault: true },
  { id: "mueller", name: "Müller", color: "#6a1b9a", isDefault: true },
];

export const DEFAULT_SECTIONS: Section[] = [
  { id: "produce", name: "Produce", order: 1 },
  { id: "bakery", name: "Bakery", order: 2 },
  { id: "meat-fish", name: "Meat & Fish", order: 3 },
  { id: "dairy", name: "Dairy & Eggs", order: 4 },
  { id: "frozen", name: "Frozen", order: 5 },
  { id: "beverages", name: "Beverages", order: 6 },
  { id: "pantry", name: "Pantry", order: 7 },
  { id: "snacks", name: "Snacks", order: 8 },
  { id: "household", name: "Household", order: 9 },
  { id: "personal-care", name: "Personal Care", order: 10 },
  { id: "other", name: "Other", order: 99 },
];

export const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
];
