import React from "react";
import { cn } from "@mari-ui/core";
import type { ColumnDef } from "../types";
import { getAlignClass } from "../utils";

export interface TableHeaderProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
}

/**
 * Kullanıcı bulgusu: eskiden başlık dolu bir `bg-mari-neutral-subtle` bloğu +
 * kalın (`font-semibold`), gövdeyle aynı boyutta metin kullanıyordu — "çok
 * irrite duruyor" tepkisi aldı. Modern dashboard tabloları (Linear/Stripe/
 * Vercel tarzı) başlığı sessiz tutar: dolgu arka plan YOK, küçük/soluk/geniş
 * harf aralıklı metin — göze asıl çarpması gereken VERİ, başlık değil.
 */
export function TableHeader<T extends { id: string }>({ columns }: TableHeaderProps<T>) {
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
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
