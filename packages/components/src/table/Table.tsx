"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { TableAccordion } from "./_components/TableAccordion";
import { TableBody } from "./_components/TableBody";
import { TableHeader } from "./_components/TableHeader";
import { TablePagination } from "./_components/TablePagination";
import type { TableProps } from "./types";

export type { TableProps };

/**
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi, elle senkron tutuluyordu (bkz. plan denetimi). Artık tek
 * bir `columns` dizisi.
 *
 * Kullanıcı bulgularına göre (bkz. plan/sohbet) tamamen elden geçirildi:
 * - Sütun hizalaması artık DOM index'ine göre değil `col.align`'a göre
 *   (varsayılan sola hizalı, hepsi tutarlı).
 * - `loading` prop'u KALDIRILDI — anlamsız bir spinner gösteriyordu; gerçek
 *   skeleton yapısı ileride TÜM component'ler için birlikte gelecek.
 * - Veri boşken artık gerçek `Empty` component'i (bkz. `TableBody`).
 * - İşlemler sütunu tablo yatay kaydırıldığında sağda `sticky` kalır
 *   (`overflow-x-auto` + `<td>`/`<th>`'de `sticky right-0`).
 * - `responsive="accordion"` dar ekranda (`md` altı) satırları tablo yerine
 *   açılır/kapanır kartlar olarak gösterir (bkz. `TableAccordion`).
 * - `pagination` verilirse altta sayfalama kontrolleri render edilir;
 *   `paginationMode="client"` iken `Table` kendi diler, `"server"`
 *   (varsayılan) iken `data`'nın zaten o sayfaya ait dilim olduğu varsayılır.
 */
export function Table<T extends { id: string }>({
  data,
  columns,
  className,
  emptyState,
  responsive = "scroll",
  pagination,
  paginationMode = "server",
  label,
  skeleton = false,
}: TableProps<T>) {
  // Yatay kaydırılan bölge klavyeyle de kaydırılabilmeli (axe
  // `scrollable-region-focusable`): SADECE gerçekten taşarken tab durağı olur —
  // sığan bir tabloya boşuna bir durak eklemesin.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageData = useMemo(() => {
    if (!pagination || paginationMode !== "client") return data;
    const start = (pagination.page - 1) * pagination.pageSize;
    return data.slice(start, start + pagination.pageSize);
  }, [data, pagination, paginationMode]);

  return (
    // Kullanıcı bulgusu: eskiden tablo dolu, kalın bir kutu (`border` + `bg-
    // mari-neutral-subtle` başlık) içindeydi — "çok irrite duruyor" tepkisi
    // aldı. Modern dashboard tabloları (Linear/Stripe/Vercel tarzı) ağır bir
    // kutu yerine sadece satır ayırıcılarına güvenir; sınır artık `rounded-lg`
    // + tek bir ince kenarlıkla (kutu değil) daha sessiz bir çerçeve çiziyor.
    <div className={cn("rounded-lg border border-mari-border", className)} aria-busy={skeleton || undefined}>
      <div
        ref={scrollRef}
        className={cn(
          // `relative`: içerideki `sr-only` (position:absolute) öğelerin taşıyıcısı
          // olsun — yoksa kaydırma kutusundan kaçıp sayfayı yatay taşırıyorlardı (375px'te ölçüldü).
          "relative overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          responsive === "accordion" && "hidden md:block"
        )}
        {...(scrollable ? { role: "region", "aria-label": label ?? "Tablo", tabIndex: 0 } : {})}
      >
        <table className="w-full min-w-[36rem]">
          {label && <caption className="sr-only">{label}</caption>}
          <TableHeader columns={columns} skeleton={skeleton} />
          <TableBody data={pageData} columns={columns} emptyState={emptyState} skeleton={skeleton} pageSize={pagination?.pageSize} />
        </table>
      </div>
      {responsive === "accordion" && (
        <TableAccordion
          data={pageData}
          columns={columns}
          emptyState={emptyState}
          skeleton={skeleton}
          pageSize={pagination?.pageSize}
          className="block border-0 md:hidden"
        />
      )}
      {pagination && <TablePagination pagination={pagination} skeleton={skeleton} />}
    </div>
  );
}
