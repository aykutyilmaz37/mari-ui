"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import { Input } from "../../input";
import { getColumnClass } from "../utils";
import type { ColumnDef } from "../types";
import { TableInfoValue } from "./TableInfoValue";
import { TableRowActions } from "./TableRowActions";

export interface TableBodyProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
}

type DraftsSetter<T> = React.Dispatch<React.SetStateAction<Record<string, Partial<T>>>>;

/**
 * Modül seviyesinde (component'in İÇİNDE değil) tanımlı — bu iki fonksiyon
 * olmadan `setDrafts((prev) => {...})` çağrıları `data.map > columns.map >
 * onSaveInlineEdit/onChange` içine gömülü kalıp 5 kat iç içe fonksiyona
 * çıkıyordu (SonarJS `no-nested-functions`, Faz 8'de yakalandı — sınır 4).
 * Burada tanımlanınca çağrı yerinde artık yeni bir fonksiyon TANIMI değil,
 * düz bir fonksiyon ÇAĞRISI kalıyor.
 */
function clearRowDraft<T>(setDrafts: DraftsSetter<T>, id: string) {
  setDrafts((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
}

function setRowDraftValue<T>(setDrafts: DraftsSetter<T>, id: string, columnName: keyof T, value: T[keyof T]) {
  setDrafts((prev) => {
    // TS, jenerik bir `keyof T` anahtarıyla computed-property atamasını
    // statik olarak doğrulayamıyor (bilinen bir TS kısıtı) — tek satırlık
    // bir cast ile çözülüyor, `columnName`/`value` zaten çağıranda tam tipli.
    const rowDraft = { ...prev[id], [columnName]: value } as Partial<T>;
    return { ...prev, [id]: rowDraft };
  });
}

export function TableBody<T extends { id: string }>({ data, columns }: TableBodyProps<T>) {
  // Satır içi düzenleme durumu burada (satır seviyesinde) yaşıyor çünkü
  // aksiyon hücresindeki "düzenle" butonu AYNI satırdaki diğer (veri)
  // hücrelerinin de <Input>'a dönüşmesini tetikliyor — bu, tek bir
  // hücrenin kendi başına bilemeyeceği, satır çapında bir durumdur.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<T>>>({});

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-4 text-center text-mari-muted">
            Veri yok.
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
          <tr key={item.id}>
            {columns.map((col, columnIndex) => {
              if (col.actions) {
                return (
                  <td key={columnIndex} className={cn("p-2", getColumnClass(columnIndex, columns.length))}>
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
                <td key={columnIndex} className={cn("w-fit p-2", getColumnClass(columnIndex, columns.length))}>
                  {isEditing && columnName ? (
                    <Input
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
