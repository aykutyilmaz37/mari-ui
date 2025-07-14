import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "../button";
import clsx from "clsx";
import { getGeneratePageNumbers } from "./utils";

export type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pages = getGeneratePageNumbers(totalPages, currentPage);

  const handleClick = (
    page: number | { type: "ellipsis"; direction: "left" | "right" }
  ) => {
    if (typeof page === "object" && page.type === "ellipsis") {
      const targetPage =
        page.direction === "left"
          ? Math.max(currentPage - 5, 1)
          : Math.min(currentPage + 5, totalPages);
      onPageChange(targetPage);
    } else {
      onPageChange(Number(page));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 text-foreground disabled:opacity-50 bg-transparent hover:bg-primary-light"
      >
        <ChevronLeftIcon size={16} />
      </Button>

      {pages.map((page, index) => {
        const isEllipsis = typeof page === "object" && page.type === "ellipsis";
        const isActive = page === currentPage;

        return isEllipsis ? (
          <Button
            key={`ellipsis-${page.direction}-${index}`}
            onClick={() => handleClick(page)}
            className="px-3 py-1 rounded text-muted bg-background-alt"
          >
            <MoreHorizontalIcon size={16} />
          </Button>
        ) : (
          <Button
            key={`page-${page}`}
            onClick={() => handleClick(page)}
            className={clsx(
              "px-3 py-1 rounded transition",
              isActive
                ? "bg-foreground text-background"
                : "text-foreground bg-transparent hover:bg-primary-light"
            )}
          >
            {Number(page)}
          </Button>
        );
      })}

      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 text-foreground disabled:opacity-50 bg-transparent hover:bg-primary-light"
      >
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};
