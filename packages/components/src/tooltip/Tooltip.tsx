"use client";

import React, { isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import { computePanelPosition, type Side } from "../lib/floating";
import { skeletonFill } from "../lib/skeleton";
import type { TooltipProps } from "./types";
import { getArrowClasses, getVariantClasses } from "./utils";

export type { TooltipProps };

/** Tetikleyiciyle balon arası (px) ve balonun ekran kenarından en az uzaklığı. */
const GAP_PX = 8;
const EDGE_PX = 8;
/** Balondan/tetikleyiciden çıkınca kapanma gecikmesi — fare aradaki boşluğu geçebilsin. */
const CLOSE_DELAY_MS = 120;
/** Ok, balonun hizalandığı kenardan bu kadar içeride durur (radius'a binmesin). */
const ARROW_INSET_PX = 12;

const ARROW_SIDE_CLASS: Record<Side, string> = {
  top: "top-full -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-full -translate-x-1/2 translate-y-1/2",
  left: "left-full -translate-x-1/2 -translate-y-1/2",
  right: "right-full translate-x-1/2 -translate-y-1/2",
};

interface Position {
  top: number;
  left: number;
  side: Side;
  arrowOffset: number;
}

/**
 * Faz 15 (yeniden yazım):
 * - Konum `lib/floating`'deki `computePanelPosition` ile (Dropdown'la ORTAK):
 *   12 yerleşim, yer yoksa karşı yöne döner, ekran içinde kıstırılır. Eskiden
 *   4 sabit yön + kıstırma yoktu: mobilde 672px'e kadar genişleyen balon
 *   ekrandan taşıyor, üstteki bir tetikleyicide ekranın dışına çıkıyordu.
 * - Balonun ÜZERİNE gelinebilir (WCAG 1.4.13): fare tetikleyiciden balona
 *   geçerken kapanmaz; kısa bir kapanma gecikmesi aradaki boşluğu köprüler.
 * - Fareyle açılış `openDelay` kadar gecikir (üzerinden geçerken titremesin);
 *   odakla açılış anlık.
 *
 * Önceki kararlar korunur: `document.body`'e portal + `fixed` (kaydırılabilir
 * kapsayıcıda kırpılmaz), `role="tooltip"` + tetikleyiciye `aria-describedby`,
 * Escape kapatır, sarmalayıcı `self-start` (flex'te gerilmesin).
 */
type ElRef = React.RefObject<HTMLSpanElement | null>;

/** Açık/kapalı durumu: fare gecikmeleri (hover) ya da dışarı tıklama (click). */
function useVisibility(alwaysVisible: boolean | undefined, openOn: "hover" | "click", wrapperRef: ElRef, bubbleRef: ElRef) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [visible, setVisible] = useState(alwaysVisible ?? false);

  const clearTimer = () => clearTimeout(timerRef.current);
  const open = useCallback((delay: number) => {
    clearTimeout(timerRef.current);
    if (delay <= 0) setVisible(true);
    else timerRef.current = setTimeout(() => setVisible(true), delay);
  }, []);
  const close = useCallback(() => {
    clearTimeout(timerRef.current);
    if (!alwaysVisible) timerRef.current = setTimeout(() => setVisible(false), CLOSE_DELAY_MS);
  }, [alwaysVisible]);
  const closeNow = () => {
    clearTimer();
    if (!alwaysVisible) setVisible(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // `openOn="click"`: dışarı tıklamak kapatır (tetikleyici ve balon hariç).
  useEffect(() => {
    if (openOn !== "click" || !visible) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || bubbleRef.current?.contains(target)) return;
      setVisible(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openOn, visible, wrapperRef, bubbleRef]);

  return { visible, setVisible, open, close, closeNow, clearTimer };
}

/** Görünürken balonun sayfa konumunu her karede takip eder. */
function useTrackedPosition(showTooltip: boolean, wrapperRef: ElRef, bubbleRef: ElRef, placement: TooltipProps["placement"] & string) {
  const [position, setPosition] = useState<Position | null>(null);
  // Konum: balon önce görünmez çizilir, boyutu ölçülür, sonra yerleştirilir.
  const updatePosition = useCallback(() => {
    const anchor = wrapperRef.current?.getBoundingClientRect();
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;
    // Tetikleyici görünür alanın DIŞINDAYSA balon gizlenir. Aksi halde kıstırma
    // onu ekran kenarına yapıştırıyor, tetikleyiciden kopuk havada asılı
    // kalıyordu (Storybook docs'ta aşağıdaki `alwaysVisible` story'ler).
    const offscreen = anchor.bottom < 0 || anchor.top > window.innerHeight || anchor.right < 0 || anchor.left > window.innerWidth;
    if (offscreen) {
      setPosition(null);
      return;
    }
    const next = computePanelPosition(
      { top: anchor.top, left: anchor.left, width: anchor.width, height: anchor.height },
      { width: bubble.offsetWidth, height: bubble.offsetHeight },
      placement,
      { width: window.innerWidth, height: window.innerHeight },
      GAP_PX,
      EDGE_PX,
      { inset: ARROW_INSET_PX, pointAtCenter: true }
    );
    // SAYFA koordinatı (`absolute`): pencere kaydırılınca balonu tarayıcı
    // kendisi taşır. Eskiden `fixed` + her karede JS ile yeniden konum vardı —
    // bir kare geriden geldiği için kaydırırken balonlar titriyor, komşu
    // satırlara biniyordu (kullanıcı bulgusu, docs sayfası).
    const pageTop = next.top + window.scrollY;
    const pageLeft = next.left + window.scrollX;
    setPosition((prev) =>
      prev && prev.top === pageTop && prev.left === pageLeft && prev.side === next.side && prev.arrowOffset === next.arrowOffset
        ? prev
        : { ...next, top: pageTop, left: pageLeft }
    );
  }, [placement, wrapperRef, bubbleRef]);

  useLayoutEffect(() => {
    if (!showTooltip) {
      setPosition(null);
      return;
    }
    // Görünür olduğu sürece HER KAREDE takip: yalnızca scroll/resize dinlemek
    // yetmiyordu — sayfa düzeni sonradan değişince (ör. Storybook docs'ta
    // story'ler geç yerleşince) `alwaysVisible` balonlar eski koordinatta
    // asılı kalıyordu. Konum değişmediyse state güncellenmez (render yok).
    let frame = 0;
    const tick = () => {
      updatePosition();
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [showTooltip, updatePosition]);

  return position;
}

/** Tetikleyiciye `aria-describedby` (açıkken) ve tıklamalı modda `aria-expanded` ekler. */
function decorateTrigger(trigger: React.ReactNode, showTooltip: boolean, tooltipId: string, isClick: boolean): React.ReactNode {
  if (!isValidElement<{ "aria-describedby"?: string; "aria-expanded"?: boolean }>(trigger)) return trigger;
  const extra: Record<string, unknown> = {};
  if (showTooltip) extra["aria-describedby"] = [trigger.props["aria-describedby"], tooltipId].filter(Boolean).join(" ");
  // Tıklamalı modda tetikleyici bir aç/kapa düğmesidir — durumunu duyurur.
  if (isClick) extra["aria-expanded"] = showTooltip;
  return React.cloneElement(trigger, extra);
}

interface TooltipBubbleProps {
  bubbleRef: ElRef;
  id: string;
  position: Position | null;
  skeleton: boolean;
  content: React.ReactNode;
  color: NonNullable<TooltipProps["color"]>;
  variant: NonNullable<TooltipProps["variant"]>;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function TooltipBubble({ bubbleRef, id, position, skeleton, content, color, variant, className, style, onMouseEnter, onMouseLeave }: TooltipBubbleProps) {
  const side = position?.side ?? "top";
  const vertical = side === "top" || side === "bottom";
  return (
    <span
      ref={bubbleRef}
      role="tooltip"
      id={id}
      aria-busy={skeleton || undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        // Boyutlar ant.design'ın gerçek Tooltip'inden: padding 6px 8px,
        // radius 6px, line-height 22px. Genişlik en çok 20rem ve HİÇBİR ZAMAN
        // ekran genişliği − 2×kenar payından fazla değil (mobilde taşmaz).
        "absolute z-mari-tooltip w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-md px-2 py-1.5 text-sm leading-[1.375rem] text-wrap",
        // Yalnızca solma: ölçek animasyonu oku da kaydırıyordu (kullanıcı bulgusu).
        "transition-opacity duration-150 starting:opacity-0 motion-reduce:transition-none",
        getVariantClasses(color, variant),
        className
      )}
      // Ölçülene kadar görünmez (yanlış yerde bir kare parlamasın).
      style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? undefined : "hidden", ...style }}
    >
      {skeleton ? (
        <span className="flex flex-col gap-1.5 py-1" aria-hidden>
          <span className={cn("block h-2.5 w-32 rounded-sm opacity-60", skeletonFill(true))} />
          <span className={cn("block h-2.5 w-20 rounded-sm opacity-60", skeletonFill(true))} />
        </span>
      ) : (
        content
      )}
      {/* Ok: balonla aynı renkte döndürülmüş kare; tetikleyicinin ortasını gösterir. */}
      <span
        aria-hidden
        className={cn("absolute size-2 rotate-45", ARROW_SIDE_CLASS[side], getArrowClasses(color, variant))}
        style={vertical ? { left: position?.arrowOffset } : { top: position?.arrowOffset }}
      />
    </span>
  );
}

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
  openDelay = 100,
  openOn = "hover",
  skeleton = false,
}: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const { visible, setVisible, open, close, closeNow, clearTimer } = useVisibility(alwaysVisible, openOn, wrapperRef, bubbleRef);
  const tooltipId = useId();
  const showTooltip = (visible || Boolean(alwaysVisible)) && !disabled;
  const position = useTrackedPosition(showTooltip, wrapperRef, bubbleRef, placement);

  const isClick = openOn === "click";
  const decoratedTrigger = decorateTrigger(trigger, showTooltip, tooltipId, isClick);
  const hoverHandlers = isClick
    ? { onClick: () => setVisible((v) => !v) }
    : { onMouseEnter: () => open(openDelay), onMouseLeave: close, onFocus: () => open(0), onBlur: closeNow };

  const bubble = showTooltip ? (
    <TooltipBubble
      bubbleRef={bubbleRef}
      id={tooltipId}
      position={position}
      skeleton={skeleton}
      content={content}
      color={color}
      variant={variant}
      className={className}
      style={style}
      // Fare takibi yalnızca "üzerine gelinebilirlik" (WCAG 1.4.13) için; tıklamalı modda yok.
      onMouseEnter={isClick ? undefined : clearTimer}
      onMouseLeave={isClick ? undefined : close}
    />
  ) : null;

  return (
    <>
      {/* Sarmalayıcı KENDİSİ interaktif değil — hover/focus bölgesi. Gerçek
          etkileşim `trigger`da; `onKeyDown` yalnızca Escape için (odak
          trigger'da, olay buraya bubble eder). */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <span
        ref={wrapperRef}
        className={cn("inline-block self-start", triggerClassName)}
        {...hoverHandlers}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            clearTimer();
            if (!alwaysVisible) setVisible(false);
          }
        }}
      >
        {decoratedTrigger}
      </span>
      {bubble && typeof document !== "undefined" && createPortal(bubble, document.body)}
    </>
  );
}
