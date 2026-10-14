"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Empty } from "../../empty";
import { Input } from "../../input";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import { clearRowDraft, getRowLabel, setRowDraftValue, skeletonRowCount, skeletonWidth } from "../utils";
import { TableCellSkeleton } from "./TableCellSkeleton";
import type { ColumnDef, TableEmptyStateConfig } from "../types";
import { TableInfoValue } from "./TableInfoValue";
import { TableRowActions } from "./TableRowActions";

export interface TableAccordionProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyState?: TableEmptyStateConfig;
  className?: string;
  skeleton?: boolean;
  pageSize?: number;
}

/*
 * `responsive="accordion"` iken dar ekranda (`md` altı) `Table`'ın normal
 * tablo görünümü YERİNE render edilir — kullanıcı bulgusu: "responsive'de
 * tablo görünümünden ziyade accordionlu bir şekilde satırları göstermek
 * isteyebilir". İlk (aksiyon olmayan) sütun satır başlığı olarak, geri
 * kalanı açılınca `<dl>` etiket/değer listesi olarak gösterilir. Satır içi
 * düzenleme (`editRowInInline`) masaüstü tablodakiyle AYNI mekanizmayı
 * kullanır (`clearRowDraft`/`setRowDraftValue`) — ikisi CSS breakpoint'iyle
 * gizlenip gösterildiği için aynı anda ikisi de DOM'da, ama her biri kendi
 * taslak state'ini tutar (bir satırı bir görünümde düzenlemeye başlayıp
 * ekran boyutunu ortasında değiştirmek taslağı sıfırlar — kabul edilen bir
 * kenar durumu).
 */
function renderTitle<T extends { id: string }>(column: ColumnDef<T> | undefined, value: T[keyof T] | undefined, item: T, rowIndex: number): React.ReactNode {
  if (column?.render) return column.render(value, item, rowIndex);
  return value != null ? String(value) : "-";
}

function renderValue<T extends { id: string }>(col: ColumnDef<T>, value: T[keyof T] | undefined, item: T, rowIndex: number): React.ReactNode {
  if (col.render) return col.render(value, item, rowIndex);
  return <TableInfoValue info={col.info} value={value != null ? String(value) : "-"} />;
}

export function TableAccordion<T extends { id: string }>({ data, columns, emptyState, className, skeleton = false, pageSize }: Readonly<TableAccordionProps<T>>) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<T>>>({});

  const actionsColumn = columns.find((c) => c.actions);
  const fieldColumns = columns.filter((c) => !c.actions);
  const [titleColumn, ...restColumns] = fieldColumns;

  if (skeleton && data.length === 0) {
    // Veri henüz yok: kapalı satır başlıklarıyla aynı yükseklikte sahte satırlar.
    return (
      <div aria-hidden className={cn("flex flex-col divide-y divide-mari-border rounded-md border border-mari-border", className)}>
        {Array.from({ length: skeletonRowCount(pageSize) }, (_, i) => (
          // h-6 = başlık düğmesinin satır yüksekliği, h-8 = `sm` eylem düğmesi.
          <div key={i} className="flex items-center gap-2 px-3 py-2.5">
            <TableCellSkeleton width={skeletonWidth(0, i)} className="h-6 flex-1" />
            {actionsColumn && <TableCellSkeleton width="3rem" className="h-8 w-16 justify-end" />}
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("rounded-md border border-mari-border", className)}>
        <Empty size="sm" title={emptyState?.title ?? "Veri Bulunamadı"} description={emptyState?.description} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-mari-border rounded-md border border-mari-border", className)}>
      {data.map((item, rowIndex) => {
        const isOpen = !skeleton && openId === item.id;
        const isEditing = !skeleton && editingRowId === item.id;
        const draft: Partial<T> = drafts[item.id] ?? {};
        const titleValue = titleColumn?.columnName ? item[titleColumn.columnName] : undefined;
        const displayTitle = renderTitle(titleColumn, titleValue, item, rowIndex);
        const panelId = `table-accordion-panel-${item.id}`;

        return (
          <div key={item.id}>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <SkeletonSlot on={skeleton} className="min-w-0 flex-1 items-center" placeholder={<TableCellSkeleton width={skeletonWidth(0, rowIndex)} className="h-6" />}>
                {/* Faz 15: odak halkası yoktu (klavyede hangi satırda olunduğu görünmüyordu). */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-start font-medium text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
                >
                  <ChevronDownIcon aria-hidden className={cn("h-4 w-4 shrink-0 text-mari-muted transition-transform", isOpen && "rotate-180")} />
                  <span className="min-w-0">{displayTitle}</span>
                </button>
              </SkeletonSlot>
              {actionsColumn?.actions && (
                <SkeletonSlot on={skeleton} flow="flex" className="items-center justify-items-end" placeholder={<TableCellSkeleton width="3rem" className="h-8 justify-end" />}>
                  <TableRowActions
                    actions={actionsColumn.actions}
                    item={item}
                    rowLabel={getRowLabel(columns, item)}
                    isInlineEditing={isEditing}
                    onStartInlineEdit={() => {
                      setEditingRowId(item.id);
                      setOpenId(item.id);
                    }}
                    onSaveInlineEdit={() => {
                      actionsColumn.actions?.editRowInInline?.onChange({ ...item, ...draft });
                      setEditingRowId(null);
                      clearRowDraft(setDrafts, item.id);
                    }}
                    onCancelInlineEdit={() => {
                      setEditingRowId(null);
                      clearRowDraft(setDrafts, item.id);
                    }}
                  />
                </SkeletonSlot>
              )}
            </div>
            {isOpen && restColumns.length > 0 && (
              <dl id={panelId} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-mari-border bg-mari-surface-alt/40 px-3 py-3 text-sm">
                {restColumns.map((col, idx) => {
                  const columnName = col.columnName;
                  const rawValue = columnName ? item[columnName] : undefined;
                  const displayValue = rawValue != null ? String(rawValue) : "-";
                  const draftValue = columnName ? draft[columnName] : undefined;

                  return (
                    <React.Fragment key={idx}>
                      <dt className="text-mari-muted">{col.header}</dt>
                      <dd className="text-mari-foreground">
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
                          renderValue(col, rawValue, item, rowIndex)
                        )}
                      </dd>
                    </React.Fragment>
                  );
                })}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}
