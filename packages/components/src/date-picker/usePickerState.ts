"use client";

import { useState } from "react";
import { useControllableState } from "@mari-ui/core";
import { formatDate, parseDate, startOfDay } from "../lib/date";
import type { DatePickerProps, DatePickerRangeProps, DatePickerSingleProps, DateRangeValue } from "./types";
import { defaultFormat, isDayDisabled, mergeDateTime, orderRange } from "./utils";

type Slot = 0 | 1;
type Values = (Date | null)[];

const toValues = (v: Date | null | DateRangeValue | undefined, range: boolean): Values | undefined => {
  if (v === undefined) return undefined;
  if (range) return v ? [...(v as DateRangeValue)] : [null, null];
  return [v as Date | null];
};

/**
 * DatePicker durumu. `values` kesin değer (onChange'e giden); panel açıkken
 * düzenlemeler `draft`a yazılır ve ancak kesinleşince (gün seçimi, "Tamam",
 * Enter, alan dışına çıkış) `values` olur. Escape/dışarı tıklama taslağı atar.
 * Her yuvanın (aralıkta 2) kendi metni var — yazılan geçerli metin taslağa geçer.
 */
export function usePickerState(props: DatePickerProps) {
  const range = props.range === true;
  const mode = props.mode ?? "date";
  const picker = mode === "date" ? (props.picker ?? "date") : "date";
  const format = props.format ?? defaultFormat(mode, picker);
  const locale = props.locale;
  const fmt = (d: Date | null) => (d ? formatDate(d, format, locale) : "");

  const [values, setValuesState] = useControllableState<Values>({
    value: toValues(props.value, range),
    defaultValue: toValues(props.defaultValue, range) ?? (range ? [null, null] : [null]),
  });
  const [open, setOpenState] = useControllableState<boolean>({ value: props.open, defaultValue: false, onChange: props.onOpenChange });
  const [draft, setDraft] = useState<Values>(values);
  const [texts, setTexts] = useState<string[]>(() => values.map(fmt));
  const [slot, setSlot] = useState<Slot>(0);
  const [hover, setHover] = useState<Date | null>(null);

  // Değer dışarıdan değişince (kontrollü) metinler eşitlensin — panel kapalıyken.
  const valuesKey = values.map((v) => v?.getTime() ?? "").join("|");
  const [syncedKey, setSyncedKey] = useState(valuesKey);
  if (valuesKey !== syncedKey) {
    setSyncedKey(valuesKey);
    setTexts(values.map(fmt));
    if (!open) setDraft(values);
  }

  const isDisabled = (d: Date) => isDayDisabled(d, props.minDate, props.maxDate, props.disabledDate);

  const commit = (next: Values) => {
    const ordered = range ? orderRange(next[0] ?? null, next[1] ?? null) : next;
    setValuesState(ordered);
    setDraft(ordered);
    setTexts(ordered.map(fmt));
    if (range) (props as DatePickerRangeProps).onChange?.(ordered.every((v) => v === null) ? null : (ordered as DateRangeValue), [fmt(ordered[0]!), fmt(ordered[1]!)]);
    else (props as DatePickerSingleProps).onChange?.(ordered[0] ?? null, fmt(ordered[0] ?? null));
  };

  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (next) setDraft(values);
    else {
      setHover(null);
      setTexts(values.map(fmt));
    }
    setOpenState(next);
  };

  const close = () => setOpen(false);

  /** Taslağın bir yuvasını değiştirir; metin de taslağı gösterir. */
  const setDraftSlot = (s: Slot, d: Date | null, fromText = false) => {
    const next = [...draft];
    next[s] = d;
    setDraft(next);
    if (!fromText) setTexts((t) => t.map((x, i) => (i === s ? fmt(d) : x)));
    return next;
  };

  /** Aralıkta bir yuva tamamlanınca: başlangıçtan sonra bitişe geç; bitişte (ikisi doluysa) kesinleştir. */
  const advance = (next: Values) => {
    if (range && slot === 0) {
      setSlot(1);
      // Yeni başlangıç eski bitişten sonraysa bitiş yeniden seçilsin.
      if (next[1] && next[0] && next[0].getTime() > next[1].getTime()) {
        setDraft([next[0], null]);
        setTexts((t) => [t[0] ?? "", ""]);
      }
      return;
    }
    if (range && !next[0]) {
      setSlot(0);
      return;
    }
    commit(next);
    close();
  };

  /** Takvimden gün/ay/yıl seçimi. Gün modunda hemen ilerler; saatli modda "Tamam" bekler. */
  const pickDate = (d: Date) => {
    if (mode === "datetime") {
      const base = draft[slot] ?? startOfDay(new Date());
      setDraftSlot(slot, mergeDateTime(d, base));
      return;
    }
    advance(setDraftSlot(slot, d));
  };

  const pickTime = (t: Date) => {
    const base = draft[slot] ?? startOfDay(new Date());
    setDraftSlot(slot, mode === "time" ? mergeDateTime(startOfDay(new Date()), t) : mergeDateTime(base, t));
  };

  const confirm = () => advance(draft);

  const pickNow = () => {
    const now = mode === "date" ? startOfDay(new Date()) : new Date();
    advance(setDraftSlot(slot, now));
  };

  /** Yazılan metin: geçerliyse taslağa (takvim de oraya gider). */
  const typeText = (s: Slot, text: string) => {
    setTexts((t) => t.map((x, i) => (i === s ? text : x)));
    const parsed = text.trim() ? parseDate(text, format, draft[s] ?? startOfDay(new Date())) : null;
    if (parsed && !isDisabled(parsed)) setDraftSlot(s, parsed, true);
  };

  /** Enter ya da alan dışı: yazılan geçerliyse kesinleştir, boşsa temizle, geçersizse geri al. */
  const commitText = (s: Slot) => {
    const text = texts[s] ?? "";
    if (!text.trim()) {
      const next = [...values];
      next[s] = null;
      if (values[s] !== null) commit(next);
      return;
    }
    const parsed = parseDate(text, format, values[s] ?? startOfDay(new Date()));
    if (!parsed || isDisabled(parsed)) {
      setTexts(values.map(fmt));
      return;
    }
    const next = [...values];
    next[s] = parsed;
    if (fmt(parsed) !== fmt(values[s] ?? null)) commit(next);
    else setTexts(values.map(fmt));
  };

  return {
    range,
    mode,
    picker,
    format,
    open,
    setOpen,
    close,
    values,
    draft,
    texts,
    slot,
    setSlot,
    hover,
    setHover,
    isDisabled,
    commit,
    pickDate,
    pickTime,
    pickNow,
    confirm,
    typeText,
    commitText,
    clear: () => commit(range ? [null, null] : [null]),
  };
}

export type PickerState = ReturnType<typeof usePickerState>;
