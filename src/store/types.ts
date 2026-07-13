export interface Store {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface Section {
  id: string;
  name: string;
  order: number;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  sectionId?: string;
  storeIds: string[];
  notes?: string;
  checked: boolean;
  addedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ListItem[];
  isArchived: boolean;
}

export interface ItemHistoryEntry {
  id: string;
  name: string;
  unit: string;
  sectionId?: string;
  storeIds: string[];
  lastUsed: string;
  useCount: number;
}
