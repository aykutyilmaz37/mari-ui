"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@mari-ui/core";
import { skeletonBoxProps } from "../../lib/skeleton";
import { cellGridKeyStep } from "../../lib/date";

export interface GridCell {
  key: string;
  /** Hücrede görünen (ör. "Eki", "2026"). */
  label: React.ReactNode;
  /** Ekran okuyucu adı (ör. "Ekim 2026"). */
  fullLabel: string;
  selected: boolean;
  current: boolean;
  disabled: boolean;
  /** Önceki/sonraki döneme ait (on yılın dışındaki yıllar). */
  outside?: boolean;
}

export interface CellGridProps {
  cells: GridCell[];
  focusedIndex: number;
  /** Odak ızgara dışına taşarsa (ör. -1 ya da 12) kapsayıcı sayfayı değiştirir. */
  onFocusIndex: (index: number) => void;
  onSelect: (index: number) => void;
  label: string;
  columns?: number;
  variant?: "compact" | "full";
  /** Hücreye ek içerik (yalnız `full`). */
  cellRender?: (index: number) => React.ReactNode;
  takeFocus?: boolean;
  /** PageUp/PageDown: sayfa (yıl / on yıl) değiştir. */
  onPage?: (delta: -1 | 1) => void;
  skeleton?: boolean;
}

function GridCellView({ cell, focused, full, content, onClick }: { cell: GridCell; focused: boolean; full: boolean; content: React.ReactNode; onClick: () => void }) {
  const solid = cell.selected && !full;
  return (
    <td
      role="gridcell"
      tabIndex={focused ? 0 : -1}
      aria-label={full ? undefined : cell.fullLabel}
      aria-selected={cell.selected}
      aria-disabled={cell.disabled || undefined}
      aria-current={cell.current ? "date" : undefined}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer p-1 outline-none",
        cell.disabled && "cursor-not-allowed",
        "[&:focus-visible>div]:outline-2 [&:focus-visible>div]:outline-offset-1 [&:focus-visible>div]:outline-mari-ring"
      )}
    >
      <div
        className={cn(
          "rounded-md transition-colors",
          full ? "flex h-24 flex-col gap-1 border-t-2 p-1.5 text-left max-sm:h-16" : "flex h-9 items-center justify-center pointer-coarse:h-11",
          solid && "bg-mari-primary-solid font-medium text-mari-primary-solid-contrast",
          cell.selected && full && "border-mari-primary bg-mari-primary-subtle",
          !cell.selected && full && "border-mari-border",
          !cell.selected && !cell.disabled && "group-hover:bg-mari-surface-alt",
          !cell.selected && cell.current && !full && "font-semibold text-mari-primary ring-1 ring-mari-primary ring-inset",
          cell.outside && !cell.selected && "text-mari-muted",
          cell.disabled && "text-mari-disabled line-through"
        )}
      >
        {full ? (
          <>
            <span aria-hidden className={cn("self-end", cell.current && "font-semibold text-mari-primary")}>
              {cell.label}
            </span>
            <span className="sr-only">{cell.fullLabel}</span>
            {content && <div className="min-h-0 flex-1 overflow-hidden text-xs">{content}</div>}
          </>
        ) : (
          cell.label
        )}
      </div>
    </td>
  );
}

/** Ay ve yıl seçimi için 3 sütunlu APG ızgarası (roving tabindex). */
export function CellGrid({ cells, focusedIndex, onFocusIndex, onSelect, label, columns = 3, variant = "compact", cellRender, takeFocus = false, onPage, skeleton = false }: CellGridProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const full = variant === "full";
  // Klavyeyle gezinince odak yeni hücreye taşınır — ay/sayfa değişince eski hücre DOM'dan
  // kalkar ve odak <body>'ye düşerdi, `contains(activeElement)` bunu yakalayamazdı.
  const navigating = useRef(false);
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    if (!takeFocus && !navigating.current && !table.contains(document.activeElement)) return;
    navigating.current = false;
    table.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [focusedIndex, takeFocus]);

  const rows: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += columns) rows.push(cells.slice(i, i + columns));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!cells[focusedIndex]?.disabled) onSelect(focusedIndex);
      return;
    }
    if ((e.key === "PageUp" || e.key === "PageDown") && onPage) {
      e.preventDefault();
      navigating.current = true;
      onPage(e.key === "PageUp" ? -1 : 1);
      return;
    }
    const next = cellGridKeyStep(focusedIndex, e.key, columns);
    if (next === null) return;
    e.preventDefault();
    navigating.current = true;
    onFocusIndex(next);
  };

  return (
    <table
      ref={tableRef}
      role={skeleton ? undefined : "grid"}
      aria-label={skeleton ? undefined : label}
      aria-hidden={skeleton || undefined}
      onKeyDown={skeleton ? undefined : onKeyDown}
      className="w-full border-collapse text-sm"
    >
      <tbody>
        {rows.map((row, r) => (
          // Satırlar konumsal ve sabit (3×4).
          <tr key={r}>
            {row.map((cell, c) => {
              const index = r * columns + c;
              if (skeleton) {
                return (
                  <td key={cell.key} className="p-1">
                    <div className={cn("flex rounded-md", full ? "h-24 flex-col border-t-2 border-mari-border p-1.5" : "h-9 items-center justify-center")}>
                      <span {...skeletonBoxProps(cn("rounded-sm", full && "self-end"))}>{cell.label}</span>
                    </div>
                  </td>
                );
              }
              return (
                <GridCellView
                  key={cell.key}
                  cell={cell}
                  focused={index === focusedIndex}
                  full={full}
                  content={cellRender?.(index)}
                  onClick={() => {
                    onFocusIndex(index);
                    if (!cell.disabled) onSelect(index);
                  }}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
