import LZString from "lz-string";
import type { ShoppingList } from "../store/types";

export function encodeList(list: ShoppingList): string {
  const data = JSON.stringify({ name: list.name, items: list.items });
  return LZString.compressToEncodedURIComponent(data);
}

export function decodeList(
  encoded: string,
): Pick<ShoppingList, "name" | "items"> | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    const data = JSON.parse(decompressed) as unknown;
    if (
      typeof data !== "object" ||
      data === null ||
      !("name" in data) ||
      !("items" in data) ||
      !Array.isArray((data as { items: unknown }).items)
    )
      return null;
    return data as Pick<ShoppingList, "name" | "items">;
  } catch {
    return null;
  }
}

export function buildShareUrl(list: ShoppingList): string {
  const encoded = encodeList(list);
  const base = `${window.location.origin}/shopping-app/`;
  return `${base}#/import?data=${encoded}`;
}
