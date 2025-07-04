import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "../button";
import { getGeneratePageNumbers, getHandleClick } from "./utils";
import clsx from "clsx";

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
  ) => getHandleClick(page, currentPage, totalPages, onPageChange);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 disabled:opacity-50 hover:bg-primary/20"
      >
        <ChevronLeftIcon size={16} />
      </Button>

      {pages.map((page, index) => {
        if (typeof page === "object" && page.type === "ellipsis") {
          return (
            <Button
              key={`ellipsis-${page.direction}-${index}`}
              onClick={() => handleClick(page)}
              className="px-3 py-1 rounded hover:bg-primary/20"
            >
              <MoreHorizontalIcon size={16} />
            </Button>
          );
        } else {
          const isActive = page === currentPage;

          return (
            <Button
              key={`page-${page}`}
              onClick={() => handleClick(page)}
              type={isActive ? "primary" : "text"}
              className={clsx(!isActive && "hover:bg-primary/20")}
            >
              {typeof page === "number" ? page : null}
            </Button>
          );
        }
      })}

      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 disabled:opacity-50 hover:bg-primary/20"
      >
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};
