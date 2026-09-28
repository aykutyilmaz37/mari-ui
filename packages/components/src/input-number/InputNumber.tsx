"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, FIELD_MOBILE_TEXT_CLASS, getShapeClasses, getVariantClasses } from "../input/utils";
import { skeletonBoxProps } from "../lib/skeleton";
import { sizeClass, touchTargetClass } from "../lib/sizeClasses";
import type { InputNumberProps } from "./types";
import { clamp, formatForEditing, formatNumber, isAllowedInput, parseNumber, roundTo, stepValue, type NumberFormatConfig } from "./utils";

export type { InputNumberProps };

const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 70;

/** Basılı tutunca adım tekrarlanır (400ms bekle, sonra 70ms'de bir). */
function useHoldRepeat(action: (direction: 1 | -1) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const actionRef = useRef(action);
  actionRef.current = action;
  const stop = () => clearTimeout(timer.current);
  useEffect(() => stop, []);
  const start = (direction: 1 | -1) => {
    stop();
    actionRef.current(direction);
    const repeat = () => {
      actionRef.current(direction);
      timer.current = setTimeout(repeat, HOLD_INTERVAL_MS);
    };
    timer.current = setTimeout(repeat, HOLD_DELAY_MS);
  };
  return { start, stop };
}

const textOf = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "");

interface StepperProps {
  onStart: (direction: 1 | -1) => void;
  onStop: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  incrementLabel: string;
  decrementLabel: string;
  size: NonNullable<InputNumberProps["size"]>;
}

/**
 * Fareyle: ant.design gibi sağda üst üste ▲/▼. Dokunmatikte (pointer-coarse)
 * yan yana −/+ — üst üste 16px'lik iki düğme parmakla vurulamaz; yatayda
 * her biri tam yükseklik + görünmez 44px hedef. Düğmeler Tab sırasında
 * değil (klavyede ↑/↓ zaten var, ant.design de böyle); `onPointerDown`
 * `preventDefault` ile odağı alandan almaz.
 */
function Stepper({ onStart, onStop, canIncrement, canDecrement, incrementLabel, decrementLabel, size }: StepperProps) {
  const button = (direction: 1 | -1, enabled: boolean, label: string, fine: React.ReactNode, coarse: React.ReactNode) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      disabled={!enabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (enabled) onStart(direction);
      }}
      onPointerUp={onStop}
      onPointerLeave={onStop}
      onPointerCancel={onStop}
      className={cn(
        "relative flex flex-1 cursor-pointer items-center justify-center text-mari-muted transition-colors hover:bg-mari-surface-alt hover:text-mari-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        "pointer-coarse:w-8 pointer-coarse:flex-none",
        touchTargetClass[size]
      )}
    >
      <span className="pointer-coarse:hidden">{fine}</span>
      <span className="hidden pointer-coarse:inline">{coarse}</span>
    </button>
  );
  return (
    // DOM sırası [azalt, artır]: masaüstünde col-reverse ile artır üstte, dokunmatikte satırda azalt solda.
    <div className="flex w-6 shrink-0 flex-col-reverse self-stretch overflow-hidden border-l border-mari-input [border-bottom-right-radius:inherit] [border-top-right-radius:inherit] pointer-coarse:w-auto pointer-coarse:flex-row [&>button+button]:border-b [&>button+button]:border-mari-input pointer-coarse:[&>button+button]:border-b-0 pointer-coarse:[&>button+button]:border-l">
      {button(-1, canDecrement, decrementLabel, <ChevronDownIcon size={12} aria-hidden />, <MinusIcon size={16} aria-hidden />)}
      {button(1, canIncrement, incrementLabel, <ChevronUpIcon size={12} aria-hidden />, <PlusIcon size={16} aria-hidden />)}
    </div>
  );
}

/**
 * Faz 16.1 — yapı ant.design InputNumber'dan; görünüm Input'la birebir.
 *
 * Metin alanı + `role="spinbutton"`: odak dışında biçimli ("1.234,56 ₺"),
 * odakta düzenlemeye uygun ("1234,56") gösterir. Türkçe ondalık virgül,
 * alışkanlıkla yazılan "12.5" de anlaşılır (bkz. `parseNumber`). Harf hiç
 * girmez. min/max yazarken engellenmez (kullanıcı "1" yazıp "15"e giderken
 * min=10 araya girmesin) — alandan çıkınca/Enter'da sınıra çekilir.
 *
 * Klavye: ↑/↓ adım (Shift ×10), PageUp/PageDown ×10, Home/End min/max, Enter
 * onaylar. `aria-valuenow/min/max` + `aria-valuetext` (önek/sonekle, ör. "1.234,50 ₺").
 */
export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value,
    defaultValue = null,
    onChange,
    min,
    max,
    step = 1,
    precision,
    grouping = true,
    locale = "tr-TR",
    prefix,
    suffix,
    controls = true,
    incrementLabel = "Artır",
    decrementLabel = "Azalt",
    placeholder,
    disabled = false,
    readOnly = false,
    size = "md",
    variant = "outline",
    shape = "default",
    color,
    id,
    name,
    required,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    onBlur,
    onFocus,
    onPressEnter,
    className,
    skeleton = false,
  },
  ref
) {
  const config: NumberFormatConfig = { locale, precision, grouping };
  const [current, setCurrent] = useControllableState<number | null>({ value, defaultValue });
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const innerRef = useRef<HTMLInputElement | null>(null);
  const interactive = !disabled && !readOnly;

  // En güncel değer — basılı tutarken adımlar render'lar arasında art arda gelebilir;
  // render kapanışındaki `current` eski kalır ve her adım aynı değerden hesaplanırdı.
  const latest = useRef(current);
  latest.current = current;

  const emit = (next: number | null) => {
    if (next === latest.current) return;
    latest.current = next;
    setCurrent(next);
    onChange?.(next);
  };

  /** Alandan çıkınca/Enter: metni sayıya çevir, yuvarla, sınıra çek; anlamsızsa son geçerli değere dön. */
  const normalize = (): number | null => {
    const parsed = parseNumber(text, locale);
    let next: number | null = current;
    if (parsed === null) next = null;
    else if (parsed !== undefined) next = clamp(roundTo(parsed, precision), min, max);
    emit(next);
    return next;
  };

  const applyStep = (direction: 1 | -1, multiplier = 1) => {
    if (!interactive) return;
    // Odaktaysa henüz onaylanmamış yazılan metin de hesaba katılır (yazıp ↑'a basınca oradan devam).
    const typed = focused ? parseNumber(text, locale) : undefined;
    const base = typed === undefined || typed === null ? latest.current : typed;
    const next = stepValue(base, direction, step * multiplier, min, max, precision);
    emit(next);
    if (focused) setText(formatForEditing(next, config));
  };
  const hold = useHoldRepeat((direction) => applyStep(direction));

  if (skeleton) {
    return <div {...skeletonBoxProps(cn("flex w-full items-center", sizeClass[size], getShapeClasses(shape, variant), className))} />;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const steps: Record<string, [1 | -1, number]> = { ArrowUp: [1, e.shiftKey ? 10 : 1], ArrowDown: [-1, e.shiftKey ? 10 : 1], PageUp: [1, 10], PageDown: [-1, 10] };
    const stepKey = steps[e.key];
    if (stepKey) {
      e.preventDefault();
      applyStep(...stepKey);
    } else if ((e.key === "Home" && min !== undefined) || (e.key === "End" && max !== undefined)) {
      e.preventDefault();
      if (!interactive) return;
      const edge = e.key === "Home" ? min! : max!;
      emit(edge);
      setText(formatForEditing(edge, config));
    } else if (e.key === "Enter") {
      setText(formatForEditing(normalize(), config));
      onPressEnter?.(e);
    }
  };

  const formatted = formatNumber(current, config);
  const valueText = formatted ? [textOf(prefix), formatted, textOf(suffix)].filter(Boolean).join(" ") : undefined;
  const canIncrement = interactive && (max === undefined || current === null || current < max);
  const canDecrement = interactive && (min === undefined || current === null || current > min);
  const adornment = "flex shrink-0 items-center text-mari-muted";

  return (
    // Kutunun boş alanına tıklamak alanı odaklar (Input'taki kısayol); klavye doğrudan alana gelir.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onMouseDown={(e) => {
        if (disabled || e.target === innerRef.current || (e.target as HTMLElement).closest("button")) return;
        e.preventDefault();
        innerRef.current?.focus();
      }}
      className={cn(
        "group relative flex w-full cursor-text items-center gap-2",
        sizeClass[size],
        getShapeClasses(shape, variant),
        controls && "py-0 pr-0",
        // Dokunmatikte −/+ yan yana 64px yer kaplar: dar bir genişlik (w-24) rakamlara yer bırakmıyordu.
        controls && "pointer-coarse:min-w-32",
        touchTargetClass[size],
        FIELD_BASE_CLASS,
        getVariantClasses(variant, color),
        disabled && FIELD_DISABLED_CLASS,
        className
      )}
    >
      {prefix && <span className={adornment}>{prefix}</span>}
      <input
        ref={(el) => {
          innerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        id={id}
        name={name}
        type="text"
        role="spinbutton"
        inputMode={precision === 0 && (min === undefined || min >= 0) ? "numeric" : "decimal"}
        autoComplete="off"
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={color === "error" || undefined}
        aria-valuenow={current ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        value={focused ? text : formatted}
        onFocus={(e) => {
          setFocused(true);
          setText(formatForEditing(current, config));
          onFocus?.(e);
        }}
        onBlur={(e) => {
          normalize();
          setFocused(false);
          onBlur?.(e);
        }}
        onChange={(e) => {
          const next = e.target.value;
          if (!isAllowedInput(next, locale)) return;
          setText(next);
          const parsed = parseNumber(next, locale);
          if (parsed !== undefined) emit(parsed);
        }}
        onKeyDown={handleKeyDown}
        className={cn("w-full min-w-0 flex-1 bg-transparent tabular-nums placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed", FIELD_MOBILE_TEXT_CLASS)}
      />
      {suffix && <span className={cn(adornment, controls && "pr-1")}>{suffix}</span>}
      {controls && (
        <Stepper
          onStart={hold.start}
          onStop={hold.stop}
          canIncrement={canIncrement}
          canDecrement={canDecrement}
          incrementLabel={incrementLabel}
          decrementLabel={decrementLabel}
          size={size}
        />
      )}
    </div>
  );
});
