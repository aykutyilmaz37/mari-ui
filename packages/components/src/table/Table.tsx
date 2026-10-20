"use client";

import React, { useRef } from "react";
import { cn } from "@mari-ui/core";
import { useScrollable } from "../lib/useScrollable";
import { TableAccordion } from "./_components/TableAccordion";
import { TableBody } from "./_components/TableBody";
import { TableHeader } from "./_components/TableHeader";
import type { TableProps } from "./types";

export type { TableProps };

/*
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi, elle senkron tutuluyordu. Artık tek
 * bir `columns` dizisi.
 */
/**
 * Kullanıcı bulgularına göre tamamen elden geçirildi:
 * - Sütun hizalaması artık DOM index'ine göre değil `col.align`'a göre
 *  (varsayılan sola hizalı, hepsi tutarlı).
 * - `loading` prop'u KALDIRILDI — anlamsız bir spinner gösteriyordu; gerçek
 *  skeleton yapısı ileride TÜM component'ler için birlikte gelecek.
 * - Veri boşken artık gerçek `Empty` component'i (bkz. `TableBody`).
 * - İşlemler sütunu tablo yatay kaydırıldığında sağda `sticky` kalır
 *  (`overflow-x-auto` + `<td>`/`<th>`'de `sticky right-0`).
 * - `responsive="accordion"` dar ekranda (`md` altı) satırları tablo yerine
 *  açılır/kapanır kartlar olarak gösterir (bkz. `TableAccordion`).
 * - Altta `footer` yuvası (tipik olarak `Pagination`); tablo veriyi dilimlemez,
 *  `data` o sayfanın satırlarıdır. Sayfalama ve düzenleme çekmecesi tabloya
 *  gömülü değil — yalnız kullanana gelsin diye (Faz 4c).
 */
export function Table<T extends { id: string }>({
  data,
  columns,
  className,
  emptyState,
  responsive = "scroll",
  footer,
  skeletonRows,
  label,
  skeleton = false,
}: Readonly<TableProps<T>>) {
  // Yatay kaydırılan bölge klavyeyle de kaydırılabilmeli (axe
  // `scrollable-region-focusable`): SADECE gerçekten taşarken tab durağı olur —
  // sığan bir tabloya boşuna bir durak eklemesin.
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollable = useScrollable(scrollRef, "x");

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
          <TableBody data={data} columns={columns} emptyState={emptyState} skeleton={skeleton} skeletonRows={skeletonRows} />
        </table>
      </div>
      {responsive === "accordion" && (
        <TableAccordion
          data={data}
          columns={columns}
          emptyState={emptyState}
          skeleton={skeleton}
          skeletonRows={skeletonRows}
          className="block border-0 md:hidden"
        />
      )}
      {footer && <div className="border-t border-mari-border px-3 py-2.5">{footer}</div>}
    </div>
  );
}
