import { PageItem } from "./types";

export const getGeneratePageNumbers = (
  totalPages: number,
  currentPage: number
): PageItem[] => {
  const pages: PageItem[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  pages.push(1);

  if (showLeftEllipsis && !showRightEllipsis) {
    pages.push({ type: "ellipsis", direction: "left" });
    for (let i = totalPages - 4; i < totalPages; i++) {
      pages.push(i);
    }
  } else if (!showLeftEllipsis && showRightEllipsis) {
    for (let i = 2; i <= 4; i++) {
      pages.push(i);
    }
    pages.push({ type: "ellipsis", direction: "right" });
  } else if (showLeftEllipsis && showRightEllipsis) {
    pages.push({ type: "ellipsis", direction: "left" });
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push({ type: "ellipsis", direction: "right" });
  } else {
    for (let i = 2; i < totalPages; i++) {
      pages.push(i);
    }
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
