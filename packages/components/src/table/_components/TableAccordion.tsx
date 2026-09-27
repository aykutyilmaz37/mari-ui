"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Empty } from "../../empty";
import { Input } from "../../input";
import { clearRowDraft, setRowDraftValue } from "../utils";
import type { ColumnDef, TableEmptyStateConfig } from "../types";
import { TableInfoValue } from "./TableInfoValue";
import { TableRowActions } from "./TableRowActions";

export interface TableAccordionProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyState?: TableEmptyStateConfig;
  className?: string;
}

/**
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
export function TableAccordion<T extends { id: string }>({ data, columns, emptyState, className }: TableAccordionProps<T>) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<T>>>({});

  const actionsColumn = columns.find((c) => c.actions);
  const fieldColumns = columns.filter((c) => !c.actions);
  const [titleColumn, ...restColumns] = fieldColumns;

  if (data.length === 0) {
    return (
      <div className={cn("rounded-md border border-mari-border", className)}>
        <Empty size="sm" title={emptyState?.title ?? "Veri Bulunamadı"} description={emptyState?.description} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-mari-border rounded-md border border-mari-border", className)}>
      {data.map((item) => {
        const isOpen = openId === item.id;
        const isEditing = editingRowId === item.id;
        const draft: Partial<T> = drafts[item.id] ?? {};
        const titleValue = titleColumn?.columnName ? item[titleColumn.columnName] : undefined;
        const displayTitle = titleValue != null ? String(titleValue) : "-";
        const panelId = `table-accordion-panel-${item.id}`;

        return (
          <div key={item.id}>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex flex-1 items-center gap-2 text-start font-medium text-mari-foreground"
              >
                <ChevronDownIcon className={cn("h-4 w-4 shrink-0 text-mari-muted transition-transform", isOpen && "rotate-180")} />
                {displayTitle}
              </button>
              {actionsColumn?.actions && (
                <TableRowActions
                  actions={actionsColumn.actions}
                  item={item}
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
                          <TableInfoValue info={col.info} value={displayValue} />
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
