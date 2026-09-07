import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "../button";
import type { PaginationProps } from "./types";
import { getGeneratePageNumbers, resolvePageClickTarget } from "./utils";

export type { PaginationProps };

/**
 * Hook yok, browser API yok — saf sunum, "use client" gerekmiyor. Eskiden
 * Button sadece tıklama davranışı için kullanılıp görseli tamamen elle
 * `className` ile eziliyordu (`bg-primary-light`, `bg-foreground
 * text-background` gibi ham class'larla). Artık Button'ın kendi
 * `color`/`variant` ekseni kullanılıyor.
 */
export function Pagination({ currentPage, pageSize, totalItems, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pages = getGeneratePageNumbers(totalPages, currentPage);

  const handleClick = (page: number | { type: "ellipsis"; direction: "left" | "right" }) => {
    onPageChange(resolvePageClickTarget(page, currentPage, totalPages));
  };

  return (
    <nav className="flex items-center gap-2" aria-label="Sayfalama">
      <Button
        variant="ghost"
        color="neutral"
        size="sm"
        shape="circle"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Önceki sayfa"
      >
        <ChevronLeftIcon size={16} />
      </Button>

      {pages.map((page, index) => {
        const isEllipsis = typeof page === "object" && page.type === "ellipsis";
        const isActive = page === currentPage;

        return isEllipsis ? (
          <Button
            key={`ellipsis-${page.direction}-${index}`}
            variant="ghost"
            color="neutral"
            size="sm"
            shape="circle"
            onClick={() => handleClick(page)}
          >
            <MoreHorizontalIcon size={16} />
          </Button>
        ) : (
          <Button
            key={`page-${page}`}
            variant={isActive ? "solid" : "ghost"}
            color={isActive ? "primary" : "neutral"}
            size="sm"
            shape="circle"
            onClick={() => handleClick(page)}
          >
            {Number(page)}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        color="neutral"
        size="sm"
        shape="circle"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Sonraki sayfa"
      >
        <ChevronRightIcon size={16} />
      </Button>
    </nav>
  );
}
