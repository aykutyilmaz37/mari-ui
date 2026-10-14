"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { addMonths, addYears, isSameMonth, isSameYear, monthNames, startOfMonth, type WeekStart } from "../../lib/date";
import { CellGrid, type GridCell } from "./CellGrid";
import { DayGrid, type RangePosition } from "./DayGrid";

export type PanelPicker = "date" | "month" | "year";

export interface CalendarPanelProps {
  /** Hangi düzeyde seçim yapılır. Varsayılan: `date`. */
  picker?: PanelPicker;
  /** Panelin açıldığı gün (seçili değer ya da bugün). */
  initialDate: Date;
  isSelected: (date: Date) => boolean;
  rangeOf?: (date: Date) => RangePosition | null;
  isDisabled: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onHover?: (date: Date | null) => void;
  weekStart?: WeekStart;
  locale?: string;
  showWeek?: boolean;
  takeFocus?: boolean;
  /** Görünen ay dışarıdan (aralıkta iki panel birlikte kayar). */
  viewDate?: Date;
  onViewDateChange?: (date: Date) => void;
  /**
   * Aralıkta: sol panel yalnız geri, sağ panel yalnız ileri oklarını gösterir.
   * `"sm"`: yalnız `sm` ve üstünde gizli (dar ekranda tek panel kalır, oklar gerekir).
   */
  hidePrev?: boolean;
  hideNext?: boolean | "sm";
  className?: string;
}

const NAV_BUTTON = "grid size-7 pointer-coarse:size-10 place-items-center rounded-md text-mari-muted outline-none hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-mari-ring";
const TITLE_BUTTON = "rounded-md px-1.5 py-0.5 pointer-coarse:py-2.5 font-medium outline-none hover:bg-mari-surface-alt hover:text-mari-primary focus-visible:outline-2 focus-visible:outline-mari-ring";

const decadeStart = (year: number) => year - (year % 10);

function monthCells(year: number, picker: PanelPicker, selected: (d: Date) => boolean, disabled: (d: Date) => boolean, locale?: string): GridCell[] {
  const short = monthNames(locale, "short");
  const long = monthNames(locale, "long");
  const now = new Date();
  return short.map((name, m) => {
    const first = new Date(year, m, 1);
    const days = new Date(year, m + 1, 0).getDate();
    // Ay seçiminde: ayın tüm günleri devre dışıysa ay da devre dışı.
    const allDisabled = picker === "month" && Array.from({ length: days }, (_, i) => new Date(year, m, i + 1)).every(disabled);
    return {
      key: String(m),
      label: name,
      fullLabel: `${long[m]} ${year}`,
      selected: picker === "month" ? selected(first) : false,
      current: isSameMonth(first, now),
      disabled: allDisabled,
    };
  });
}

function yearCells(year: number, picker: PanelPicker, selected: (d: Date) => boolean, disabled: (d: Date) => boolean): GridCell[] {
  const start = decadeStart(year) - 1;
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const y = start + i;
    const first = new Date(y, 0, 1);
    return {
      key: String(y),
      label: String(y),
      fullLabel: String(y),
      selected: picker === "year" ? selected(first) : false,
      current: isSameYear(first, now),
      disabled: picker === "year" && disabled(first) && disabled(new Date(y, 11, 31)),
      outside: i === 0 || i === 11,
    };
  });
}

/**
 * Kompakt takvim paneli: «/‹ başlık ›/» gezinmesi; başlıktaki ay/yıl düğmeleri
 * ay ve yıl görünümüne geçer. Görünen dönem `aria-live` ile duyurulur.
 */
export function CalendarPanel(props: Readonly<CalendarPanelProps>) {
  const { picker = "date", initialDate, isSelected, rangeOf, isDisabled, onSelect, onHover, weekStart = 1, locale, showWeek, takeFocus, hidePrev, hideNext, className } = props;
  const [mode, setMode] = useState<PanelPicker>(picker);
  const [innerView, setInnerView] = useState(() => startOfMonth(initialDate));
  const [focused, setFocused] = useState(initialDate);
  const view = props.viewDate ?? innerView;
  const setView = (d: Date) => {
    const next = startOfMonth(d);
    setInnerView(next);
    props.onViewDateChange?.(next);
  };
  const [focusGrid, setFocusGrid] = useState(!!takeFocus);
  useEffect(() => setMode(picker), [picker]);

  const moveFocus = (d: Date) => {
    setFocused(d);
    if (!isSameMonth(d, view)) setView(d);
  };

  const long = monthNames(locale, "long");
  const year = view.getFullYear();

  let title: React.ReactNode;
  let grid: React.ReactNode;
  if (mode === "date") {
    title = (
      <>
        <button type="button" className={TITLE_BUTTON} aria-label={`Ay seç, ${long[view.getMonth()]}`} onClick={() => setMode("month")}>
          {long[view.getMonth()]}
        </button>
        <button type="button" className={TITLE_BUTTON} aria-label={`Yıl seç, ${year}`} onClick={() => setMode("year")}>
          {year}
        </button>
      </>
    );
    grid = (
      <DayGrid
        view={view}
        focused={isSameMonth(focused, view) ? focused : view}
        onFocusChange={(d) => {
          setFocusGrid(true);
          moveFocus(d);
        }}
        isSelected={isSelected}
        rangeOf={rangeOf}
        isDisabled={isDisabled}
        onSelect={onSelect}
        onHover={onHover}
        weekStart={weekStart}
        locale={locale}
        showWeek={showWeek}
        label={`${long[view.getMonth()]} ${year}`}
        takeFocus={focusGrid || !!takeFocus}
      />
    );
  } else if (mode === "month") {
    const cells = monthCells(year, picker, isSelected, isDisabled, locale);
    title = (
      <button type="button" className={TITLE_BUTTON} aria-label={`Yıl seç, ${year}`} onClick={() => setMode("year")}>
        {year}
      </button>
    );
    grid = (
      <CellGrid
        cells={cells}
        focusedIndex={view.getMonth()}
        label={`${year} ayları`}
        takeFocus
        onFocusIndex={(i) => setView(new Date(year, i, 1))}
        onPage={(d) => setView(addYears(view, d))}
        onSelect={(i) => {
          const d = new Date(year, i, 1);
          if (picker === "month") onSelect(d);
          else {
            setView(d);
            setFocused(d);
            setMode("date");
          }
        }}
      />
    );
  } else {
    const cells = yearCells(year, picker, isSelected, isDisabled);
    const start = decadeStart(year);
    title = <span className="px-1.5 font-medium">{`${start}–${start + 9}`}</span>;
    grid = (
      <CellGrid
        cells={cells}
        focusedIndex={year - (start - 1)}
        label={`${start}–${start + 9} yılları`}
        takeFocus
        onFocusIndex={(i) => setView(new Date(start - 1 + i, view.getMonth(), 1))}
        onPage={(d) => setView(addYears(view, d * 10))}
        onSelect={(i) => {
          const d = new Date(start - 1 + i, view.getMonth(), 1);
          if (picker === "year") onSelect(d);
          else {
            setView(d);
            setMode("month");
          }
        }}
      />
    );
  }

  const shift = (months: number) => {
    const next = mode === "year" ? addYears(view, Math.sign(months) * 10) : addMonths(view, months);
    setView(next);
    setFocused(addMonths(focused, next.getFullYear() * 12 + next.getMonth() - (view.getFullYear() * 12 + view.getMonth())));
  };

  return (
    <div className={cn("w-[17.5rem] max-w-full pointer-coarse:w-[19.25rem]", className)}>
      <div className="mb-2 flex items-center gap-0.5">
        {!hidePrev && (
          <>
            <button type="button" className={NAV_BUTTON} aria-label={mode === "year" ? "Önceki on yıl" : "Önceki yıl"} onClick={() => shift(-12)}>
              <ChevronsLeftIcon aria-hidden size={16} />
            </button>
            {mode === "date" && (
              <button type="button" className={NAV_BUTTON} aria-label="Önceki ay" onClick={() => shift(-1)}>
                <ChevronLeftIcon aria-hidden size={16} />
              </button>
            )}
          </>
        )}
        <div aria-live="polite" className="flex flex-1 items-center justify-center gap-0.5 text-sm">
          {title}
        </div>
        {hideNext !== true && (
          <span className={cn("contents", hideNext === "sm" && "sm:hidden")}>
            {mode === "date" && (
              <button type="button" className={NAV_BUTTON} aria-label="Sonraki ay" onClick={() => shift(1)}>
                <ChevronRightIcon aria-hidden size={16} />
              </button>
            )}
            <button type="button" className={NAV_BUTTON} aria-label={mode === "year" ? "Sonraki on yıl" : "Sonraki yıl"} onClick={() => shift(12)}>
              <ChevronsRightIcon aria-hidden size={16} />
            </button>
          </span>
        )}
      </div>
      {grid}
    </div>
  );
}
