import type { PageItem } from "./types";

/** Toplam sayfa sayısı. Hiç kayıt yokken bile 1 döner — "0. sayfa" diye bir durum yoktur. */
export function getTotalPages(totalItems: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages));
}

/**
 * Görünür sayfa listesini üretir. Eski algoritma (`current ± 2`) iki soruna
 * yol açıyordu:
 *
 * 1. Düğme sayısı sayfadan sayfaya DEĞİŞİYORDU (1. sayfada 5, 5. sayfada 9
 *    öğe) — tüm bileşenin genişliği her tıklamada zıplıyor, tıklanan
 *    düğmeler imlecin altından kayıyordu ("yeni sayfaya geçince tuhaf
 *    davranıyor" kullanıcı bulgusu).
 * 2. "…" bazen TEK bir sayfayı gizliyordu (10 sayfada 5. sayfa: `1 … 3`) —
 *    o slota doğrudan "2" yazmak aynı yeri kaplar ve bir tıklama kazandırır.
 *
 * Yeni algoritma sabit sayıda slot üretir (`siblingCount * 2 + 5`): ilk ve
 * son sayfa her zaman görünür, aktif sayfanın iki yanında `siblingCount`
 * komşu, aradaki boşluklar ya "…" ya da (tek sayfa gizleyecekse) o sayfanın
 * kendisidir.
 */
export function getPageItems(totalPages: number, currentPage: number, siblingCount = 1): PageItem[] {
  const siblings = Math.max(0, Math.trunc(siblingCount));
  const totalSlots = siblings * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const current = clampPage(currentPage, totalPages);
  // Kenarlara yakınken pencere kaydırılır — slot sayısı sabit kalsın diye.
  const windowStart = Math.max(Math.min(current - siblings, totalPages - siblings * 2 - 2), 3);
  const windowEnd = Math.min(Math.max(current + siblings, siblings * 2 + 3), totalPages - 2);

  const items: PageItem[] = [1];
  items.push(windowStart > 3 ? { type: "ellipsis", direction: "left" } : 2);
  for (let page = windowStart; page <= windowEnd; page++) items.push(page);
  items.push(windowEnd < totalPages - 2 ? { type: "ellipsis", direction: "right" } : totalPages - 1);
  items.push(totalPages);

  return items;
}

/** "…" düğmesinin kaç sayfa atlayacağı — görünür pencere genişliği kadar (ant.design ile aynı: varsayılan 5). */
export function getJumpSize(siblingCount = 1): number {
  return Math.max(0, Math.trunc(siblingCount)) * 2 + 3;
}

export function resolvePageClickTarget(page: PageItem, currentPage: number, totalPages: number, siblingCount = 1): number {
  if (typeof page === "number") return clampPage(page, totalPages);
  const jump = getJumpSize(siblingCount);
  return clampPage(page.direction === "left" ? currentPage - jump : currentPage + jump, totalPages);
}

/**
 * Sayfa boyutu değiştiğinde kullanıcının baktığı İLK kaydı görünür tutan
 * sayfayı bulur. Eskiden sayfa numarası olduğu gibi kalıyordu — 10/sayfa'da
 * 10. sayfadayken 100/sayfa'ya geçince "10. sayfa / 3 sayfa" gibi aralık
 * dışı bir duruma düşülüyor, "901-247 / 247 kayıt" yazıyordu.
 */
export function getPageAfterSizeChange(currentPage: number, oldPageSize: number, newPageSize: number, totalItems: number): number {
  const firstItemIndex = (Math.max(1, currentPage) - 1) * oldPageSize;
  return clampPage(Math.floor(firstItemIndex / newPageSize) + 1, getTotalPages(totalItems, newPageSize));
}

/** `[başlangıç, bitiş]` — 1 tabanlı, kapsayıcı. Kayıt yoksa `[0, 0]`. */
export function getItemRange(currentPage: number, pageSize: number, totalItems: number): [number, number] {
  if (totalItems <= 0) return [0, 0];
  return [(currentPage - 1) * pageSize + 1, Math.min(currentPage * pageSize, totalItems)];
}
