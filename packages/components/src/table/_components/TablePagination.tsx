import React from "react";
import { cn } from "@mari-ui/core";
import { Pagination } from "../../pagination";
import type { TablePaginationConfig } from "../types";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import { SkeletonBlock } from "../../skeleton";

export interface TablePaginationProps {
  pagination: TablePaginationConfig;
  className?: string;
  skeleton?: boolean;
}

/**
 * Faz 13.5 kullanıcı isteği ("diğer component'lerde kullandığımız şeyleri
 * burada da uygulayalım"): eskiden burada, `../../pagination`'daki paylaşılan
 * `Pagination` component'iyle NEREDEYSE BİREBİR AYNI bir sayfa-numarası/
 * ellipsis üretme mantığı tekrar uygulanmıştı (iki ayrı `getPageList`/
 * `getGeneratePageNumbers` fonksiyonu, iki ayrı buton render döngüsü). Artık
 * `TablePagination` sadece bir ince sarmalayıcı — tüm gerçek mantık paylaşılan
 * `Pagination`'da yaşıyor, `Table.tsx`'in kendi `TablePaginationConfig`
 * sözleşmesini (`page`/`pageSize`/`total` — `Pagination`'ın `currentPage`/
 * `pageSize`/`totalItems` isimlendirmesinden farklı, Table'ın kendi API'si
 * korunuyor) `Pagination`'ın prop'larına eşliyor.
 */
export function TablePagination({ pagination, className, skeleton = false }: TablePaginationProps) {
  const { page, pageSize, total, pageSizeOptions, onPageChange, onPageSizeChange } = pagination;

  return (
    <div className={cn("border-t border-mari-border px-3 py-2.5", className)}>
      <SkeletonSlot
        on={skeleton}
        className="items-center"
        placeholder={
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock active width="6rem" height="0.75rem" radius="sm" />
            <SkeletonBlock active width="10rem" height="1.5rem" radius="md" />
          </div>
        }
      >
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={total}
          // Table'ın kendi sözleşmesi tek argümanlı — Pagination'ın ek `pageSize`/`page` argümanları sızmasın.
          onPageChange={(next) => onPageChange(next)}
          onPageSizeChange={onPageSizeChange && ((next) => onPageSizeChange(next))}
          pageSizeOptions={pageSizeOptions}
          showTotal
        />
      </SkeletonSlot>
    </div>
  );
}
