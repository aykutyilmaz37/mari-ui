"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@mari-ui/core";
import {
  dayGridKeyStep,
  fullDateLabel,
  getISOWeek,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  weekdayNames,
  type WeekStart,
} from "../../lib/date";

export type RangePosition = "start" | "end" | "middle" | "single";

export interface DayCellInfo {
  date: Date;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  outside: boolean;
  range: RangePosition | null;
}

export interface DayGridProps {
  /** Gösterilen ay (gün önemsiz). */
  view: Date;
  /** Klavye odağının (roving tabindex) bulunduğu gün. */
  focused: Date;
  onFocusChange: (date: Date) => void;
  isSelected: (date: Date) => boolean;
  /** Aralık seçiminde günün konumu (vurgu için). */
  rangeOf?: (date: Date) => RangePosition | null;
  isDisabled: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  /** Fareyle üzerine gelinen gün (aralık önizlemesi). */
  onHover?: (date: Date | null) => void;
  weekStart?: WeekStart;
  locale?: string;
  /** `full`: büyük hücreler, içerik alanı (Calendar fullscreen). */
  variant?: "compact" | "full";
  showWeek?: boolean;
  /** Hücreye ek içerik (yalnız `full`). */
  cellRender?: (info: DayCellInfo) => React.ReactNode;
  /** Izgaranın adı — ör. "Ekim 2026". */
  label: string;
  /** Odak ızgaradaysa ya da `true` ise odaklanan gün DOM odağını alır. */
  takeFocus?: boolean;
}

const RANGE_BG: Record<RangePosition, string> = {
  start: "before:absolute before:inset-y-0.5 before:left-1/2 before:right-0 before:bg-mari-primary-subtle",
  end: "before:absolute before:inset-y-0.5 before:left-0 before:right-1/2 before:bg-mari-primary-subtle",
  middle: "before:absolute before:inset-y-0.5 before:inset-x-0 before:bg-mari-primary-subtle",
  single: "",
};

function compactDayClass(info: DayCellInfo) {
  const strong = info.selected || info.range === "start" || info.range === "end" || info.range === "single";
  return cn(
    "relative z-10 mx-auto flex size-8 items-center justify-center rounded-md tabular-nums transition-colors",
    strong && "bg-mari-primary-solid font-medium text-mari-primary-solid-contrast",
    !strong && info.today && "font-semibold text-mari-primary ring-1 ring-mari-primary ring-inset",
    !strong && !info.disabled && "group-hover:bg-mari-surface-alt",
    info.outside && !strong && "text-mari-muted",
    info.disabled && "text-mari-disabled line-through decoration-mari-disabled/60"
  );
}

/**
 * Faz 16.5 — APG "date grid": `<table role="grid">`, sütun başlıkları gün
 * adları (tam adı `abbr`), hücreler roving tabindex (yalnız odaklı gün
 * sekme durağı). ←/→ gün, ↑/↓ hafta, Home/End hafta başı/sonu, PageUp/Down ay
 * (Shift ile yıl), Enter/Boşluk seçer. Ay dışına taşan odak `onFocusChange`
 * ile bildirilir — görünen ayı değiştirmek kapsayıcının işi.
 */
export function DayGrid({
  view,
  focused,
  onFocusChange,
  isSelected,
  rangeOf,
  isDisabled,
  onSelect,
  onHover,
  weekStart = 1,
  locale,
  variant = "compact",
  showWeek = false,
  cellRender,
  label,
  takeFocus = false,
}: DayGridProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const today = new Date();
  const weeks = getMonthGrid(view.getFullYear(), view.getMonth(), weekStart);
  // Türkçe dar adlar belirsiz (P/S/Ç/P/C/C/P — iki P, iki C) → her zaman kısa ad.
  const shortNames = weekdayNames(locale, weekStart, "short");
  const longNames = weekdayNames(locale, weekStart, "long");
  const full = variant === "full";

  // Odak ızgaranın içindeyken (klavye gezinmesi) ya da açılışta odaklı güne DOM odağı.
  // Klavyeyle gezinince odak yeni hücreye taşınır — ay/sayfa değişince eski hücre DOM'dan
  // kalkar ve odak <body>'ye düşerdi, `contains(activeElement)` bunu yakalayamazdı.
  const navigating = useRef(false);
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    if (!takeFocus && !navigating.current && !table.contains(document.activeElement)) return;
    navigating.current = false;
    table.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [focused, takeFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isDisabled(focused)) onSelect(focused);
      return;
    }
    const next = dayGridKeyStep(focused, e.key, e.shiftKey, weekStart);
    if (!next) return;
    e.preventDefault();
    navigating.current = true;
    onFocusChange(next);
  };

  return (
    <table
      ref={tableRef}
      role="grid"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseLeave={() => onHover?.(null)}
      className={cn("w-full border-collapse text-sm", full ? "table-fixed" : "")}
    >
      <thead>
        <tr>
          {showWeek && (
            <th scope="col" abbr="Hafta" className="relative w-8 pb-1 text-xs font-normal text-mari-muted">
              <span aria-hidden>Hf</span>
              <span className="sr-only">Hafta</span>
            </th>
          )}
          {shortNames.map((name, i) => (
            <th key={longNames[i]} scope="col" abbr={longNames[i]} className={cn("relative pb-1 text-xs font-normal text-mari-muted", full ? "pr-2 text-right" : "text-center")}>
              <span aria-hidden>{name}</span>
              <span className="sr-only">{longNames[i]}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]!.toDateString()}>
            {showWeek && (
              <td className="relative text-center text-xs text-mari-muted tabular-nums">
                {getISOWeek(week[3]!)}
              </td>
            )}
            {week.map((date) => {
              const info: DayCellInfo = {
                date,
                selected: isSelected(date),
                today: isSameDay(date, today),
                disabled: isDisabled(date),
                outside: !isSameMonth(date, view),
                range: rangeOf?.(date) ?? null,
              };
              const isFocused = isSameDay(date, focused);
              return (
                <td
                  key={date.toDateString()}
                  role="gridcell"
                  tabIndex={isFocused ? 0 : -1}
                  // Kompakt hücrede ad = tam tarih. Tam ekranda aria-label hücre İÇERİĞİNİ (etkinlikler)
                  // gizlerdi → ad içerikten: görünmez tam tarih + içerik.
                  aria-label={full ? undefined : fullDateLabel(date, locale)}
                  aria-selected={info.selected || info.range !== null}
                  aria-disabled={info.disabled || undefined}
                  aria-current={info.today ? "date" : undefined}
                  onClick={() => {
                    onFocusChange(date);
                    if (!info.disabled) onSelect(date);
                  }}
                  onMouseEnter={() => onHover?.(date)}
                  className={cn(
                    "group relative cursor-pointer p-0 outline-none",
                    info.disabled && "cursor-not-allowed",
                    // Odak halkası hücrenin iç kutusunda (yuvarlak gün kutusu) görünsün.
                    full
                      ? "[&:focus-visible>div]:outline-2 [&:focus-visible>div]:outline-offset-1 [&:focus-visible>div]:outline-mari-ring"
                      : "[&:focus-visible>div>span]:outline-2 [&:focus-visible>div>span]:outline-offset-1 [&:focus-visible>div>span]:outline-mari-ring",
                    !full && info.range && RANGE_BG[info.range],
                    full && "align-top"
                  )}
                >
                  {full ? (
                    <div
                      className={cn(
                        "m-0.5 flex h-24 flex-col gap-1 overflow-hidden rounded-md border-t-2 p-1.5 text-left transition-colors",
                        info.selected ? "border-mari-primary bg-mari-primary-subtle" : "border-mari-border",
                        !info.selected && !info.disabled && "group-hover:bg-mari-surface-alt",
                        info.outside && "text-mari-muted",
                        info.disabled && "bg-mari-surface-alt text-mari-disabled"
                      )}
                    >
                      <span aria-hidden className={cn("self-end text-sm tabular-nums", info.today && "rounded-sm bg-mari-primary-solid px-1 font-semibold text-mari-primary-solid-contrast")}>
                        {date.getDate()}
                      </span>
                      <span className="sr-only">{fullDateLabel(date, locale)}</span>
                      {/* Kaydırılmaz (hücre içi kaydırma klavyeyle erişilemezdi): içerik özet olmalı, fazlası "+N". */}
                      {cellRender && <div className="min-h-0 flex-1 overflow-hidden text-xs">{cellRender(info)}</div>}
                    </div>
                  ) : (
                    <div className="py-0.5">
                      <span className={compactDayClass(info)}>{date.getDate()}</span>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
