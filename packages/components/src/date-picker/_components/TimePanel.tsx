"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@mari-ui/core";
import { columnValues, snap } from "../utils";

interface ColumnProps {
  label: string;
  values: number[];
  value: number;
  onChange: (v: number) => void;
  takeFocus?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Tek sütun (saat, dakika ya da saniye): APG listbox, seçim odağı izler
 * (↑/↓, Home/End, PageUp/Down 5'er). Seçili değer sütunun en üstüne kayar
 * (ant.design gibi).
 */
function Column({ label, values, value, onChange, takeFocus }: ColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const index = Math.max(0, values.indexOf(value));
  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[index] as HTMLElement | undefined;
    if (!list || !option) return;
    list.scrollTo?.({ top: option.offsetTop - list.offsetTop, behavior: "smooth" });
    if (navigating.current || takeFocus) option.focus({ preventScroll: true });
    navigating.current = false;
  }, [index, takeFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 };
    let next: number | null = null;
    if (e.key in map) next = Math.min(values.length - 1, Math.max(0, index + map[e.key]!));
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = values.length - 1;
    if (next === null) return;
    e.preventDefault();
    navigating.current = true;
    onChange(values[next]!);
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="relative h-56 w-14 pointer-coarse:w-16 snap-y overflow-y-auto overscroll-contain border-l border-mari-border py-1 first:border-l-0 [scrollbar-width:thin]"
    >
      {values.map((v, i) => (
        <div
          key={v}
          role="option"
          tabIndex={i === index ? 0 : -1}
          aria-selected={i === index}
          onKeyDown={onKeyDown}
          onClick={() => onChange(v)}
          className={cn(
            "mx-1 flex h-7 pointer-coarse:h-11 cursor-pointer snap-start items-center justify-center rounded-md text-sm tabular-nums outline-none",
            "focus-visible:outline-2 focus-visible:outline-mari-ring",
            i === index ? "bg-mari-primary-subtle font-medium text-mari-primary" : "hover:bg-mari-surface-alt"
          )}
        >
          {pad(v)}
        </div>
      ))}
      {/* Son değer de en üste kayabilsin. */}
      <div aria-hidden className="h-48 pointer-coarse:h-[19rem]" />
    </div>
  );
}

export interface TimePanelProps {
  value: Date;
  onChange: (date: Date) => void;
  seconds: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  takeFocus?: boolean;
}

/** Saat / dakika / (saniye) sütunları. Her sütun ayrı sekme durağı. */
export function TimePanel({ value, onChange, seconds, hourStep = 1, minuteStep = 1, secondStep = 1, takeFocus }: TimePanelProps) {
  const set = (h: number, m: number, s: number) => {
    const d = new Date(value);
    d.setHours(h, m, s, 0);
    onChange(d);
  };
  const h = snap(value.getHours(), hourStep);
  const m = snap(value.getMinutes(), minuteStep);
  const s = snap(value.getSeconds(), secondStep);
  return (
    <div className="flex" role="group" aria-label="Saat seçimi">
      <Column label="Saat" values={columnValues(23, hourStep)} value={h} onChange={(v) => set(v, m, s)} takeFocus={takeFocus} />
      <Column label="Dakika" values={columnValues(59, minuteStep)} value={m} onChange={(v) => set(h, v, s)} />
      {seconds && <Column label="Saniye" values={columnValues(59, secondStep)} value={s} onChange={(v) => set(h, m, v)} />}
    </div>
  );
}
