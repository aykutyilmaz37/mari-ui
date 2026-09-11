"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";
import type { RateProps } from "./types";
import { handleClick, handleMouseEnter, handleMouseLeave } from "./utils";

export type { RateProps };

/**
 * Eskiden `types.ts` tamamen boştu (bkz. plan denetimi). `value`/
 * `defaultValue` artık `useControllableState` ile yönetiliyor — eskiden
 * `isControlled = value !== undefined` elle hesaplanıp `handleClick`'e
 * ayrıca geçiriliyordu.
 */
export function Rate({
  allowClear = true,
  allowHalf = false,
  autoFocus = false,
  character,
  className,
  count = 5,
  defaultValue = 0,
  disabled = false,
  value,
  onBlur,
  onChange,
  onFocus,
  onHoverChange,
  onKeyDown,
  characterSize = "1.5rem",
  color = "warning",
  characterColor,
  "aria-label": ariaLabel = "Puan",
}: RateProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const [displayValue, setDisplayValue] = useControllableState<number>({ value, defaultValue, onChange });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) rootRef.current?.focus();
  }, [autoFocus]);

  const colorClass = textClass[color];
  const step = allowHalf ? 0.5 : 1;

  /**
   * Eskiden kök `<div>` odaklanabilirdi (`tabIndex`) ama YALNIZCA fareyle
   * değiştirilebiliyordu — dahili hiçbir tuş işleyicisi yoktu, `onKeyDown`
   * salt tüketiciye ilettiği bir pass-through'du. Klavye kullanıcısı için
   * KULLANILAMAZ durumdaydı (AutoComplete'in Faz 13'te düzeltilen aynı
   * sınıf hatası). Ok Sağ/Yukarı artırır, Ok Sol/Aşağı azaltır, Home/End
   * uçlara atlar.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (disabled) return;
    if (!["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    // Fare daha önce üzerinde durup ayrılmadıysa `hoverValue` hâlâ set —
    // görsel önizleme `displayValue`nun önüne geçip klavyeyle yapılan
    // değişikliği MASKELİYORDU (aria-value* doğru ama yıldızlar eski
    // hover konumunda donuk kalıyordu). Klavyeyle her değişiklikte temizle.
    setHoverValue(undefined);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setDisplayValue(Math.min(count, Math.round((displayValue + step) * 2) / 2));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setDisplayValue(Math.max(0, Math.round((displayValue - step) * 2) / 2));
    } else if (e.key === "Home") {
      setDisplayValue(0);
    } else if (e.key === "End") {
      setDisplayValue(count);
    }
  };

  const stars = Array.from({ length: count }, (_, i) => {
    const currentValue = hoverValue ?? displayValue;
    const isFull = currentValue >= i + 1;
    const isHalf = !isFull && allowHalf && currentValue >= i + 0.5;

    const icon =
      typeof character === "function" ? character({}) : character ?? <Star fill="currentColor" stroke="currentColor" size={characterSize} />;

    let starOverlay: React.ReactNode = null;
    if (isFull) {
      starOverlay = (
        <span className={cn("absolute inset-0 w-full h-full pointer-events-none", colorClass)} style={{ color: characterColor }} aria-hidden>
          {icon}
        </span>
      );
    } else if (isHalf) {
      starOverlay = (
        <span
          className={cn("absolute inset-0 h-full w-1/2 overflow-hidden pointer-events-none", colorClass)}
          style={{ color: characterColor, left: 0 }}
          aria-hidden
        >
          {icon}
        </span>
      );
    }

    return (
      <span
        key={i}
        // Kök `<div>` artık tek bir ARIA "slider" olarak modelleniyor —
        // bu span'lar sadece fare/dokunma için görsel/tıklama hedefleri,
        // ekran okuyucudan gizli (değeri kök zaten `aria-valuetext` ile duyurur).
        aria-hidden="true"
        onClick={(e) => {
          if (!disabled) {
            // `onChange` burada BİLİNÇLİ OLARAK geçirilmiyor: `setDisplayValue`
            // (useControllableState'ten) zaten kendi `onChange`'ini tetikliyor —
            // ikisini birden geçirmek tüketicinin callback'ini ÇİFT çağırırdı.
            handleClick(e, i, { allowHalf, allowClear, displayValue, isControlled: false, setInternalValue: setDisplayValue });
          }
        }}
        onMouseEnter={(e) => !disabled && handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange)}
        onMouseMove={(e) => !disabled && handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange)}
        onMouseLeave={() => !disabled && handleMouseLeave(setHoverValue, onHoverChange)}
        className={cn(
          "relative inline-flex items-center justify-center select-none",
          !isFull && !isHalf && "text-mari-border",
          (isFull || isHalf) && colorClass,
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className
        )}
        style={{ fontSize: characterSize }}
      >
        <span className="absolute inset-0 w-full h-full text-mari-border pointer-events-none" aria-hidden>
          {icon}
        </span>
        {starOverlay}
        <span className="invisible" aria-hidden>
          {icon}
        </span>
      </span>
    );
  });

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        className
      )}
      tabIndex={disabled ? -1 : 0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={displayValue}
      aria-valuetext={`${displayValue} / ${count}`}
      aria-disabled={disabled || undefined}
    >
      {stars}
    </div>
  );
}
