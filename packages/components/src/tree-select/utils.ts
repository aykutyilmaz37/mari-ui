import type { TreeNode } from "../tree/types";
import { conductCheck, getAncestorKeys, getParentKeys, isCheckEligible, toggleCheck, type TreeIndex } from "../tree/utils";
import type { TreeSelectCheckedStrategy } from "./types";

/**
 * TreeSelect'in saf mantığı. İndeks, görünür düğümler, işaret
 * yayılımı ve arama Tree'den (`tree/utils`); burada yalnız TreeSelect'e özgü
 * olanlar: değer ↔ işaret dönüşümü (gösterim stratejisi), ilk açık dallar.
 */

/** Değerdeki anahtarlar → tam işaret durumu (bir üst işaretliyse altları da). */
export function valueToChecked(value: readonly string[], index: TreeIndex, strict: boolean): { checked: string[]; halfChecked: string[] } {
  if (strict) return { checked: value.filter((k) => index.has(k)), halfChecked: [] };
  return conductCheck(value, index);
}

/**
 * Tam işaret durumu → değere yazılacak anahtarlar (`showCheckedStrategy`).
 * `parent`: işaretli ama ebeveyni işaretli olmayan düğümler (tam dal = tek anahtar).
 * `child`: işaretli yapraklar (çocuğu olmayanlar).
 */
export function applyStrategy(checked: readonly string[], index: TreeIndex, strategy: TreeSelectCheckedStrategy): string[] {
  if (strategy === "all") return [...checked];
  const set = new Set(checked);
  if (strategy === "parent") {
    return checked.filter((k) => {
      const parent = index.get(k)?.parentKey ?? null;
      return parent === null || !set.has(parent);
    });
  }
  return checked.filter((k) => (index.get(k)?.childKeys.length ?? 0) === 0);
}

/** `checkable` modda bir düğümü işaretle/kaldır; yeni değer (stratejiye göre) döner. */
export function toggleCheckedValue(
  value: readonly string[],
  key: string,
  index: TreeIndex,
  strategy: TreeSelectCheckedStrategy,
  strict: boolean
): string[] {
  const { checked } = valueToChecked(value, index, strict);
  const isOn = checked.includes(key);
  const next = toggleCheck(checked, key, !isOn, index, strict).checked;
  return strict ? next : applyStrategy(next, index, strategy);
}

/** Etiketten bir değeri kaldır (`checkable`da altlarıyla birlikte işareti kalkar). */
export function removeValue(value: readonly string[], key: string, index: TreeIndex, strategy: TreeSelectCheckedStrategy, strict: boolean, checkable: boolean): string[] {
  if (!checkable || strict) return value.filter((k) => k !== key);
  const { checked } = valueToChecked(value, index, strict);
  return applyStrategy(toggleCheck(checked, key, false, index, strict).checked, index, strategy);
}

/** Panel ilk açılışta: hepsi açık ya da seçili düğümlerin ataları (seçim görünsün). */
export function initialExpanded(index: TreeIndex, value: readonly string[], expandAll: boolean): string[] {
  if (expandAll) return getParentKeys(index);
  const out = new Set<string>();
  for (const key of value) getAncestorKeys(index, key).forEach((a) => out.add(a));
  return [...out];
}

/** Bir düğüm seçilebilir/işaretlenebilir mi (tetikleyicide etkileşim için). */
export function isPickable(node: TreeNode, checkable: boolean): boolean {
  if (node.disabled) return false;
  return checkable ? isCheckEligible(node) : node.selectable !== false;
}

