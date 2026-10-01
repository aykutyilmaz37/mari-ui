"use client";

import type React from "react";
import { cn } from "@mari-ui/core";
import { sliderKeyStep } from "../utils";
import { CHECKER_CLASS } from "./Swatch";
import { usePointerDrag } from "./usePointerDrag";

/** Gökkuşağı (ton) şeridi: 0–360 arası saf tonlar. */
export const HUE_GRADIENT = "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueText: string;
  /** Şeridin CSS arka planı. */
  background: string;
  /** Saydamlık şeridi: arkada dama deseni. */
  checker?: boolean;
  /** Tutamacın iç rengi. */
  thumbColor: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  onChangeEnd: () => void;
}

/** Ton ve saydamlık için yatay kaydırıcı (`role="slider"`; ←/→ ↑/↓, Shift ile 10×, PageUp/Down, Home/End). */
export function ColorSlider({ label, value, min, max, step = 1, valueText, background, checker, thumbColor, disabled, onChange, onChangeEnd }: ColorSliderProps) {
  const drag = usePointerDrag(({ x }) => onChange(Math.round((min + x * (max - min)) / step) * step), onChangeEnd);
  const ratio = (value - min) / (max - min);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = sliderKeyStep(e.key, e.shiftKey, value, min, max, step);
    if (next === null) return;
    e.preventDefault();
    onChange(next);
    onChangeEnd();
  };

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      onKeyDown={disabled ? undefined : onKeyDown}
      {...(disabled ? {} : drag)}
      // Dikey dolgu: tutamaç şeritten büyük, tıklama alanı da onu kapsasın.
      className="group relative w-full cursor-pointer touch-none py-1 outline-none select-none"
    >
      <div aria-hidden className={cn("relative h-2 overflow-hidden rounded-full", checker && CHECKER_CLASS)}>
        <div className="absolute inset-0" style={{ background }} />
      </div>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 size-3.5 -translate-1/2 rounded-full border-2 border-white shadow-mari-sm ring-1 ring-mari-border",
          "group-focus-visible:ring-2 group-focus-visible:ring-mari-ring"
        )}
        // Tutamaç şeridin dışına taşmasın: merkezi yarıçap kadar içeriden başlar.
        style={{ left: `calc(0.4375rem + ${ratio} * (100% - 0.875rem))`, backgroundColor: thumbColor }}
      />
    </div>
  );
}
