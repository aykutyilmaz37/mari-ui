import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "../button";
import type { PaginationProps } from "./types";
import { getGeneratePageNumbers, resolvePageClickTarget } from "./utils";

export type { PaginationProps };

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 1000];

/**
 * Eskiden Button sadece tıklama davranışı için kullanılıp görseli tamamen
 * elle `className` ile eziliyordu (`bg-primary-light`, `bg-foreground
 * text-background` gibi ham class'larla). Artık Button'ın kendi
 * `color`/`variant` ekseni kullanılıyor.
 *
 * Faz 13.5: Table'ın kendi sayfalama kontrolü (`TablePagination`) ayrı,
 * neredeyse birebir aynı bir sayfa-numarası/ellipsis mantığını tekrar
 * uyguluyordu ("diğer component'lerde kullandığımız şeyleri burada da
 * uygulayalım" — kullanıcı isteği). Artık `TablePagination` bu component'i
 * SARMALIYOR (bkz. `table/_components/TablePagination.tsx`) — tek gerçek
 * sayfa-listesi/ellipsis mantığı burada yaşıyor. `showTotal`/
 * `onPageSizeChange` bu yüzden eklendi: eskiden sadece Table'ın kendi
 * kontrolünde vardı.
 *
 * Ayrıca aktif sayfa düğmesi artık `aria-current="page"` taşıyor (WAI-ARIA
 * Pagination deseni) — eskiden hiçbir sayfa düğmesi mevcut sayfayı ekran
 * okuyucuya bildirmiyordu.
 */
export function Pagination({ currentPage, pageSize, totalItems, onPageChange, showTotal = false, onPageSizeChange, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pages = getGeneratePageNumbers(totalPages, currentPage);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const handleClick = (page: number | { type: "ellipsis"; direction: "left" | "right" }) => {
    onPageChange(resolvePageClickTarget(page, currentPage, totalPages));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {showTotal && (
        <p className="text-sm text-mari-muted">
          {rangeStart}-{rangeEnd} / {totalItems} kayıt
        </p>
      )}

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-mari-muted">
            Sayfa başına
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-mari-input bg-mari-surface px-2 py-1 text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

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
                aria-label={page.direction === "left" ? "5 sayfa geri atla" : "5 sayfa ileri atla"}
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
                aria-label={`${page}. sayfa`}
                aria-current={isActive ? "page" : undefined}
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
      </div>
    </div>
  );
}
