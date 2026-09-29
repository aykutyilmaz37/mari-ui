import type { TreeCheckInfo, TreeNode } from "./types";

/**
 * Faz 16.3 — Tree'nin saf mantığı (DOM/React yok). TreeSelect (16.4) aynı
 * fonksiyonları kullanacak: indeks, görünür düğümler, işaret yayılımı, arama.
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

/* ─────────────────────────── Klavye ─────────────────────────── */

export type TreeKeyAction =
  | { type: "focus"; key: string }
  | { type: "expand"; key: string }
  | { type: "collapse"; key: string }
  | { type: "expandSiblings"; keys: string[] }
  | null;

/**
 * WAI-ARIA APG Tree View tuşları: ↑/↓ görünür düğümler, → aç ya da ilk
 * çocuğa in, ← kapa ya da ebeveyne çık, Home/End, `*` kardeşleri aç, harf ile
 * ada göre atla. Enter/Space bileşende (seçim/işaret) ele alınır.
 */
const focusTo = (entry: VisibleNode | undefined): TreeKeyAction => (entry ? { type: "focus", key: entry.node.key } : null);

/** Harfle atlama: bulunduğu düğümden sonra, adı o harfle başlayan ilk görünür düğüm (döngülü). */
function typeahead(visible: VisibleNode[], i: number, key: string): TreeKeyAction {
  if (key.length !== 1 || key === " ") return null;
  const char = normalize(key);
  for (let step = 1; step <= visible.length; step++) {
    const candidate = visible[(i + step) % visible.length]!;
    if (normalize(nodeText(candidate.node)).startsWith(char)) return focusTo(candidate);
  }
  return null;
}

export function getKeyAction(
  visible: VisibleNode[],
  currentKey: string,
  key: string,
  isOpen: (k: string) => boolean,
  canExpand: (node: TreeNode) => boolean
): TreeKeyAction {
  const i = visible.findIndex((v) => v.node.key === currentKey);
  const current = visible[i];
  if (!current) return null;
  const open = canExpand(current.node) && isOpen(current.node.key);
  switch (key) {
    case "ArrowDown":
      return focusTo(visible[i + 1]);
    case "ArrowUp":
      return focusTo(visible[i - 1]);
    case "Home":
      return focusTo(visible[0]);
    case "End":
      return focusTo(visible[visible.length - 1]);
    case "ArrowRight":
      if (!canExpand(current.node)) return null;
      if (!open) return { type: "expand", key: current.node.key };
      return visible[i + 1]?.parentKey === current.node.key ? focusTo(visible[i + 1]) : null;
    case "ArrowLeft":
      if (open) return { type: "collapse", key: current.node.key };
      return current.parentKey === null ? null : { type: "focus", key: current.parentKey };
    case "*": {
      const siblings = visible.filter((v) => v.parentKey === current.parentKey && canExpand(v.node) && !isOpen(v.node.key)).map((v) => v.node.key);
      return siblings.length ? { type: "expandSiblings", keys: siblings } : null;
    }
    default:
      return typeahead(visible, i, key);
  }
}
