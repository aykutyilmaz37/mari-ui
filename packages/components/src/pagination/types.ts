export type PageItem = number | { type: "ellipsis"; direction: "left" | "right" };

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
