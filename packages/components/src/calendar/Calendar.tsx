"use client";

import React, { useState } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { Button } from "../button";
import { addMonths, isSameDay, isSameMonth, isWithin, monthNames, startOfDay } from "../lib/date";
import { skeletonBoxProps } from "../lib/skeleton";
import { Segmented } from "../segmented";
import { Select } from "../select";
import { CellGrid } from "./_components/CellGrid";
import { DayGrid, type DayCellInfo } from "./_components/DayGrid";
import type { CalendarMode, CalendarProps } from "./types";

export type { CalendarProps };

const YEAR_SPAN = 10;

function yearOptions(year: number, range?: [Date, Date]) {
  const from = range ? range[0].getFullYear() : year - YEAR_SPAN;
  const to = range ? range[1].getFullYear() : year + YEAR_SPAN;
  return Array.from({ length: to - from + 1 }, (_, i) => ({ value: from + i, label: String(from + i) }));
}

/**
 * Faz 16.5 — yapı ant.design Calendar'dan: başlıkta yıl + ay seçici ve
 * Ay/Yıl modu; `fullscreen` (varsayılan) büyük hücreler ve `cellRender`
 * içeriği (etkinlik takvimi), `fullscreen={false}` kompakt kart. Gün
 * ızgarası DatePicker ile ortak (APG date grid, klavye).
 */
export function Calendar({
  value,
  defaultValue,
  onChange,
  onSelect,
  onPanelChange,
  mode: modeProp,
  defaultMode = "month",
  fullscreen = true,
  disabledDate,
  validRange,
  cellRender,
  weekStart = 1,
  showWeek = false,
  locale,
  "aria-label": ariaLabel = "Takvim",
  className,
  skeleton = false,
}: Readonly<CalendarProps>) {
  const [selected, setSelected] = useControllableState<Date | null>({ value, defaultValue: defaultValue ?? null });
  const [mode, setMode] = useControllableState<CalendarMode>({ value: modeProp, defaultValue: defaultMode });
  const [view, setView] = useState(() => selected ?? startOfDay(new Date()));
  // Kontrollü değer dışarıdan değişince görünen dönem de oraya gitsin.
  const [lastValue, setLastValue] = useState(selected);
  if (selected !== lastValue) {
    setLastValue(selected);
    if (selected && !isSameMonth(selected, view)) setView(selected);
  }

  const today = startOfDay(new Date());
  const isDisabled = disabledChecker(validRange, disabledDate);
  const long = monthNames(locale, "long");

  /** Gezinme (yıl/ay seçici, ay dışına klavye) değeri de taşır — ant.design davranışı. */
  const navigate = (next: Date, nextMode: CalendarMode = mode) => {
    setView(next);
    onPanelChange?.(next, nextMode);
  };

  const choose = (date: Date, source: "date" | "month" | "year" | "today") => {
    if (isDisabled(date)) return;
    setSelected(date);
    onChange?.(date);
    onSelect?.(date, { source });
    if (!isSameMonth(date, view)) navigate(date);
  };

  const header = (
    <CalendarHeader
      fullscreen={fullscreen}
      mode={mode}
      view={view}
      locale={locale}
      validRange={validRange}
      onNavigate={navigate}
      onModeChange={(m) => {
        setMode(m);
        onPanelChange?.(view, m);
      }}
      onToday={() => choose(today, "today")}
      todayDisabled={isDisabled(today)}
      skeleton={skeleton}
    />
  );

  const body =
    mode === "month" ? (
      <DayGrid
        view={view}
        focused={selected && isSameMonth(selected, view) ? selected : view}
        onFocusChange={(d) => {
          if (!isSameMonth(d, view)) navigate(d);
          else setView(d);
        }}
        isSelected={(d) => isSameDay(d, selected)}
        isDisabled={isDisabled}
        onSelect={(d) => choose(d, "date")}
        weekStart={weekStart}
        locale={locale}
        showWeek={showWeek}
        variant={fullscreen ? "full" : "compact"}
        label={`${long[view.getMonth()]} ${view.getFullYear()}`}
        cellRender={adaptDayRender(cellRender)}
        skeleton={skeleton}
      />
    ) : (
      <YearBody view={view} selected={selected} today={today} fullscreen={fullscreen} locale={locale} validRange={validRange} cellRender={skeleton ? undefined : cellRender} onNavigate={navigate} onPick={(d) => choose(d, "month")} skeleton={skeleton} />
    );

  return (
    <section aria-label={ariaLabel} aria-busy={skeleton || undefined} className={cn("text-mari-foreground", !fullscreen && "w-full max-w-80 pointer-coarse:max-w-[21rem] rounded-lg border border-mari-border bg-mari-surface", className)}>
      {header}
      <div className={cn(!fullscreen && "p-2")}>{body}</div>
    </section>
  );
}

/** `validRange` dışı ya da `disabledDate` → devre dışı. */
function disabledChecker(validRange: CalendarProps["validRange"], disabledDate: CalendarProps["disabledDate"]) {
  return (d: Date) => (validRange ? !isWithin(d, validRange[0], validRange[1]) : false) || !!disabledDate?.(d);
}

function adaptDayRender(cellRender: CalendarProps["cellRender"]): ((info: DayCellInfo) => React.ReactNode) | undefined {
  if (!cellRender) return undefined;
  return (info) => cellRender(info.date, { type: "date", selected: info.selected, today: info.today, disabled: info.disabled, outside: info.outside });
}

const startOfMonthOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

interface HeaderProps {
  fullscreen: boolean;
  mode: CalendarMode;
  view: Date;
  locale?: string;
  validRange?: [Date, Date];
  onNavigate: (date: Date) => void;
  onModeChange: (mode: CalendarMode) => void;
  onToday: () => void;
  todayDisabled: boolean;
  skeleton: boolean;
}

/** Başlık: (tam ekranda) dönem adı, yıl ve ay seçicileri, Ay/Yıl modu, Bugün. */
function CalendarHeader({ fullscreen, mode, view, locale, validRange, onNavigate, onModeChange, onToday, todayDisabled, skeleton }: Readonly<HeaderProps>) {
  const long = monthNames(locale, "long");
  const short = monthNames(locale, "short");
  const keepDay = (y: number, m: number) => new Date(y, m, Math.min(view.getDate(), 28));
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", fullscreen ? "pb-3" : "border-b border-mari-border p-2")}>
      {fullscreen && (
        <h2 aria-live="polite" className="mr-auto text-lg font-semibold text-mari-foreground">
          <span {...(skeleton ? skeletonBoxProps("rounded-sm") : {})}>{mode === "month" ? `${long[view.getMonth()]} ${view.getFullYear()}` : view.getFullYear()}</span>
        </h2>
      )}
      <Select skeleton={skeleton} size="sm" aria-label="Yıl" options={yearOptions(view.getFullYear(), validRange)} value={view.getFullYear()} onChange={(y) => onNavigate(keepDay(Number(y), view.getMonth()))} className="w-24" />
      {mode === "month" && (
        <Select
          skeleton={skeleton}
          size="sm"
          aria-label="Ay"
          options={long.map((m, i) => ({ value: i, label: fullscreen ? m : short[i] }))}
          value={view.getMonth()}
          onChange={(m) => onNavigate(keepDay(view.getFullYear(), Number(m)))}
          className={fullscreen ? "w-32" : "w-24"}
        />
      )}
      <Segmented
        skeleton={skeleton}
        size="sm"
        aria-label="Görünüm"
        options={[
          { value: "month", label: "Ay" },
          { value: "year", label: "Yıl" },
        ]}
        value={mode}
        onChange={(m) => onModeChange(m as CalendarMode)}
      />
      {fullscreen && (
        <Button skeleton={skeleton} size="sm" variant="outline" color="neutral" onClick={onToday} disabled={todayDisabled}>
          Bugün
        </Button>
      )}
    </div>
  );
}

interface YearBodyProps {
  view: Date;
  selected: Date | null;
  today: Date;
  fullscreen: boolean;
  locale?: string;
  validRange?: [Date, Date];
  cellRender?: CalendarProps["cellRender"];
  onNavigate: (date: Date) => void;
  onPick: (date: Date) => void;
  skeleton: boolean;
}

/** Yıl modu: 12 ay (3×4 ızgara). */
function YearBody({ view, selected, today, fullscreen, locale, validRange, cellRender, onNavigate, onPick, skeleton }: Readonly<YearBodyProps>) {
  const long = monthNames(locale, "long");
  const short = monthNames(locale, "short");
  const year = view.getFullYear();
  const info = (first: Date) => ({ type: "month" as const, selected: isSameMonth(first, selected), today: isSameMonth(first, today), disabled: false, outside: false });
  return (
    <CellGrid
      variant={fullscreen ? "full" : "compact"}
      label={`${year} ayları`}
      cells={long.map((m, i) => {
        const first = new Date(year, i, 1);
        return {
          key: String(i),
          label: fullscreen ? m : short[i],
          fullLabel: `${m} ${year}`,
          selected: isSameMonth(first, selected),
          current: isSameMonth(first, today),
          disabled: validRange ? !isWithin(first, startOfMonthOf(validRange[0]), validRange[1]) : false,
        };
      })}
      focusedIndex={view.getMonth()}
      onFocusIndex={(i) => onNavigate(addMonths(view, i - view.getMonth()))}
      onPage={(d) => onNavigate(addMonths(view, d * 12))}
      onSelect={(i) => onPick(new Date(year, i, 1))}
      cellRender={cellRender ? (i) => cellRender(new Date(year, i, 1), info(new Date(year, i, 1))) : undefined}
      skeleton={skeleton}
    />
  );
}
