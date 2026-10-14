import React from "react";
import { cn } from "@mari-ui/core";
import type { ColumnDef } from "../types";
import { getActionsJustifyClass, getAlignClass, skeletonWidth } from "../utils";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import { TableCellSkeleton } from "./TableCellSkeleton";

export interface TableHeaderProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  skeleton?: boolean;
}

/**
 * Kullanıcı bulgusu: eskiden başlık dolu bir `bg-mari-neutral-subtle` bloğu +
 * kalın (`font-semibold`), gövdeyle aynı boyutta metin kullanıyordu — "çok
 * irrite duruyor" tepkisi aldı. Modern dashboard tabloları (Linear/Stripe/
 * Vercel tarzı) başlığı sessiz tutar: dolgu arka plan YOK, küçük/soluk/geniş
 * harf aralıklı metin — göze asıl çarpması gereken VERİ, başlık değil.
 */
export function TableHeader<T extends { id: string }>({ columns, skeleton = false }: Readonly<TableHeaderProps<T>>) {
  return (
    <thead>
      <tr className="w-full">
        {columns.map((col, index) => (
          <th
            key={index}
            scope="col"
            className={cn(
              "px-4 py-2.5 text-xs font-medium tracking-wide text-mari-muted uppercase border-b border-mari-border whitespace-nowrap",
              getAlignClass(col.align),
              // İşlemler sütunu içeriğe (ikonlara) göre DAR kalır, kalan
              // boşluğu almaz — kullanıcı bulgusu: eskiden sütun gereksiz
              // yere genişti, başlık metniyle ikonlar aynı hizada değildi
              // (`text-align` blok/flex bir elemanı değil sadece satır-içi
              // içeriği hizalar — bkz. `TableBody`'deki asıl düzeltme).
              col.actions && "sticky right-0 w-px bg-mari-surface border-l border-mari-border"
            )}
          >
            <SkeletonSlot
              on={skeleton}
              className="items-center"
              // Başlık satırı `text-xs` (16px satır) — yer tutucu da o yükseklikte.
              placeholder={<TableCellSkeleton width={col.actions ? "2.5rem" : skeletonWidth(index + 2)} height="0.625rem" className={cn("h-4", getActionsJustifyClass(col.align))} />}
            >
              {col.header}
            </SkeletonSlot>
            {/* Sütun adı veriye bağlı değil: görsel olarak iskelet, ama ekran okuyucu
                için başlık boş kalmasın (axe `empty-table-header`). */}
            {skeleton && <span className="sr-only">{col.header}</span>}
          </th>
        ))}
      </tr>
    </thead>
  );
}
