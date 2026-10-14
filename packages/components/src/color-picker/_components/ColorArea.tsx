"use client";

import type React from "react";
import { cn } from "@mari-ui/core";
import type { Hsba } from "../types";
import { areaKeyStep, colorInfo, hueColor, isLight } from "../utils";
import { usePointerDrag } from "./usePointerDrag";

interface ColorAreaProps {
  color: Hsba;
  disabled?: boolean;
  onChange: (s: number, b: number) => void;
  onChangeEnd: () => void;
}

/**
 * Doygunluk (yatay) × parlaklık (dikey) alanı. Zemin saf ton; üstüne beyazdan
 * saydama (soldan sağa) ve saydamdan siyaha (yukarıdan aşağı) iki katman.
 *
 * Erişilebilirlik: ARIA'da 2B kaydırıcı rolü yok — tek odaklanabilir bir
 * `slider` (değer = doygunluk), `aria-valuetext` iki ekseni birden söyler,
 * `aria-roledescription` yönü açıklar. ←/→ doygunluk, ↑/↓ parlaklık.
 */
export function ColorArea({ color, disabled, onChange, onChangeEnd }: Readonly<ColorAreaProps>) {
  const drag = usePointerDrag(({ x, y }) => onChange(Math.round(x * 100), Math.round((1 - y) * 100)), onChangeEnd);
  const s = Math.round(color.s);
  const b = Math.round(color.b);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = areaKeyStep(e.key, e.shiftKey, s, b);
    if (!next) return;
    e.preventDefault();
    onChange(next.s, next.b);
    onChangeEnd();
  };

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      data-autofocus
      aria-label="Doygunluk ve parlaklık"
      aria-roledescription="iki boyutlu kaydırıcı"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={s}
      aria-valuetext={`Doygunluk %${s}, parlaklık %${b}`}
      aria-disabled={disabled || undefined}
      onKeyDown={disabled ? undefined : onKeyDown}
      {...(disabled ? {} : drag)}
      className={cn(
        "relative h-36 w-full cursor-crosshair touch-none rounded-md outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-mari-ring focus-visible:ring-offset-2 focus-visible:ring-offset-mari-surface"
      )}
      style={{ backgroundColor: hueColor(color.h) }}
    >
      <div aria-hidden className="absolute inset-0 rounded-md bg-linear-to-r from-white to-transparent" />
      <div aria-hidden className="absolute inset-0 rounded-md bg-linear-to-b from-transparent to-black" />
      <span
        aria-hidden
        className={cn("pointer-events-none absolute size-3.5 -translate-1/2 rounded-full border-2 shadow-mari-sm", isLight({ ...color, a: 1 }) ? "border-mari-neutral-solid" : "border-white")}
        style={{ left: `${s}%`, top: `${100 - b}%`, backgroundColor: colorInfo({ ...color, a: 1 }).hex }}
      />
    </div>
  );
}
