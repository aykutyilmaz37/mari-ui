import { foldForSearch } from "../lib/search";
import type { TransferDirection, TransferItem } from "./types";

/** Transfer'in saf mantığı (bileşenden bağımsız test edilir). */

/** Sol: hedefte olmayanlar (dataSource sırası). Sağ: hedef anahtarlarının sırası (dataSource'ta olmayan anahtar düşer). */
export function splitLists(dataSource: readonly TransferItem[], targetKeys: readonly string[]) {
  const byKey = new Map(dataSource.map((item) => [item.key, item]));
  const target = new Set(targetKeys);
  return {
    left: dataSource.filter((item) => !target.has(item.key)),
    right: targetKeys.map((key) => byKey.get(key)).filter((item): item is TransferItem => item !== undefined),
  };
}

export function itemText(item: TransferItem): string {
  if (item.searchText !== undefined) return item.searchText;
  return typeof item.title === "string" || typeof item.title === "number" ? String(item.title) : "";
}

export function filterItems(
  items: readonly TransferItem[],
  query: string,
  direction: TransferDirection,
  filterOption?: (input: string, item: TransferItem, direction: TransferDirection) => boolean
): TransferItem[] {
  const q = query.trim();
  if (!q) return [...items];
  if (filterOption) return items.filter((item) => filterOption(q, item, direction));
  const folded = foldForSearch(q);
  return items.filter((item) => foldForSearch(itemText(item)).includes(folded));
}

/**
 * Taşıma: sağa → seçilenler hedefin SONUNA eklenir (sıraları kaynaktaki gibi);
 * sola → hedeften çıkar. Devre dışı öğe taşınmaz.
 */
export function moveKeys(
  dataSource: readonly TransferItem[],
  targetKeys: readonly string[],
  selected: readonly string[],
  direction: TransferDirection
): { targetKeys: string[]; moved: string[] } {
  const disabled = new Set(dataSource.filter((i) => i.disabled).map((i) => i.key));
  const target = new Set(targetKeys);
  const chosen = new Set(selected);
  if (direction === "right") {
    const moved = dataSource.filter((i) => chosen.has(i.key) && !target.has(i.key) && !disabled.has(i.key)).map((i) => i.key);
    return { targetKeys: [...targetKeys, ...moved], moved };
  }
  const moved = targetKeys.filter((k) => chosen.has(k) && !disabled.has(k));
  const movedSet = new Set(moved);
  return { targetKeys: targetKeys.filter((k) => !movedSet.has(k)), moved };
}

/** Başlıktaki "tümünü seç" kutusunun durumu — yalnız görünen (süzülmüş) ve etkin öğelere göre. */
export function selectAllState(visible: readonly TransferItem[], selected: ReadonlySet<string>): { checked: boolean; indeterminate: boolean } {
  const enabled = visible.filter((i) => !i.disabled);
  const count = enabled.filter((i) => selected.has(i.key)).length;
  return { checked: enabled.length > 0 && count === enabled.length, indeterminate: count > 0 && count < enabled.length };
}

/** Tümünü seç/kaldır: görünen etkin öğeler eklenir ya da çıkarılır; aramada gizli kalan seçimler korunur. */
export function toggleAll(visible: readonly TransferItem[], selected: readonly string[], select: boolean): string[] {
  const keys = visible.filter((i) => !i.disabled).map((i) => i.key);
  if (!select) {
    const drop = new Set(keys);
    return selected.filter((k) => !drop.has(k));
  }
  const next = new Set(selected);
  keys.forEach((k) => next.add(k));
  return [...next];
}

/**
 * Shift+tıklama: son tıklanan (`anchor`) ile `key` arasındaki etkin öğeleri
 * `checked` durumuna getirir. Anchor görünmüyorsa yalnız `key`.
 */
export function rangeSelect(
  visible: readonly TransferItem[],
  selected: readonly string[],
  anchor: string | null,
  key: string,
  checked: boolean
): string[] {
  const to = visible.findIndex((i) => i.key === key);
  const from = anchor === null ? -1 : visible.findIndex((i) => i.key === anchor);
  const span = from === -1 ? [visible[to]!] : visible.slice(Math.min(from, to), Math.max(from, to) + 1);
  const keys = span.filter((i) => !i.disabled).map((i) => i.key);
  const next = new Set(selected);
  keys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
  return [...next];
}

/** Başlıktaki sayaç: "3/12 öğe" ya da "12 öğe". */
export function countLabel(selected: number, total: number): string {
  return selected > 0 ? `${selected}/${total} öğe` : `${total} öğe`;
}
