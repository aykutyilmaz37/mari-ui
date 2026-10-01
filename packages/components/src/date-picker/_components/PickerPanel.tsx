"use client";

import React, { forwardRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { CalendarPanel } from "../../calendar/_components/CalendarPanel";
import { addMonths, isSameDay, isSameMonth, isSameYear, startOfDay, startOfMonth } from "../../lib/date";
import { elevationClass } from "../../lib/elevationClass";
import type { FloatingCoords } from "../../lib/useFloatingPosition";
import type { DatePickerPreset, DatePickerProps } from "../types";
import type { PickerState } from "../usePickerState";
import { rangePosition } from "../utils";
import { TimePanel } from "./TimePanel";

interface PickerPanelProps {
  id: string;
  coords: FloatingCoords | null;
  state: PickerState;
  props: DatePickerProps;
  /** Klavyeyle (↓) açıldıysa odak panele. */
  takeFocus: boolean;
  onFocusOut: (e: React.FocusEvent) => void;
}

const panelLabel = (mode: string, range: boolean) => {
  if (mode === "time") return range ? "Saat aralığı seç" : "Saat seç";
  if (mode === "datetime") return range ? "Tarih ve saat aralığı seç" : "Tarih ve saat seç";
  return range ? "Tarih aralığı seç" : "Tarih seç";
};

function Presets({ presets, onPick }: { presets: DatePickerPreset<Date | [Date, Date]>[]; onPick: (v: Date | [Date, Date]) => void }) {
  return (
    <ul aria-label="Hazır seçimler" className="flex shrink-0 flex-row flex-wrap gap-1 border-b border-mari-border p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
      {presets.map((p, i) => (
        // Hazır seçimler sabit sırada.
        <li key={i}>
          <button
            type="button"
            onClick={() => onPick(typeof p.value === "function" ? p.value() : p.value)}
            className="w-full rounded-md px-2 py-1 pointer-coarse:py-2.5 text-left text-sm text-mari-foreground outline-none hover:bg-mari-surface-alt focus-visible:outline-2 focus-visible:outline-mari-ring"
          >
            {p.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function selectionChecker({ picker, draft, range }: PickerState) {
  return (d: Date) => {
    if (picker === "month") return draft.some((v) => isSameMonth(v, d));
    if (picker === "year") return draft.some((v) => isSameYear(v, d));
    return !range && isSameDay(draft[0], d);
  };
}

function rangeChecker({ range, picker, draft, slot, hover }: PickerState) {
  if (!range || picker !== "date") return undefined;
  return (d: Date) => rangePosition(d, draft[0] ?? null, draft[1] ?? null, slot === 1 && !draft[1] ? hover : null);
}

function Footer({ state, showNow, needsConfirm }: { state: PickerState; showNow: boolean; needsConfirm: boolean }) {
  if (!showNow && !needsConfirm) return null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-mari-border px-3 py-2">
      {showNow ? (
        <Button size="sm" variant="ghost" onClick={state.pickNow}>
          {state.mode === "date" ? "Bugün" : "Şimdi"}
        </Button>
      ) : (
        <span />
      )}
      {needsConfirm && (
        <Button size="sm" onClick={state.confirm} disabled={!state.draft[state.slot]}>
          {state.range && state.slot === 0 ? "Sonraki" : "Tamam"}
        </Button>
      )}
    </div>
  );
}

/**
 * DatePicker paneli: (hazır seçimler) + takvim(ler) + (saat sütunları) +
 * alt çubuk (Bugün/Şimdi, Tamam). Aralık gün modunda iki ay yan yana.
 * `role="dialog"` (modal değil); fareyle tıklama alanın odağını almaz.
 */
export const PickerPanel = forwardRef<HTMLDivElement, PickerPanelProps>(function PickerPanel({ id, coords, state, props, takeFocus, onFocusOut }, ref) {
  const { mode, picker, range, draft, slot } = state;
  const hasDate = mode !== "time";
  const hasTime = mode !== "date";
  const dual = range && mode === "date" && picker === "date";
  const current = draft[slot] ?? draft[slot === 0 ? 1 : 0] ?? startOfDay(new Date());
  const [view, setView] = useState(() => startOfMonth(current));
  const seconds = state.format.includes("ss");
  const showNow = props.showNow ?? !range;
  const needsConfirm = hasTime;
  // Panel konumu ölçülene kadar `invisible` — görünmez öğeye odak verilemez, ölçümü bekle.
  const focusNow = takeFocus && coords !== null;

  if (typeof document === "undefined") return null;

  const isSelected = selectionChecker(state);
  const rangeOf = rangeChecker(state);

  const calendarCommon = {
    picker,
    isSelected,
    rangeOf,
    isDisabled: state.isDisabled,
    onSelect: state.pickDate,
    onHover: range ? state.setHover : undefined,
    weekStart: props.weekStart,
    locale: props.locale,
    showWeek: props.showWeek,
  };

  const presets = props.presets as DatePickerPreset<Date | [Date, Date]>[] | undefined;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- yalnız alanın odağını korur / dışarı çıkışı izler
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={panelLabel(mode, range)}
      onMouseDown={(e) => e.preventDefault()}
      onBlur={onFocusOut}
      className={cn(
        "fixed z-mari-dropdown flex max-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-auto rounded-lg bg-mari-surface text-mari-foreground",
        elevationClass.md,
        !coords && "invisible"
      )}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0 }}
    >
      <div className="flex flex-col sm:flex-row">
        {presets && presets.length > 0 && (
          <Presets
            presets={presets}
            onPick={(v) => {
              state.commit(Array.isArray(v) ? [...v] : [v]);
              state.close();
            }}
          />
        )}
        {hasDate && (
          <div className="flex flex-col gap-4 p-3 sm:flex-row">
            {dual ? (
              <>
                {/* Dar ekranda tek ay (iki ay alt alta ekrana sığmıyor, alanın üstüne biniyordu); ikinci ay sm+. */}
                <CalendarPanel key="l" {...calendarCommon} initialDate={view} viewDate={view} onViewDateChange={setView} hideNext="sm" takeFocus={focusNow} />
                <div className="hidden sm:block">
                  <CalendarPanel key="r" {...calendarCommon} initialDate={addMonths(view, 1)} viewDate={addMonths(view, 1)} onViewDateChange={(d) => setView(addMonths(d, -1))} hidePrev />
                </div>
              </>
            ) : (
              <CalendarPanel key={`s${slot}`} {...calendarCommon} initialDate={current} takeFocus={focusNow} />
            )}
          </div>
        )}
        {hasTime && (
          <div className={cn("p-2", hasDate && "border-t border-mari-border sm:border-t-0 sm:border-l")}>
            <TimePanel
              value={current}
              onChange={state.pickTime}
              seconds={seconds}
              hourStep={props.hourStep}
              minuteStep={props.minuteStep}
              secondStep={props.secondStep}
              takeFocus={focusNow && !hasDate}
            />
          </div>
        )}
      </div>
      <Footer state={state} showNow={showNow} needsConfirm={needsConfirm} />
    </div>,
    document.body
  );
});
