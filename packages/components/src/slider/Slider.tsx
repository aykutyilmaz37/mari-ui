"use client";

import React, { useRef, useState } from "react";
import { skeletonBoxProps } from "../lib/skeleton";
import { cn, useControllableState, type ColorRole, type Size } from "@mari-ui/core";
import { Input } from "../input";
import { bgSolidClass, textClass } from "../lib/colorClasses";
import type { SliderProps, SliderValue } from "./types";
import { getVerticalLength, nearestThumb, snap, THUMB_SIZE, toPercent, TRACK_HEIGHT, valueFromKey, valueFromPointer } from "./utils";

export type { SliderProps };

/**
 * Eski sürüm görünmez tek bir native `<input type="range">`ın üstüne çizilmiş
 * ray/tutamaçtan ibaretti:
 * - `SliderValue` `[number, number]` kabul ettiği halde ARALIK HİÇ
 *  ÇALIŞMIYORDU — sadece ilk değer çiziliyordu (koddaki eski not bunu
 *  itiraf ediyordu). Üst üste iki tam boyutlu görünmez input'ta tıklamayı
 *  yalnız üstteki alacağı için o mimaride düzgün eklenemezdi.
 * - `step` yoktu; dikey mod bütün bileşeni `-rotate-90` ile döndürüyordu.
 *
 * Artık tutamaçlar `role="slider"` (tam ARIA: valuenow/valuetext/min/max/
 * orientation), sürükleme Pointer Events + pointer capture ile, klavye
 * WAI-ARIA Slider desenine göre (oklar, PageUp/Down, Home/End). Aralıkta
 * tutamaçlar birbirini geçmez; raya basınca en yakın tutamaç gelir.
 */

// Tutamaç halkası rengi rol başına — Tailwind tarayıcısı için literal.
const thumbBorderClass: Record<ColorRole, string> = {
  primary: "border-mari-primary-solid",
  accent: "border-mari-accent-solid",
  success: "border-mari-success-solid",
  error: "border-mari-error-solid",
  warning: "border-mari-warning-solid",
  info: "border-mari-info-solid",
  neutral: "border-mari-neutral-solid",
};

function toArray(value: SliderValue): number[] {
  return typeof value === "number" ? [value] : [value[0], value[1]];
}

/** Ortalanmış işaret; uçtakiler içeri hizalı. */
function markAlign(v: number, min: number, max: number, vertical: boolean): string {
  if (vertical) {
    if (v <= min) return "translate-y-0";
    return v >= max ? "translate-y-full" : "translate-y-1/2";
  }
  if (v <= min) return "translate-x-0";
  return v >= max ? "-translate-x-full" : "-translate-x-1/2";
}

function formatText(format: SliderProps["formatValue"], value: number): string | undefined {
  if (!format) return undefined;
  const out = format(value);
  return typeof out === "string" || typeof out === "number" ? String(out) : undefined;
}

/** Bir tutamacın gidebileceği aralık — aralıkta diğer tutamacı geçemez. */
function thumbBounds(vals: number[], index: number, isRange: boolean, min: number, max: number): [number, number] {
  if (!isRange) return [min, max];
  return index === 0 ? [min, vals[1] ?? max] : [vals[0] ?? min, max];
}

/** Dokunmatikte ray alanı görünmez biçimde 44px'e genişler (tutamaç ve ray aynı kalır). */
const TRACK_TOUCH_TARGET_CLASS = {
  horizontal: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-2.5",
  vertical: "pointer-coarse:before:absolute pointer-coarse:before:inset-y-0 pointer-coarse:before:-inset-x-2.5",
} as const;

/** Dolu kısmın [başlangıç, bitiş] yüzdesi — tekte 0'dan tutamaca, aralıkta iki tutamaç arası. */
function fillRange(percents: number[], isRange: boolean): [number, number] {
  if (isRange) return [percents[0] ?? 0, percents[1] ?? 0];
  return [0, percents[0] ?? 0];
}

function resolveThumbLabels(thumbLabels: [string, string] | undefined, ariaLabel: string | undefined): [string, string] | undefined {
  if (thumbLabels) return thumbLabels;
  return ariaLabel ? [`${ariaLabel} en az`, `${ariaLabel} en çok`] : undefined;
}

/** Ray + tek tutamaç yer tutucusu — gerçek ray kutusuyla aynı kalınlıkta. */
function SliderSkeleton({ size, vertical, className }: Readonly<{ size: Size; vertical: boolean; className?: string }>) {
  const thumb = THUMB_SIZE[size];
  const cross = `max(${thumb}, 1.5rem)`;
  return (
    <div aria-hidden className={cn("relative flex items-center justify-center", vertical ? "" : "w-full", className)} style={vertical ? { width: cross, height: getVerticalLength(size) } : { height: cross }}>
      <span {...skeletonBoxProps(cn("rounded-full", vertical ? "h-full" : "w-full"))} style={vertical ? { width: TRACK_HEIGHT[size] } : { height: TRACK_HEIGHT[size] }} />
      <span {...skeletonBoxProps("absolute rounded-full")} style={{ width: thumb, height: thumb, ...(vertical ? { bottom: "40%" } : { left: "40%" }) }} />
    </div>
  );
}

function getBubbleClass(vertical: boolean, visible: boolean): string {
  return cn(
    "pointer-events-none absolute whitespace-nowrap rounded-md bg-mari-neutral-solid px-2 py-1 text-xs font-medium tabular-nums text-mari-neutral-solid-contrast shadow-mari-sm",
    "transition-opacity duration-150 motion-reduce:transition-none",
    vertical ? "left-full top-1/2 ml-3 -translate-y-1/2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
    visible ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100"
  );
}

export function Slider({
  value,
  defaultValue = 0,
  size = "md",
  min = 0,
  max = 100,
  step = 1,
  vertical = false,
  disabled = false,
  color = "primary",
  tooltipVisible,
  tooltipAlwaysVisible,
  formatValue,
  marks,
  iconList = [],
  iconPosition = "bottom",
  showInput = false,
  onChange,
  onChangeEnd,
  "aria-label": ariaLabel,
  thumbLabels,
  className,
  skeleton = false,
}: Readonly<SliderProps>) {
  const [current, setCurrent] = useControllableState<SliderValue>({ value, defaultValue, onChange });
  const values = toArray(current);
  const isRange = values.length === 2;

  const areaRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const latest = useRef(values);
  latest.current = values;
  const keyChanged = useRef(false);
  const [dragging, setDragging] = useState<number | null>(null);

  const emit = (vals: number[]): SliderValue => (isRange ? [vals[0] ?? min, vals[1] ?? max] : (vals[0] ?? min));

  const boundsOf = (vals: number[], index: number) => thumbBounds(vals, index, isRange, min, max);

  /** Tutamacı taşır; aralıkta diğer tutamacı geçemez. Değişmediyse onChange çağrılmaz. */
  const moveThumb = (index: number, raw: number) => {
    const vals = [...latest.current];
    const [lo, hi] = boundsOf(vals, index);
    const next = Math.min(hi, Math.max(lo, snap(raw, min, max, step)));
    if (next === vals[index]) return;
    vals[index] = next;
    latest.current = vals;
    setCurrent(emit(vals));
  };

  const readPointer = (event: React.PointerEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    return rect ? valueFromPointer(event.clientX, event.clientY, rect, min, max, vertical) : null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    const raw = readPointer(event);
    if (raw === null) return;
    const index = isRange ? nearestThumb(latest.current, raw) : 0;
    event.preventDefault(); // metin seçimini ve odağın raya kaçmasını engelle
    areaRef.current?.setPointerCapture?.(event.pointerId);
    setDragging(index);
    moveThumb(index, raw);
    thumbRefs.current[index]?.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const raw = readPointer(event);
    if (raw !== null) moveThumb(dragging, raw);
  };

  const endDrag = () => {
    if (dragging === null) return;
    setDragging(null);
    onChangeEnd?.(emit(latest.current));
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    const vals = latest.current;
    const [lo, hi] = boundsOf(vals, index);
    const next = valueFromKey(event.key, vals[index] ?? min, lo, hi, step, min, max);
    if (next === null) return;
    event.preventDefault();
    keyChanged.current = true;
    moveThumb(index, next);
  };

  const handleKeyUp = () => {
    if (!keyChanged.current) return;
    keyChanged.current = false;
    onChangeEnd?.(emit(latest.current));
  };

  if (skeleton) return <SliderSkeleton size={size} vertical={vertical} className={className} />;

  const percents = values.map((v) => toPercent(v, min, max));
  const [fillStart, fillEnd] = fillRange(percents, isRange);
  const thumbSize = THUMB_SIZE[size];
  const trackHeight = TRACK_HEIGHT[size];
  const length = getVerticalLength(size);
  const labels = resolveThumbLabels(thumbLabels, ariaLabel);
  const showBubble = tooltipVisible !== false;

  // Ray kutusu en az 24px kalın — küçük tutamaçta da dokunma hedefi yeterli olsun.
  const crossSize = `max(${thumbSize}, 1.5rem)`;

  const renderThumb = (v: number, index: number) => {
    const percent = percents[index] ?? 0;
    const label = isRange ? labels?.[index] : ariaLabel;
    const display = formatValue ? formatValue(v) : v;
    const isActive = dragging === index;
    return (
      <div
        key={index}
        ref={(el) => {
          thumbRefs.current[index] = el;
        }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={boundsOf(values, index)[0]}
        aria-valuemax={boundsOf(values, index)[1]}
        aria-valuenow={v}
        aria-valuetext={formatText(formatValue, v)}
        aria-orientation={vertical ? "vertical" : "horizontal"}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : handleKeyDown(index)}
        onKeyUp={handleKeyUp}
        className={cn(
          "group/thumb absolute rounded-full border-2 bg-mari-surface shadow-mari-sm outline-none",
          "transition-[scale,box-shadow] duration-150 motion-reduce:transition-none",
          "focus-visible:ring-2 focus-visible:ring-mari-ring focus-visible:ring-offset-2 focus-visible:ring-offset-mari-surface",
          thumbBorderClass[color],
          vertical ? "left-1/2 -translate-x-1/2 translate-y-1/2" : "top-1/2 -translate-x-1/2 -translate-y-1/2",
          !disabled && "cursor-grab hover:scale-110",
          isActive && "scale-110 cursor-grabbing",
          // Üst üste binen aralık tutamaçlarında sürüklenen üstte kalsın.
          isActive ? "z-20" : "z-10"
        )}
        style={{ width: thumbSize, height: thumbSize, ...(vertical ? { bottom: `${percent}%` } : { left: `${percent}%` }) }}
      >
        {showBubble && (
          <span
            aria-hidden
            className={getBubbleClass(vertical, Boolean(tooltipAlwaysVisible) || isActive)}
          >
            {display}
          </span>
        )}
      </div>
    );
  };

  const markEntries = marks ? Object.entries(marks).map(([k, node]) => [Number(k), node] as const) : [];
  const inRange = (v: number) => (isRange ? v >= (values[0] ?? min) && v <= (values[1] ?? max) : v <= (values[0] ?? min));

  const track = (
    <div
      ref={areaRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative touch-none select-none",
        TRACK_TOUCH_TARGET_CLASS[vertical ? "vertical" : "horizontal"],
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
      style={vertical ? { width: crossSize, height: length } : { width: "100%", height: crossSize }}
    >
      {/* Ray + dolu kısım — salt görsel. */}
      <div
        aria-hidden
        className={cn("absolute rounded-full bg-mari-border", vertical ? "inset-y-0 left-1/2 -translate-x-1/2" : "inset-x-0 top-1/2 -translate-y-1/2")}
        style={vertical ? { width: trackHeight } : { height: trackHeight }}
      >
        <div
          className={cn("absolute rounded-full", bgSolidClass[color], vertical ? "inset-x-0" : "inset-y-0")}
          style={vertical ? { bottom: `${fillStart}%`, height: `${fillEnd - fillStart}%` } : { left: `${fillStart}%`, width: `${fillEnd - fillStart}%` }}
        />
      </div>
      {values.map(renderThumb)}
    </div>
  );

  const markers = (markEntries.length > 0 || iconList.length > 0) && (
    <div aria-hidden className={cn("relative", vertical ? "ml-2 h-full w-12" : "h-6 w-full")}>
      {markEntries.map(([v, node]) => (
        <span
          key={`m-${v}`}
          className={cn(
            "absolute whitespace-nowrap text-xs",
            // Uçtaki etiketler ortalanırsa rayın dışına taşar (yanındaki
            // sayı girişine biner) — uçlarda içeri doğru hizala.
            vertical ? "left-0" : "top-1",
            markAlign(v, min, max, vertical),
            inRange(v) ? "text-mari-foreground" : "text-mari-muted"
          )}
          style={vertical ? { bottom: `${toPercent(v, min, max)}%` } : { left: `${toPercent(v, min, max)}%` }}
        >
          {node}
        </span>
      ))}
      {iconList.map((item, i) => (
        <span
          key={`i-${i}`}
          className={cn(
            "absolute transition-opacity",
            vertical ? "left-0 translate-y-1/2" : "top-1 -translate-x-1/2",
            inRange(item.value) ? cn("opacity-100", textClass[color]) : "text-mari-muted opacity-50"
          )}
          style={vertical ? { bottom: `${toPercent(item.value, min, max)}%` } : { left: `${toPercent(item.value, min, max)}%` }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );

  const inputWidth = `calc(${Math.max(String(min).length, String(max).length, String(step).length)}ch + 1.5rem)`;
  const inputs = showInput && (
    <div className="flex items-center gap-1.5">
      {values.map((v, i) => (
        <React.Fragment key={i}>
          {i === 1 && (
            <span aria-hidden className="text-mari-muted">
              –
            </span>
          )}
          <Input
            type="number"
            size="sm"
            // Genişlik en uzun değerin hane sayısından (eskiden sabit w-16 —
            // "10000" sığmıyordu). Tarayıcının sayı okları gizli: yer kaplıyor,
            // klavye Ok tuşları yine çalışır.
            style={{ width: inputWidth }}
            classNames={{ input: "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" }}
            value={String(v)}
            disabled={disabled}
            min={min}
            max={max}
            aria-label={`${(isRange ? labels?.[i] : ariaLabel) ?? "Değer"} (sayısal giriş)`}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) moveThumb(i, n);
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );

  const markersFirst = iconPosition === "top" && !vertical;

  return (
    // Yatayda yer yetmezse (mobil + showInput) sayı girişleri alt satıra iner —
    // ray en az 10rem kalır, işaret etiketleri üst üste binmez.
    <div className={cn("flex gap-x-3 gap-y-2", vertical ? "items-start" : "w-full flex-wrap items-center", className)}>
      {vertical ? (
        <div className="flex" style={{ height: length }}>
          {track}
          {markers}
        </div>
      ) : (
        // Yatay: kapsayıcının tam genişliği (ant.design gibi) — eskiden `size`
        // uzunluğu da sabitliyordu (16rem vb.), formda genişletmek için hile gerekiyordu.
        <div className="flex min-w-40 flex-1 flex-col">
          {markersFirst && markers}
          {track}
          {!markersFirst && markers}
        </div>
      )}
      {inputs}
    </div>
  );
}
