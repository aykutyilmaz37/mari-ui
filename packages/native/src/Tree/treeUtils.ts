import type { TreeCheckInfo, TreeNode } from "./types";

/**
 * Tree ve TreeSelect'in saf mantığı — web `tree/utils` + `tree-select/utils`
 * ile birebir (klavye eylemleri hariç: native'de ok tuşu yok). Altta native'e
 * özgü olarak aşağı inen menü (drill-down) yardımcıları.
 */

export interface TreeEntry {
  node: TreeNode;
  parentKey: string | null;
  /** 1 tabanlı derinlik (`aria-level`). */
  level: number;
  childKeys: string[];
}

export type TreeIndex = Map<string, TreeEntry>;

/** DFS sırasıyla (Map ekleme sırası korunur) anahtar → konum. */
export function buildIndex(data: TreeNode[]): TreeIndex {
  const index: TreeIndex = new Map();
  const walk = (nodes: TreeNode[], parentKey: string | null, level: number) => {
    for (const node of nodes) {
      index.set(node.key, { node, parentKey, level, childKeys: (node.children ?? []).map((c) => c.key) });
      if (node.children) walk(node.children, node.key, level + 1);
    }
  };
  walk(data, null, 1);
  return index;
}

/** Çocuğu olan (ya da tembel yüklenecek) düğüm açılabilir. */
export function isExpandable(node: TreeNode, lazy: boolean): boolean {
  if (node.children && node.children.length > 0) return true;
  return lazy && !node.isLeaf && node.children === undefined;
}

/** `defaultExpandAll` için: çocuğu olan tüm düğümler. */
export function getParentKeys(index: TreeIndex): string[] {
  return [...index.values()].filter((e) => e.childKeys.length > 0).map((e) => e.node.key);
}

export function getAncestorKeys(index: TreeIndex, key: string): string[] {
  const out: string[] = [];
  let parent = index.get(key)?.parentKey ?? null;
  while (parent !== null) {
    out.push(parent);
    parent = index.get(parent)?.parentKey ?? null;
  }
  return out;
}

export interface VisibleNode {
  node: TreeNode;
  level: number;
  /** Görünür kardeşler arasındaki sıra ve sayı (`aria-posinset`/`aria-setsize`). */
  posinset: number;
  setsize: number;
  parentKey: string | null;
}

/** Açık düğümlere göre ekranda görünen düğümler, sırasıyla. `filter` verilirse yalnız onlar. */
export function flattenVisible(data: TreeNode[], expanded: ReadonlySet<string>, filter?: ReadonlySet<string>): VisibleNode[] {
  const out: VisibleNode[] = [];
  const walk = (nodes: TreeNode[], parentKey: string | null, level: number) => {
    const shown = filter ? nodes.filter((n) => filter.has(n.key)) : nodes;
    shown.forEach((node, i) => {
      out.push({ node, level, posinset: i + 1, setsize: shown.length, parentKey });
      if (node.children && expanded.has(node.key)) walk(node.children, node.key, level + 1);
    });
  };
  walk(data, null, 1);
  return out;
}

/* ─────────────────────────── İşaret yayılımı ─────────────────────────── */

/** Devre dışı / onay kutusu kapalı düğümler yayılıma katılmaz (ant ile aynı). */
export function isCheckEligible(node: TreeNode): boolean {
  return !node.disabled && !node.disableCheckbox && node.checkable !== false;
}

function addDescendants(index: TreeIndex, key: string, set: Set<string>) {
  for (const childKey of index.get(key)?.childKeys ?? []) {
    const child = index.get(childKey);
    if (!child || !isCheckEligible(child.node)) continue;
    set.add(childKey);
    addDescendants(index, childKey, set);
  }
}

/** Devre dışı düğümlerin (ve altlarının) işaret durumuna dokunulmaz. */
function removeDescendants(index: TreeIndex, key: string, set: Set<string>) {
  for (const childKey of index.get(key)?.childKeys ?? []) {
    const child = index.get(childKey);
    if (!child || !isCheckEligible(child.node)) continue;
    set.delete(childKey);
    removeDescendants(index, childKey, set);
  }
}

/** Alttan üste: uygun çocuklarının hepsi işaretliyse işaretli, bazısıysa kısmi. */
function conductUp(index: TreeIndex, set: Set<string>): TreeCheckInfo {
  const half = new Set<string>();
  const entries = [...index.values()].reverse(); // çocuklar ebeveynden önce
  for (const entry of entries) {
    const eligibleChildren = entry.childKeys.map((k) => index.get(k)!).filter((c) => isCheckEligible(c.node));
    if (eligibleChildren.length === 0) continue;
    const checkedCount = eligibleChildren.filter((c) => set.has(c.node.key)).length;
    const anyHalf = eligibleChildren.some((c) => half.has(c.node.key));
    if (!isCheckEligible(entry.node)) continue;
    if (checkedCount === eligibleChildren.length) {
      set.add(entry.node.key);
    } else {
      set.delete(entry.node.key);
      if (checkedCount > 0 || anyHalf) half.add(entry.node.key);
    }
  }
  const order = [...index.keys()];
  return { checked: order.filter((k) => set.has(k)), halfChecked: order.filter((k) => half.has(k)) };
}

/** Dışarıdan gelen işaretleri tutarlı hâle getirir: işaretli üstün altı işaretlenir, üstler hesaplanır. */
export function conductCheck(keys: readonly string[], index: TreeIndex): TreeCheckInfo {
  const set = new Set<string>();
  for (const key of keys) {
    const entry = index.get(key);
    if (!entry) continue;
    set.add(key);
    if (isCheckEligible(entry.node)) addDescendants(index, key, set);
  }
  return conductUp(index, set);
}

/** Bir düğümü işaretle/kaldır. `strict`te yayılım yok. */
export function toggleCheck(current: readonly string[], key: string, checked: boolean, index: TreeIndex, strict: boolean): TreeCheckInfo {
  if (strict) {
    const next = checked ? [...new Set([...current, key])] : current.filter((k) => k !== key);
    return { checked: next, halfChecked: [] };
  }
  const set = new Set(current);
  if (checked) {
    set.add(key);
    addDescendants(index, key, set);
  } else {
    set.delete(key);
    removeDescendants(index, key, set);
    for (const ancestor of getAncestorKeys(index, key)) {
      if (isCheckEligible(index.get(ancestor)!.node)) set.delete(ancestor);
    }
  }
  return conductUp(index, set);
}

/* ─────────────────────────── Arama ─────────────────────────── */

export function nodeText(node: TreeNode): string {
  if (node.searchText !== undefined) return node.searchText;
  return typeof node.title === "string" || typeof node.title === "number" ? String(node.title) : "";
}

/**
 * Arama için harf katlama. `toLocaleLowerCase("tr")` Latin "I"yı "ı" yapar
 * ("API" → "apı") ve "api.ts"yi bulamaz; en-US ise "İ"yi iki karaktere böler.
 * tr ile küçültüp ı→i katlanır: "API", "İstanbul", "ılık" hepsi bulunur, uzunluk değişmez.
 */
const normalize = (s: string) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");

export interface TreeSearchResult {
  /** Eşleşen düğümler. */
  matches: Set<string>;
  /** Gösterilecekler: eşleşenler, ataları ve eşleşen düğümlerin alt ağaçları. */
  visible: Set<string>;
  /** Kendiliğinden açılacaklar: eşleşenlerin ataları. */
  expand: Set<string>;
}

export function searchTree(index: TreeIndex, value: string): TreeSearchResult | null {
  const query = normalize(value.trim());
  if (!query) return null;
  const matches = new Set<string>();
  const visible = new Set<string>();
  const expand = new Set<string>();
  for (const [key, entry] of index) {
    if (!normalize(nodeText(entry.node)).includes(query)) continue;
    matches.add(key);
    visible.add(key);
    for (const ancestor of getAncestorKeys(index, key)) {
      visible.add(ancestor);
      expand.add(ancestor);
    }
    const stack = [...entry.childKeys];
    while (stack.length) {
      const k = stack.pop()!;
      visible.add(k);
      stack.push(...(index.get(k)?.childKeys ?? []));
    }
  }
  return { matches, visible, expand };
}

/** Metni eşleşen/eşleşmeyen parçalara böler (Türkçe harf duyarsız, orijinal harfler korunur). */
export function splitMatch(text: string, value: string): { text: string; match: boolean }[] {
  const query = normalize(value.trim());
  if (!query) return [{ text, match: false }];
  const lower = normalize(text);
  // `toLocaleLowerCase("tr")` uzunluğu değiştirmez (İ→i tek karakter), indeksler aynı kalır.
  const parts: { text: string; match: boolean }[] = [];
  let from = 0;
  let at = lower.indexOf(query, from);
  while (at !== -1) {
    if (at > from) parts.push({ text: text.slice(from, at), match: false });
    parts.push({ text: text.slice(at, at + query.length), match: true });
    from = at + query.length;
    at = lower.indexOf(query, from);
  }
  if (from < text.length) parts.push({ text: text.slice(from), match: false });
  return parts;
}

/* ─────────────────────────── TreeSelect: değer ↔ işaret ─────────────────────────── */

/**
 * İşaretli modda değere hangi düğümler yazılsın:
 * - `child` (varsayılan): yalnız işaretli yapraklar.
 * - `parent`: tamamı işaretli bir dal tek anahtar (üst düğüm) olarak.
 * - `all`: işaretli her düğüm.
 */
export type TreeSelectCheckedStrategy = "child" | "parent" | "all";

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


/* ─────────────────────────── Aşağı inen menü (native) ─────────────────────────── */

/** Kökten düğüme kadar olan yol (düğüm dahil). */
export function pathTo(index: TreeIndex, key: string): TreeNode[] {
  const out: TreeNode[] = [];
  let current: string | null = key;
  while (current !== null) {
    const entry = index.get(current);
    if (!entry) break;
    out.unshift(entry.node);
    current = entry.parentKey;
  }
  return out;
}

/** İçine girilen seviyenin düğümleri: yol boşsa kök. */
export function levelNodes(data: TreeNode[], index: TreeIndex, parentKey: string | null): TreeNode[] {
  if (parentKey === null) return data;
  return index.get(parentKey)?.node.children ?? [];
}

export interface FlatSearchHit {
  node: TreeNode;
  /** Ataların başlıkları ("Elektronik › Bilgisayar"); kökteyse boş. */
  path: string[];
}

/** Arama sonucu düz liste: eşleşen her düğüm, ağaç sırasıyla, atalarının yolu ile. */
export function flatSearch(index: TreeIndex, value: string): FlatSearchHit[] | null {
  const result = searchTree(index, value);
  if (!result) return null;
  return [...index.keys()]
    .filter((k) => result.matches.has(k))
    .map((k) => ({ node: index.get(k)!.node, path: getAncestorKeys(index, k).reverse().map((a) => nodeText(index.get(a)!.node)) }));
}
