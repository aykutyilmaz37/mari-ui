"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { Button } from "../button";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { elevationClass } from "../lib/elevationClass";
import { FLOATING_ARROW_GAP_PX, FLOATING_ARROW_INSET_PX, FLOATING_EDGE_PX, FLOATING_GAP_PX, FloatingArrow } from "../lib/FloatingArrow";
import { useModalBehavior } from "../lib/overlay";
import { useFloatingPosition } from "../lib/useFloatingPosition";
import { SkeletonBlock } from "../skeleton";
import type { TourProps, TourStep } from "./types";
import { isFullyVisible, spotlightPath, stepFromKey, type Box } from "./utils";

export type { TourProps, TourStep };

/** Hedef çevresindeki boşluk ve köşe yarıçapı (rem). */
const SPOT_PAD_REM = 0.375;
const SPOT_RADIUS_REM = 0.5;

const remToPx = (rem: number) => rem * (Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);

const TOUR_PLACEHOLDER = (
  <div className="flex flex-col gap-2 pr-6">
    <SkeletonBlock active width="10rem" height="1rem" radius="sm" />
    <SkeletonBlock active width="100%" height="0.75rem" radius="sm" />
    <SkeletonBlock active width="70%" height="0.75rem" radius="sm" />
  </div>
);

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Hedefin ekrandaki kutusu, her karede (kaydırma/yeniden düzen sırasında karartma deliği hedefi izlesin). */
function useTargetBox(active: boolean, el: HTMLElement | null): Box | null {
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    if (!active || !el) {
      setBox(null);
      return;
    }
    let frame = 0;
    const read = () => {
      const r = el.getBoundingClientRect();
      setBox((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : { top: r.top, left: r.left, width: r.width, height: r.height }));
      frame = requestAnimationFrame(read);
    };
    read();
    return () => cancelAnimationFrame(frame);
  }, [active, el]);
  return box;
}

/** Karartma: hedef dışını örter ve sayfa tıklamalarını engeller (delik de dahil — tur modal). */
function Mask({ box }: Readonly<{ box: Box | null }>) {
  const [size, setSize] = useState(() => ({ w: typeof window === "undefined" ? 0 : window.innerWidth, h: typeof window === "undefined" ? 0 : window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <div aria-hidden className="fixed inset-0 z-mari-modal">
      <svg width={size.w} height={size.h} className="absolute inset-0 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none">
        <path d={spotlightPath(size.w, size.h, box, remToPx(SPOT_PAD_REM), remToPx(SPOT_RADIUS_REM))} fillRule="evenodd" style={{ fill: "var(--mari-color-scrim)" }} />
      </svg>
    </div>
  );
}

interface FooterProps {
  current: number;
  total: number;
  step: TourStep;
  onPrev: () => void;
  onNext: () => void;
  skeleton: boolean;
}

function Footer({ current, total, step, onPrev, onNext, skeleton }: Readonly<FooterProps>) {
  const last = current === total - 1;
  return (
    <div className="mt-4 flex items-center gap-2">
      {total > 1 && (
        <>
          <span aria-hidden className="flex items-center gap-1">
            {Array.from({ length: total }, (_, i) => (
              // Konumsal göstergeler.
              <span key={i} className={cn("h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none", i === current ? "w-4 bg-mari-primary" : "w-1.5 bg-mari-border")} />
            ))}
          </span>
          <span className="text-xs text-mari-muted tabular-nums">
            {current + 1} / {total}
          </span>
        </>
      )}
      <span className="ml-auto flex gap-2">
        {current > 0 && (
          <Button size="sm" variant="outline" color="neutral" data-tour-back onClick={onPrev} skeleton={skeleton}>
            Geri
          </Button>
        )}
        <Button size="sm" data-tour-primary onClick={onNext} skeleton={skeleton}>
          {step.nextButtonText ?? (last ? "Bitir" : "Sonraki")}
        </Button>
      </span>
    </div>
  );
}

/*
 * yapı ant.design Tour'dan: arayüzü adım adım tanıtan rehber.
 * Her adım bir öğeyi vurgular (sayfa kararır, hedefin çevresi açık kalır) ve
 * yanında başlık/açıklama/görsel taşıyan bir panel açar; hedefsiz adım
 * ortada. Panel konumu ve ok Popover ile ortak (`useFloatingPosition`,
 * `FloatingArrow`).
 */
/**
 * Erişilebilirlik: panel `role="dialog"`; karartmalıyken modal (odak
 * panelde döner, Escape kapatır, kapanınca odak açılıştan önceki öğeye
 * döner). Açılışta odak "Sonraki"de; adım değişince içerik (adım no +
 * başlık + açıklama) `aria-live` ile okunur, odak düğmede kalır. ←/→ adım
 * değiştirir. Hareket azaltma tercihinde kaydırma anlık.
 */
export function Tour({
  steps,
  mask = true,
  arrow = true,
  scrollIntoView = true,
  onClose,
  onFinish,
  "aria-label": ariaLabel = "Tanıtım turu",
  className,
  skeleton = false,
  ...props
}: TourProps) {
  const [open, setOpen] = useControllableState<boolean>({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const [current, setCurrent] = useControllableState<number>({ value: props.current, defaultValue: props.defaultCurrent ?? 0, onChange: props.onChange });
  const step = open ? steps[current] : undefined;
  const masked = step ? (step.mask ?? mask) : false;
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);

  // Hedef DOM'dan adım değişince çözülür (render sırasında DOM okunmaz).
  useEffect(() => {
    setTargetEl(open ? (steps[current]?.target?.() ?? null) : null);
  }, [open, current, steps]);
  anchorRef.current = targetEl;

  const coords = useFloatingPosition(open && targetEl !== null, anchorRef, panelRef, {
    placement: step?.placement ?? "bottom",
    gap: arrow ? FLOATING_ARROW_GAP_PX : FLOATING_GAP_PX,
    edge: FLOATING_EDGE_PX,
    arrow: arrow ? { inset: FLOATING_ARROW_INSET_PX, pointAtCenter: true } : undefined,
  });
  const box = useTargetBox(open && masked, targetEl);
  const refocusPrimary = useRef(false);
  useEffect(() => {
    if (!refocusPrimary.current) return;
    refocusPrimary.current = false;
    panelRef.current?.querySelector<HTMLElement>("[data-tour-primary]")?.focus();
  }, [current]);

  const close = (finished = false) => {
    setOpen(false);
    if (finished) onFinish?.();
    else onClose?.(current);
  };

  useModalBehavior(open && masked, panelRef, () => close(), {
    lockScroll: false,
    getInitialFocus: (panel) => panel.querySelector<HTMLElement>("[data-tour-primary]"),
  });

  // Karartmasız turda da Escape kapatır (modal davranışı yokken).
  useEffect(() => {
    if (!open || masked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      setOpen(false);
      onClose?.(current);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, masked, current, setOpen, onClose]);

  useEffect(() => {
    if (!scrollIntoView || !targetEl) return;
    const r = targetEl.getBoundingClientRect();
    if (!isFullyVisible(r, window.innerWidth, window.innerHeight)) targetEl.scrollIntoView?.({ block: "center", inline: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [targetEl, scrollIntoView]);

  if (!open || !step || typeof document === "undefined") return null;


  const go = (next: number) => {
    const to = Math.max(0, Math.min(steps.length - 1, next));
    // İlk adıma dönünce "Geri" DOM'dan kalkar — odaktaysa body'ye düşmesin, "Sonraki"ye geçsin.
    if (to === 0 && document.activeElement?.hasAttribute("data-tour-back")) refocusPrimary.current = true;
    setCurrent(to);
  };
  const next = () => (current >= steps.length - 1 ? close(true) : go(current + 1));
  const centered = targetEl === null;

  return createPortal(
    <>
      {masked && <Mask box={box} />}
      {/* ←/→ adım kısayolu dialog düzeyinde (içindeki düğmelerden kabarır). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={masked || undefined}
        aria-label={ariaLabel}
        aria-describedby={`${titleId} ${descId}`}
        tabIndex={-1}
        onKeyDown={(e) => {
          const editable = (e.target as HTMLElement).closest("input, textarea, [contenteditable=true]") !== null;
          const to = stepFromKey(e.key, current, steps.length, editable);
          if (to === null) return;
          e.preventDefault();
          go(to);
        }}
        className={cn(
          "fixed z-mari-modal w-80 max-w-[calc(100vw-1rem)] rounded-lg bg-mari-surface p-4 text-sm text-mari-foreground outline-none",
          "transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none",
          elevationClass.lg,
          centered && "top-1/2 left-1/2 -translate-1/2",
          // Konum ölçülene kadar `invisible` DEĞİL: görünmez öğedeki odak (Sonraki) tarayıcıda düşer, ←/→ kopardı.
          !centered && !coords && "pointer-events-none opacity-0",
          className
        )}
        style={centered ? undefined : { top: coords?.top ?? 0, left: coords?.left ?? 0 }}
      >
        {arrow && !centered && coords && <FloatingArrow side={coords.side} offset={coords.arrowOffset} />}
        <button
          type="button"
          aria-label="Turu kapat"
          onClick={() => close()}
          className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-mari-muted outline-none hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-mari-ring pointer-coarse:size-10"
        >
          <XIcon aria-hidden size={16} />
        </button>
        <ContentSkeleton on={skeleton} fallback={TOUR_PLACEHOLDER}>
        <div>
        {step.cover && <div className="mb-3 overflow-hidden rounded-md [&_img]:w-full">{step.cover}</div>}
        {/* Adım değişince içerik okunur; odak "Sonraki"de kalır. */}
        <div aria-live="polite" className="pr-6">
          <h2 id={titleId} className="font-semibold">
            <span className="sr-only">{`Adım ${current + 1} / ${steps.length}: `}</span>
            {step.title}
          </h2>
          {step.description && (
            <div id={descId} className="mt-1 text-mari-muted">
              {step.description}
            </div>
          )}
        </div>
        </div>
        </ContentSkeleton>
        <Footer current={current} total={steps.length} step={step} onPrev={() => go(current - 1)} onNext={next} skeleton={skeleton} />
      </div>
    </>,
    document.body
  );
}
