import type { PageItem } from "./types";

export function getGeneratePageNumbers(totalPages: number, currentPage: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [1];
  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  if (startPage > 2) pages.push({ type: "ellipsis", direction: "left" });
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages - 1) pages.push({ type: "ellipsis", direction: "right" });
  pages.push(totalPages);

  return pages;
}

// Not: eskiden bu dosyada bir de `getHandleClick` vardı — hiçbir yerde
// import edilmiyordu, Pagination.tsx kendi (biraz farklı sıçrama miktarına
// sahip) tıklama mantığını inline tutuyordu. Ölü kod silindi, tek gerçek
// mantık aşağıda.
export function resolvePageClickTarget(
  page: PageItem,
  currentPage: number,
  totalPages: number
): number {
  if (typeof page === "number") return page;
  return page.direction === "left" ? Math.max(currentPage - 5, 1) : Math.min(currentPage + 5, totalPages);
}
