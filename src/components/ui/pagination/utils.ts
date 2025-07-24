import { PageItem } from "./types";

export const getGeneratePageNumbers = (
  totalPages: number,
  currentPage: number
): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [1];

  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  if (startPage > 2) {
    pages.push({ type: "ellipsis", direction: "left" });
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push({ type: "ellipsis", direction: "right" });
  }

  pages.push(totalPages);

  return pages;
};

export const getHandleClick = (
  page: PageItem,
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  if (typeof page === "number" && page !== currentPage) {
    onPageChange(page);
  } else if (typeof page === "object" && page.type === "ellipsis") {
    if (page.direction === "right") {
      onPageChange(Math.min(currentPage + 3, totalPages));
    } else if (page.direction === "left") {
      onPageChange(Math.max(currentPage - 3, 1));
    }
  }
};
