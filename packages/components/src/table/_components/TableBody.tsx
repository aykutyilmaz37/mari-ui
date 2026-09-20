"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import { Input } from "../../input";
import { Empty } from "../../empty";
import { clearRowDraft, getActionsJustifyClass, getAlignClass, setRowDraftValue } from "../utils";
import type { ColumnDef, TableEmptyStateConfig } from "../types";
import { TableInfoValue } from "./TableInfoValue";
import { TableRowActions } from "./TableRowActions";

export interface TableBodyProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyState?: TableEmptyStateConfig;
}

export function TableBody<T extends { id: string }>({ data, columns, emptyState }: TableBodyProps<T>) {
  // Satır içi düzenleme durumu burada (satır seviyesinde) yaşıyor çünkü
  // aksiyon hücresindeki "düzenle" butonu AYNI satırdaki diğer (veri)
  // hücrelerinin de <Input>'a dönüşmesini tetikliyor — bu, tek bir
  // hücrenin kendi başına bilemeyeceği, satır çapında bir durumdur.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<T>>>({});

  if (data.length === 0) {
    // Eskiden düz "Veri yok." metniydi (kullanıcı bulgusu: "boş veri de kötü
    // gözüküyor içeriği empty gibi olmalı") — artık gerçek `Empty` component'i.
    // `colSpan` kaplanan hücre `text-start` MİRAS ALMIYOR gibi görünüyordu
    // çünkü `<td>` kendi varsayılan hizalamasını (tarayıcı `text-align`
    // başlangıç değeri `left`'tir ama bazı tarayıcı stil sıfırlamalarında
    // `<table>` için farklı davranabilir) taşımıyordu — `text-start` açıkça
    // eklendi (kullanıcı bulgusu: "birde sütun sağa kaymış").
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-0 text-start">
            <Empty title={emptyState?.title ?? "Veri Bulunamadı"} description={emptyState?.description} />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map((item) => {
        const draft: Partial<T> = drafts[item.id] ?? {};
        const isEditing = editingRowId === item.id;

        return (
          <tr key={item.id} className="border-b border-mari-border last:border-b-0 hover:bg-mari-surface-alt/50 transition-colors">
            {columns.map((col, columnIndex) => {
              if (col.actions) {
                // `text-align` (bkz. `getAlignClass`) sadece SATIR İÇİ içeriği
                // hizalar — `TableRowActions`'ın döndürdüğü `<div className=
                // "flex ...">` bir BLOK kutu olduğu için onu yok sayıyordu,
                // bu yüzden başlık (`text-end`) sağa kayarken ikonlar hep
                // solda kalıyordu (kullanıcının ekran görüntüsünde yakalanan
                // gerçek bug). Hizalama burada `justify-*` ile bloğun
                // KENDİSİNE uygulanıyor. Sütun da (`w-px whitespace-nowrap`,
                // bkz. `TableHeader`) artık ikonlara göre dar kalıyor.
                return (
                  <td key={columnIndex} className="sticky right-0 w-px whitespace-nowrap border-l border-mari-border bg-mari-surface px-4 py-2.5">
                    <div className={cn("flex", getActionsJustifyClass(col.align))}>
                      <TableRowActions
                        actions={col.actions}
                        item={item}
                        isInlineEditing={isEditing}
                        onStartInlineEdit={() => setEditingRowId(item.id)}
                        onSaveInlineEdit={() => {
                          col.actions?.editRowInInline?.onChange({ ...item, ...draft });
                          setEditingRowId(null);
                          clearRowDraft(setDrafts, item.id);
                        }}
                        onCancelInlineEdit={() => {
                          setEditingRowId(null);
                          clearRowDraft(setDrafts, item.id);
                        }}
                      />
                    </div>
                  </td>
                );
              }

              const columnName = col.columnName;
              const rawValue = columnName ? item[columnName] : undefined;
              // Eskiden `value ? String(value) : "-"` idi — 0/false/"" gibi
              // GEÇERLİ ama falsy değerler yanlışlıkla "-" gösteriyordu.
              // Gerçek bir bug'dı; null/undefined kontrolüne düzeltildi.
              const displayValue = rawValue != null ? String(rawValue) : "-";
              const draftValue = columnName ? draft[columnName] : undefined;

              return (
                // `max-w-64` KASITLI: `table-auto` düzeninde sütun genişliği
                // içeriğe göre serbestçe büyüyebiliyordu, bu da `line-clamp-2`
                // hiçbir zaman tetiklenmiyordu (metin hep TEK satıra sığacak
                // kadar sütun genişliyordu) — kullanıcı bulgusu: "iki satıra
                // düşsün, genişlik sorun değil, horizontal scroll olacak".
                // Sütun artık bu genişlikte sınırlanıyor (metin gerçekten
                // sarıp 2 satırda kırpılıyor), TABLONUN KENDİSİ hâlâ gerekince
                // (çok sütun varsa) yatay kayıyor — ikisi çelişmiyor.
                // `text-sm` KASITLI: gövde metni açıkça boyutlanmamıştı, tarayıcı
                // varsayılanına (16px) düşüp `text-xs` (12px) başlığın yanında
                // orantısız kalın/büyük görünüyordu — kullanıcı bulgusu: "satır
                // fontları biraz daha ince ve güzel gözükmeli, başlıklardan
                // büyük gibi gözüküyor".
                <td key={columnIndex} className={cn("max-w-64 px-4 py-2.5 text-sm break-words", getAlignClass(col.align))}>
                  {isEditing && columnName ? (
                    <Input
                      aria-label={typeof col.header === "string" ? col.header : undefined}
                      value={draftValue !== undefined ? String(draftValue) : displayValue}
                      onChange={(e) => {
                        const nextValue = e.target.value as T[typeof columnName];
                        setRowDraftValue(setDrafts, item.id, columnName, nextValue);
                      }}
                    />
                  ) : (
                    <TableInfoValue info={col.info} value={displayValue} />
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
