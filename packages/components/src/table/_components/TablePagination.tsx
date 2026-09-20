import React from "react";
import { cn } from "@mari-ui/core";
import { Pagination } from "../../pagination";
import type { TablePaginationConfig } from "../types";

export interface TablePaginationProps {
  pagination: TablePaginationConfig;
  className?: string;
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
export function TablePagination({ pagination, className }: TablePaginationProps) {
  const { page, pageSize, total, pageSizeOptions, onPageChange, onPageSizeChange } = pagination;

  return (
    <div className={cn("border-t border-mari-border px-3 py-2.5", className)}>
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        showTotal
      />
    </div>
  );
}
