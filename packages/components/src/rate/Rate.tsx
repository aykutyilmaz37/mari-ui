"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import type { RateProps } from "./types";
import { handleClick, handleMouseEnter, handleMouseLeave } from "./utils";

export type { RateProps };

/*
 * Eskiden `types.ts` tamamen boştu. `value`/
 * `defaultValue` artık `useControllableState` ile yönetiliyor — eskiden
 * `isControlled = value !== undefined` elle hesaplanıp `handleClick`'e
 * ayrıca geçiriliyordu.
 */
/*
 * Yıldız ikonları. Varsayılan palet (renk verilmedi): dolu = puan sarısı,
 * boş = dolgusuz sarı kontur. Rol/ham renk: dolu = o renk, boş = dolgusuz o
 * renkte kontur (`currentColor`, `tintEmpty` ile boyanır). Özel `character`
 * olduğu gibi kullanılır. Kullanıcı kararı: kontur her zaman dolgunun rengi.
 */
function resolveStarIcons(
  character: RateProps["character"],
  color: RateProps["color"],
  characterColor: string | undefined,
  size: number | string
): { filledIcon: React.ReactNode; emptyIcon: React.ReactNode; tintEmpty: boolean } {
  if (character !== undefined) {
    const icon = typeof character === "function" ? character({}) : character;
    return { filledIcon: icon, emptyIcon: icon, tintEmpty: false };
  }
  if (!color && !characterColor) {
    return {
      filledIcon: <Star size={size} fill="var(--mari-color-rating)" stroke="var(--mari-color-rating-stroke)" strokeWidth={1.5} />,
      emptyIcon: <Star size={size} fill="none" stroke="var(--mari-color-rating-stroke)" strokeWidth={1.5} />,
      tintEmpty: false,
    };
  }
  return {
    filledIcon: <Star size={size} fill="currentColor" stroke="currentColor" />,
    emptyIcon: <Star size={size} fill="none" stroke="currentColor" strokeWidth={1.5} />,
    tintEmpty: true,
  };
}

/** Bir yıldızın dolu oranı (0–1). */
function starFraction(value: number, index: number, allowHalf: boolean, exact: boolean): number {
  const raw = Math.min(1, Math.max(0, value - index));
  if (exact) return raw;
  if (raw >= 1) return 1;
  return allowHalf && raw >= 0.5 ? 0.5 : 0;
}

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
  color,
  characterColor,
  "aria-label": ariaLabel = "Puan",
  readOnly = false,
  skeleton = false,
}: Readonly<RateProps>) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const [displayValue, setDisplayValue] = useControllableState<number>({ value, defaultValue, onChange });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) rootRef.current?.focus();
  }, [autoFocus]);

  const colorClass = color ? textClass[color] : "text-mari-rating";
  const interactive = !disabled && !readOnly;

  if (skeleton) {
    return (
      <div aria-hidden className={cn("flex gap-1", className)}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} {...skeletonBoxProps("rounded-sm")} style={{ width: characterSize, height: characterSize }} />
        ))}
      </div>
    );
  }
  const step = allowHalf ? 0.5 : 1;

  /*
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

  const currentValue = hoverValue ?? displayValue;
  const { filledIcon, emptyIcon, tintEmpty } = resolveStarIcons(character, color, characterColor, characterSize);

  // Etkileşimsizken (disabled/readOnly) yıldızlar hiçbir olay dinlemez.
  const starHandlers = (i: number): React.HTMLAttributes<HTMLSpanElement> =>
    interactive
      ? {
          // `onChange` BİLİNÇLİ OLARAK geçirilmiyor: `setDisplayValue` zaten
          // kendi `onChange`'ini tetikliyor — ikisi birden ÇİFT çağırırdı.
          onClick: (e) => handleClick(e, i, { allowHalf, allowClear, displayValue, isControlled: false, setInternalValue: setDisplayValue }),
          onMouseEnter: (e) => handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange),
          onMouseMove: (e) => handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange),
          onMouseLeave: () => handleMouseLeave(setHoverValue, onHoverChange),
        }
      : {};

  const stars = Array.from({ length: count }, (_, i) => {
    // Yıldızın dolu oranı (0–1). Etkileşimli modda tam/yarım; salt gösterimde
    // gerçek ondalık oran (4,3 → 5. yıldızın %30'u).
    const fraction = starFraction(currentValue, i, allowHalf, readOnly);

    return (
      <span
        key={i}
        // Kök tek bir ARIA "slider" (ya da salt gösterimde "img"); bu span'lar
        // yalnızca görsel/tıklama hedefi, ekran okuyucudan gizli.
        aria-hidden="true"
        {...starHandlers(i)}
        className={cn(
          "relative inline-flex select-none items-center justify-center text-mari-input",
          // Dokunmatikte her yıldız 44px yüksek, komşusuyla boşluksuz bir hedef.
          interactive && "cursor-pointer pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1 pointer-coarse:before:-inset-y-2.5",
          disabled && "cursor-not-allowed"
        )}
        style={{ fontSize: characterSize }}
      >
        {/* Boş yıldız yer tutar; dolu yıldız üstte, orana göre KIRPILIR. */}
        <span className={cn("inline-flex", tintEmpty && colorClass)} style={tintEmpty ? { color: characterColor } : undefined} aria-hidden>
          {emptyIcon}
        </span>
        {fraction > 0 && (
          <span
            // Kırpma kutusu `block` + içerik SABİT genişlikte: eskiden kutu
            // `inline-flex` idi, içindeki yıldız %50'lik kutuya sığmak için
            // KÜÇÜLÜYORDU (yarım yıldız yerine minik tam yıldız görünüyordu).
            className={cn("pointer-events-none absolute inset-y-0 left-0 block overflow-hidden", colorClass)}
            style={{ width: `${Math.round(fraction * 1000) / 10}%`, color: characterColor }}
            aria-hidden
          >
            <span className="flex h-full shrink-0 items-center" style={{ width: characterSize }}>
              {filledIcon}
            </span>
          </span>
        )}
      </span>
    );
  });

  const valueText = `${displayValue.toLocaleString("tr-TR")} / ${count}`;

  if (readOnly) {
    return (
      <div role="img" aria-label={`${ariaLabel}: ${valueText}`} className={cn("flex gap-1", className)}>
        {stars}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring pointer-coarse:gap-2",
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
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
    >
      {stars}
    </div>
  );
}
