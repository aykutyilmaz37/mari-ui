/** Sidebar'ın saf mantığı (web `menu/utils` ile aynı anlam) — testli, React'siz. */

export interface SidebarTreeItem {
  key: string;
  route?: string;
  heading?: boolean;
  children?: SidebarTreeItem[];
}

/** `currentPath` ile tam eşleşen ilk öğenin anahtarı (derinlemesine). */
export function findActiveKey<T extends SidebarTreeItem>(items: T[], route: string | undefined): string | null {
  if (!route) return null;
  for (const item of items) {
    if (item.route === route) return item.key;
    if (item.children) {
      const found = findActiveKey(item.children, route);
      if (found) return found;
    }
  }
  return null;
}

/** Öğe aktif mi ya da aktif öğe onun altında mı (üst satır da vurgulanır). */
export function containsKey(item: SidebarTreeItem, key: string | null): boolean {
  if (!key) return false;
  if (item.key === key) return true;
  return item.children?.some((child) => containsKey(child, key)) ?? false;
}

/** İçine girilen seviyenin öğeleri: yol boşsa kök. */
export function levelItems<T extends SidebarTreeItem>(data: T[], trail: T[]): T[] {
  const parent = trail[trail.length - 1];
  return (parent?.children as T[] | undefined) ?? data;
}

/** Geri satırının etiketi: bir üst seviyenin başlığı, kökteyse varsayılan. */
export function backLabel<T extends { title: string }>(trail: T[], rootLabel: string): string {
  return trail[trail.length - 2]?.title ?? rootLabel;
}

/** Bölüm başlığı olmayan, çocuklu satır içeri girer. */
export function isBranch(item: SidebarTreeItem): boolean {
  return !item.heading && (item.children?.length ?? 0) > 0;
}
