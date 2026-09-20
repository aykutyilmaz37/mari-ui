"use client";

import React, { isValidElement, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { TooltipProps } from "./types";
import { getArrowClasses, getVariantClasses, toBaseDirection } from "./utils";

export type { TooltipProps };

/** Tetikleyiciyle balon arasındaki boşluk — eskiden `mt-2`/`mb-2`/`ml-2`/`mr-2` (0.5rem) idi, aynı değer artık JS'te. */
const GAP_PX = 8;

/**
 * Eskiden HER trigger `<Button>` içine sarılıyordu — bir ikon veya link'e
 * tooltip eklendiğinde iç içe buton render ediliyordu (bkz. plan Faz 3
 * denetimi, somut a11y/DOM bug'ı). Artık trigger düz bir `<span>` içinde;
 * kendi bir buton/link ise davranışı korunur.
 *
 * Faz 13.4: tooltip SADECE `onMouseEnter`/`onMouseLeave` ile açılıyordu —
 * klavye/odak kullanıcıları içeriği hiçbir zaman göremiyordu (AutoComplete/
 * Rate/Switch'te bulunanlarla aynı "fare olmadan kullanılamaz" sınıfı gerçek
 * bug). ant.design'ın gerçek Tooltip'i trigger'a her zaman (hover'dan önce
 * bile) `aria-describedby` bağlar (bkz. `getComputedStyle`/DOM incelemesi,
 * ant.design/components/tooltip) — aynı desen burada da uygulanıyor: sarmalayıcı
 * artık `onFocus`/`onBlur`'u da dinliyor (React'te bubble eder, trigger'ın
 * içindeki herhangi bir odaklanabilir eleman için de çalışır), balon
 * `role="tooltip"` + kararlı bir `id` alıyor, trigger tek bir React elementiyse
 * `aria-describedby` ona klonlanıyor, ve Escape tuşu görünürken kapatıyor.
 *
 * Kullanıcı bulgusu: balon eskiden tetikleyicinin `position: relative`
 * ebeveynine göre `absolute` konumlanıyordu — bu ebeveyn `overflow-x-auto`
 * olan bir tablo gibi bir kapsayıcının İÇİNDEYSE (örn. Table'ın son satırı),
 * balon o kapsayıcının `overflow`u tarafından KIRPILIYORDU; kullanıcı onu
 * görmek için container'ı kaydırmak zorunda kalıyordu. Artık balon
 * `document.body`'e portal ediliyor ve `position: fixed` + tetikleyicinin
 * `getBoundingClientRect()`'inden hesaplanan koordinatlarla konumlanıyor —
 * hiçbir atanın `overflow`u tarafından kırpılamaz.
 */
export function Tooltip({
  content,
  trigger,
  placement = "top",
  color = "neutral",
  variant = "solid",
  className,
  style,
  alwaysVisible,
  disabled = false,
  triggerClassName,
}: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(alwaysVisible ?? false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const direction = toBaseDirection(placement);
  const tooltipId = useId();
  const showTooltip = visible && !disabled;

  useEffect(() => {
    if (!showTooltip) return;

    const updatePosition = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      switch (direction) {
        case "top":
          setCoords({ top: rect.top - GAP_PX, left: rect.left + rect.width / 2 });
          break;
        case "bottom":
          setCoords({ top: rect.bottom + GAP_PX, left: rect.left + rect.width / 2 });
          break;
        case "left":
          setCoords({ top: rect.top + rect.height / 2, left: rect.left - GAP_PX });
          break;
        case "right":
          setCoords({ top: rect.top + rect.height / 2, left: rect.right + GAP_PX });
          break;
      }
    };

    updatePosition();
    // `capture: true` — iç içe kaydırılabilir bir kapsayıcının (örn. Table'ın
    // `overflow-x-auto`'su) scroll olayı normalde YUKARI BUBBLE ETMEZ; capture
    // fazında `window`'a eklenen dinleyici olayı AŞAĞI inerken yakalar, bu
    // yüzden iç kapsayıcı kaydırıldığında da balon tetikleyiciyi takip eder.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip, direction]);

  const decoratedTrigger =
    isValidElement<{ "aria-describedby"?: string }>(trigger) && showTooltip
      ? React.cloneElement(trigger, {
          "aria-describedby": [trigger.props["aria-describedby"], tooltipId].filter(Boolean).join(" "),
        })
      : trigger;

  const bubble =
    showTooltip && coords ? (
      <span
        role="tooltip"
        id={tooltipId}
        className={cn(
          // `w-max` KASITLI: sabit `left`/`top` + transform ile konumlanan bir
          // `fixed` elemanın shrink-to-fit genişlik hesabı normal şartlarda
          // viewport'a göre yapılır (bu yüzden eski `absolute` sürümündeki
          // "yarım genişlik" bug'ı burada oluşmaz), ama `w-max` yine de
          // genişliği doğrudan içeriğin gerçek boyutuna sabitleyip garantiye
          // alır. Boyutlar ant.design'ın gerçek Tooltip'inden
          // (`getComputedStyle`): `padding: 6px 8px`, `border-radius: 6px`,
          // `line-height: 22px`.
          "fixed text-wrap z-mari-tooltip w-max px-2 py-1.5 max-w-2xl rounded-md text-sm leading-[1.375rem] transition-opacity duration-200",
          direction === "top" && "-translate-x-1/2 -translate-y-full",
          direction === "bottom" && "-translate-x-1/2",
          direction === "left" && "-translate-x-full -translate-y-1/2",
          direction === "right" && "-translate-y-1/2",
          getVariantClasses(color, variant),
          className
        )}
        style={{ top: coords.top, left: coords.left, ...style }}
      >
        {content}
        <Play
          size={10}
          className={cn(
            "absolute",
            direction === "bottom" && "top-[2.5px] left-1/2 -translate-x-1/2 -translate-y-full -rotate-90",
            direction === "top" && "bottom-[2.5px] left-1/2 -translate-x-1/2 translate-y-full rotate-90",
            direction === "right" && "left-[2.5px] top-1/2 -translate-y-1/2 -translate-x-full rotate-180",
            direction === "left" && "right-[2.5px] top-1/2 -translate-y-1/2 translate-x-full",
            getArrowClasses(color, variant)
          )}
        />
      </span>
    ) : null;

  return (
    <>
      {/* Bu `<span>` KENDİSİ interaktif değil — sadece hover/focus bölgesi
          sınırlayan pasif bir sarmalayıcı. Gerçek interaktiflik `trigger`ın
          kendisinde (bir buton/link vb. olabilir) yaşıyor; `onKeyDown` burada
          sadece görünürken Escape'i yakalamak için (focus zaten trigger'da,
          olay buraya bubble ediyor) — span'a odaklanılabilirlik EKLEMİYOR. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <span
        ref={wrapperRef}
        // `self-start` KASITLI: bu sarmalayıcı bir `flex` konteynerin (örn.
        // `flex flex-col`) DOĞRUDAN çocuğu olduğunda, flex'in varsayılan
        // `align-items: stretch`i `inline-block`u blockify edip konteynerin
        // TAM GENİŞLİĞİNE geriyordu. `self-start` bu geriyi flex/grid
        // bağlamlarında engeller; flex/grid OLMAYAN normal akışta hiçbir
        // etkisi yok (yok sayılır).
        className={cn("inline-block self-start", triggerClassName)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => !alwaysVisible && setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => !alwaysVisible && setVisible(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !alwaysVisible) setVisible(false);
        }}
      >
        {decoratedTrigger}
      </span>
      {bubble && typeof document !== "undefined" && createPortal(bubble, document.body)}
    </>
  );
}
