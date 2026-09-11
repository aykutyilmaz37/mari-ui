"use client";

import React from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { Input } from "../input";
import { Tooltip } from "../tooltip";
import type { SliderProps, SliderValue } from "./types";
import { getSizeClasses, TRACK_HEIGHT, THUMB_SIZE } from "./utils";

export type { SliderProps };

/**
 * Eskiden `types.ts` tamamen boştu, `index.ts` da boştu — bu component
 * `@mari-ui/components/slider`den import EDİLEMİYORDU (bkz. plan denetimi).
 * Ayrıca `Tooltip`e `disabled={tooltipVisible}` geçiriliyordu: `tooltipVisible`
 * true iken tooltip'i GİZLEMEK gibi TERS bir mantıktı (isimle davranış
 * uyuşmuyordu). `tooltipVisible === false` olarak düzeltildi.
 *
 * Faz 13 (kullanıcı geri bildirimi): eskiden görünen track/thumb doğrudan
 * native `<input type="range">`ın kendisiydi — tarayıcının varsayılan
 * çizimiydi, `size` sadece kapsayıcının UZUNLUĞUNU değiştiriyordu, kalınlık/
 * thumb çapı her zaman aynı kalıyordu ("hepsi aynı boyutta" görünümü).
 * Artık track/thumb kendi çizdiğimiz (token renkli, `size`'a göre ölçeklenen)
 * `<div>`ler — native `<input>` GÖRÜNMEZ ama tam boyutlu ve en üstte kalıyor,
 * tüm klavye/fare/dokunma etkileşimini o karşılıyor (erişilebilirlik native
 * range'in kendisinden gelir, sadece görünümü özelleştirdik).
 */
export function Slider({
  value,
  defaultValue = 0,
  size = "md",
  min = 0,
  max = 100,
  vertical = false,
  disabled = false,
  tooltipVisible,
  tooltipAlwaysVisible,
  iconList = [],
  iconPosition = "bottom",
  showInput = false,
  onChange,
  "aria-label": ariaLabel,
}: SliderProps) {
  const [internalValue, setInternalValue] = useControllableState<SliderValue>({ value, defaultValue, onChange });
  // Not: `SliderValue` bir aralık (`[number, number]`) da kabul eder ama
  // gerçek render mantığı hep tekil bir sayı varsaymıştı (bkz. plan denetimi
  // — bu Faz 13'ün kapsamı dışında, önceden var olan bir eksiklik). Burada
  // aynı varsayımı koruyoruz.
  const numericValue = typeof internalValue === "number" ? internalValue : internalValue[0];
  const percent = ((numericValue - min) / (max - min)) * 100;

  const sizeClass = getSizeClasses(size, vertical);
  const trackHeight = TRACK_HEIGHT[size];
  const thumbSize = THUMB_SIZE[size];

  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative w-full", vertical && "transform -rotate-90", sizeClass)}>
        <Tooltip
          content={<div className={cn(vertical && "transform rotate-90")}>{numericValue}</div>}
          disabled={tooltipVisible === false}
          alwaysVisible={tooltipAlwaysVisible}
          placement={iconPosition === "top" ? "bottom" : "top"}
          color="neutral"
          className="absolute"
          style={{ left: `${percent}%` }}
          // `Tooltip` trigger'ı `inline-block` bir <span>'e sarar (içeriğe göre
          // BÜZÜLÜR) — track/thumb'ın `w-full`ü buna göre %0'a çözülüyordu
          // (eski native-range sürümünde de AYNI kök nedenden dolayı track hep
          // tarayıcının sabit varsayılan genişliğindeydi, `size` hiç etkilemiyordu).
          // `block w-full` ile trigger'ı kapsayıcının tam genişliğine geriyoruz.
          triggerClassName="block w-full"
          trigger={
            <div className={cn("relative flex items-center", disabled && "opacity-50")} style={{ height: thumbSize }}>
              {/* Görsel track — dolu (primary) + boş (nötr) kısım. Salt görsel, tıklama native input'a düşer. */}
              <div className="absolute w-full rounded-full bg-mari-border pointer-events-none" style={{ height: trackHeight }}>
                <div className="h-full rounded-full bg-mari-primary-solid" style={{ width: `${percent}%` }} />
              </div>
              {/* Native range — GÖRÜNMEZ ama tam boyutlu, tüm etkileşimi (klavye dahil) o taşır. */}
              <input
                type="range"
                className="peer absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                min={min}
                max={max}
                disabled={disabled}
                value={numericValue}
                onChange={(e) => setInternalValue(Number(e.target.value))}
                aria-label={ariaLabel}
              />
              {/* Görsel thumb — native input'un ÜSTÜNDE (DOM sırası sayesinde) ama
                  `pointer-events-none` olduğu için tıklamayı yine input alır. */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mari-primary-solid border-2 border-mari-surface shadow pointer-events-none transition-shadow",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-mari-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-mari-surface"
                )}
                style={{ left: `${percent}%`, width: thumbSize, height: thumbSize }}
              />
            </div>
          }
        />
        <div className="relative">
          {iconList.map((item, i) => {
            const itemPercent = ((item.value - min) / (max - min)) * 100;
            return (
              <div
                key={i}
                className={cn(
                  "absolute transform -translate-x-1/2",
                  iconPosition === "bottom" && "top-1",
                  iconPosition === "top" && "-top-6",
                  numericValue >= item.value ? "opacity-100 text-mari-primary" : "opacity-50 text-mari-muted"
                )}
                style={{ left: `${itemPercent}%` }}
              >
                {item.icon}
              </div>
            );
          })}
        </div>
      </div>
      {showInput && (
        // Not: `className`'e elle "border rounded p-1 text-sm" EKLEMİYORUZ —
        // Input zaten kendi `size`/`variant`'ından bunları üretiyor; üstüne
        // aynı özellikleri tekrar yazmak `cn`/twMerge sırasına göre boyut
        // ölçeğini SESSİZCE eziyordu (bkz. Faz 13 denetimi).
        <Input
          type="number"
          size="sm"
          className="w-14"
          value={String(numericValue)}
          disabled={disabled}
          min={min}
          max={max}
          aria-label={ariaLabel ? `${ariaLabel} (sayısal giriş)` : undefined}
          onChange={(e) => setInternalValue(Number(e.target.value))}
        />
      )}
    </div>
  );
}
