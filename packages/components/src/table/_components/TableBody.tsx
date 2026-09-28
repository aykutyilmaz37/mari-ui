"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import { Input } from "../../input";
import { Empty } from "../../empty";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import {
  clearRowDraft,
  getActionsJustifyClass,
  getAlignClass,
  getRowLabel,
  setRowDraftValue,
  skeletonRowCount,
  skeletonWidth,
  type DraftsSetter,
} from "../utils";
import type { ColumnDef, TableEmptyStateConfig } from "../types";
import { TableCellSkeleton } from "./TableCellSkeleton";
import { TableInfoValue } from "./TableInfoValue";
import { TableRowActions } from "./TableRowActions";

export interface TableBodyProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyState?: TableEmptyStateConfig;
  skeleton?: boolean;
  /** Veri yokken iskelette kaç sahte satır çizileceği (sayfa boyu). */
  pageSize?: number;
}

/**
 * İşlemler hücresi. `text-align` (bkz. `getAlignClass`) sadece SATIR İÇİ
 * içeriği hizalar — `TableRowActions`'ın bloğu onu yok sayıyordu, bu yüzden
 * hizalama `justify-*` ile bloğun KENDİSİNE uygulanır. Sütun ikonlara göre dar
 * (`w-px whitespace-nowrap`) ve yatay kaydırmada sağda `sticky`.
 */
const ACTIONS_CELL_CLASS = "sticky right-0 w-px whitespace-nowrap border-l border-mari-border bg-mari-surface px-4 py-2.5";

/**
 * Veri hücresi. `max-w-64` KASITLI: `table-auto`'da sütun serbestçe
 * büyüyüp `line-clamp-2` hiç tetiklenmiyordu (kullanıcı bulgusu: "iki satıra
 * düşsün, horizontal scroll olacak"). `text-sm`: başlıktan (text-xs) orantılı.
 */
const DATA_CELL_CLASS = "max-w-64 px-4 py-2.5 text-sm break-words";

interface DataCellProps<T extends { id: string }> {
  col: ColumnDef<T>;
  item: T;
  rowIndex: number;
  columnIndex: number;
  isEditing: boolean;
  draft: Partial<T>;
  setDrafts: DraftsSetter<T>;
  skeleton: boolean;
}

function DataCell<T extends { id: string }>({ col, item, rowIndex, columnIndex, isEditing, draft, setDrafts, skeleton }: DataCellProps<T>) {
  const columnName = col.columnName;
  const rawValue = columnName ? item[columnName] : undefined;
  // `0`/`false`/`""` geçerli değerlerdir — sadece null/undefined "-" olur.
  const displayValue = rawValue != null ? String(rawValue) : "-";

  let content: React.ReactNode;
  if (isEditing && columnName) {
    const draftValue = draft[columnName];
    content = (
      <Input
        aria-label={typeof col.header === "string" ? col.header : undefined}
        // Değeri kesmeden gösterecek asgari genişlik — tablo zaten yatay kayabiliyor.
        className="min-w-36"
        value={draftValue !== undefined ? String(draftValue) : displayValue}
        onChange={(e) => setRowDraftValue(setDrafts, item.id, columnName, e.target.value as T[typeof columnName])}
      />
    );
  } else if (col.render) {
    content = col.render(rawValue, item, rowIndex);
  } else {
    content = <TableInfoValue info={col.info} value={displayValue} />;
  }

  return (
    <td className={cn(DATA_CELL_CLASS, getAlignClass(col.align))}>
      <SkeletonSlot
        on={skeleton}
        className="items-center"
        placeholder={<TableCellSkeleton width={skeletonWidth(columnIndex, rowIndex)} className={getActionsJustifyClass(col.align)} />}
      >
        {content}
      </SkeletonSlot>
    </td>
  );
}

/** Veri henüz yokken (`skeleton` + boş `data`) çizilen sahte satırlar — gerçek tek satırlık satırla aynı yükseklik. */
function PlaceholderRows<T extends { id: string }>({ columns, count }: { columns: ColumnDef<T>[]; count: number }) {
  return (
    <tbody aria-hidden>
      {Array.from({ length: count }, (_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-mari-border last:border-b-0">
          {columns.map((col, columnIndex) =>
            col.actions ? (
              <td key={columnIndex} className={ACTIONS_CELL_CLASS}>
                <TableCellSkeleton width="3rem" className={getActionsJustifyClass(col.align)} />
              </td>
            ) : (
              <td key={columnIndex} className={DATA_CELL_CLASS}>
                <TableCellSkeleton width={skeletonWidth(columnIndex, rowIndex)} className={getActionsJustifyClass(col.align)} />
              </td>
            )
          )}
        </tr>
      ))}
    </tbody>
  );
}

export function TableBody<T extends { id: string }>({ data, columns, emptyState, skeleton = false, pageSize }: TableBodyProps<T>) {
  // Satır içi düzenleme durumu satır seviyesinde: aksiyon hücresindeki
  // "düzenle" AYNI satırdaki veri hücrelerini de <Input>'a çeviriyor.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<T>>>({});

  if (skeleton && data.length === 0) return <PlaceholderRows columns={columns} count={skeletonRowCount(pageSize)} />;

  if (data.length === 0) {
    // `text-start` açıkça: colSpan hücresi hizayı miras almıyordu (kullanıcı bulgusu).
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-0 text-start">
            <Empty size="sm" title={emptyState?.title ?? "Veri Bulunamadı"} description={emptyState?.description} />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map((item, rowIndex) => {
        const draft: Partial<T> = drafts[item.id] ?? {};
        const isEditing = !skeleton && editingRowId === item.id;
        return (
          <tr key={item.id} className={cn("border-b border-mari-border last:border-b-0", !skeleton && "transition-colors hover:bg-mari-surface-alt/50")}>
            {columns.map((col, columnIndex) =>
              col.actions ? (
                <td key={columnIndex} className={ACTIONS_CELL_CLASS}>
                  <SkeletonSlot on={skeleton} flow="flex" className="items-center" placeholder={<TableCellSkeleton width="3rem" className={getActionsJustifyClass(col.align)} />}>
                    <div className={cn("flex", getActionsJustifyClass(col.align))}>
                      <TableRowActions
                        actions={col.actions}
                        item={item}
                        rowLabel={getRowLabel(columns, item)}
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
                  </SkeletonSlot>
                </td>
              ) : (
                <DataCell
                  key={columnIndex}
                  col={col}
                  item={item}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  isEditing={isEditing}
                  draft={draft}
                  setDrafts={setDrafts}
                  skeleton={skeleton}
                />
              )
            )}
          </tr>
        );
      })}
    </tbody>
  );
}
