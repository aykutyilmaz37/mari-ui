"use client";

import React, { isValidElement, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn, useControllableState } from "@mari-ui/core";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { elevationClass } from "../lib/elevationClass";
import { FLOATING_ARROW_GAP_PX, FLOATING_ARROW_INSET_PX, FLOATING_EDGE_PX, FLOATING_GAP_PX, FloatingArrow } from "../lib/FloatingArrow";
import { findAutofocus, firstFocusable, getFocusables } from "../lib/overlay";
import { useFloatingPosition } from "../lib/useFloatingPosition";
import { SkeletonBlock } from "../skeleton";
import type { PopoverProps } from "./types";

export type { PopoverProps };

const HOVER_OPEN_MS = 100;
const HOVER_CLOSE_MS = 150;

const PLACEHOLDER = (
  <div className="flex flex-col gap-2 py-0.5">
    <SkeletonBlock active width="10rem" height="0.875rem" radius="sm" />
    <SkeletonBlock active width="14rem" height="0.75rem" radius="sm" />
  </div>
);

type ElRef = React.RefObject<HTMLElement | null>;

/** Sarmalayıcının içindeki gerçek tetikleyici (odak buraya döner). */
const triggerEl = (anchor: HTMLElement | null) => (anchor ? (firstFocusable(anchor) ?? anchor) : null);

/**
 * Kapatma yolları: Escape (odak tetikleyiciye döner), dışarı tıklama (odağa
 * dokunmaz — kullanıcı başka bir yere tıkladı), panelin kenarından Tab ile
 * çıkma (odak tetikleyiciye döner, Tab doğal akışla SONRAKİ öğeye geçer;
 * Shift+Tab tetikleyicide kalır).
 */
function useDismiss(open: boolean, anchorRef: ElRef, panelRef: ElRef, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closeRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Modal içinde: yalnız Popover kapansın (Modal `defaultPrevented`ı görür).
        e.preventDefault();
        const focusWasInside = panelRef.current?.contains(document.activeElement) || anchorRef.current?.contains(document.activeElement);
        closeRef.current();
        if (focusWasInside) triggerEl(anchorRef.current)?.focus();
        return;
      }
      const panel = panelRef.current;
      if (e.key !== "Tab" || !panel?.contains(document.activeElement)) return;
      const items = getFocusables(panel);
      const atEnd = e.shiftKey ? document.activeElement === (items[0] ?? null) || items.length === 0 : document.activeElement === (items.at(-1) ?? null) || items.length === 0;
      if (!atEnd) return;
      // Panel body'ye portal edildiğinden DOM sırası tetikleyiciden sonra değil: önce tetikleyiciye dön.
      triggerEl(anchorRef.current)?.focus();
      if (e.shiftKey) e.preventDefault();
      closeRef.current();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, anchorRef, panelRef]);
}

/** Tıklamayla açılınca odak panele: `data-autofocus` → ilk odaklanabilir → panelin kendisi. Konum ölçülene kadar beklenir (görünmez öğeye odak verilemez). */
function useFocusOnOpen(open: boolean, positioned: boolean, moveFocus: boolean, panelRef: ElRef) {
  const done = useRef(false);
  useEffect(() => {
    if (!open) {
      done.current = false;
      return;
    }
    if (!moveFocus || !positioned || done.current) return;
    done.current = true;
    const panel = panelRef.current;
    if (panel) (findAutofocus(panel) ?? firstFocusable(panel) ?? panel).focus();
  }, [open, positioned, moveFocus, panelRef]);
}

/**
 * Panel, odak İÇİNDEYKEN kapanırsa (içindeki "Vazgeç"/"Uygula" gibi bir
 * düğmeyle ya da kontrollü `open` ile) odak tetikleyiciye döner — panel DOM'dan
 * kalkınca odak aksi halde `<body>`ye düşüyordu. Dışarı tıklamada odak zaten
 * tıklanan yere geçtiği için dokunulmaz.
 */
function useReturnFocus(open: boolean, anchorRef: ElRef) {
  const focusInside = useRef(false);
  useEffect(() => {
    if (open || !focusInside.current) return;
    focusInside.current = false;
    triggerEl(anchorRef.current)?.focus();
  }, [open, anchorRef]);
  return {
    onFocus: () => (focusInside.current = true),
    onBlur: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) focusInside.current = false;
    },
  };
}

/** Üzerine gelme niyeti: açarken kısa gecikme, kapatırken tetikleyiciden panele geçecek kadar süre. */
function useHoverIntent(setOpen: (open: boolean) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const schedule = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), ms);
  };
  return { enter: () => schedule(true, HOVER_OPEN_MS), leave: () => schedule(false, HOVER_CLOSE_MS), cancel: () => clearTimeout(timer.current) };
}

/**
 * Faz 16.2 — yapı ant.design Popover'dan: başlık + etkileşimli içerik taşıyan
 * yüzen panel. Tooltip'ten farkı: içinde düğme/form olabilir, bu yüzden
 * gerçek bir (modal olmayan) dialog. Panel, konum ve ok Dropdown ile ortak
 * (`useFloatingPosition`, `FloatingArrow`).
 *
 * Erişilebilirlik: tetikleyici `aria-expanded` + `aria-haspopup="dialog"` +
 * (açıkken) `aria-controls`; panel `role="dialog"`, başlık adıdır. Tıklamayla
 * açılınca odak panele geçer; Escape/dışarı tıklama/kenardan Tab kapatır.
 * `hover` modunda klavye odağı da açar (yalnız fareyle erişilen içerik olmasın).
 */
export function Popover({
  title,
  content,
  children,
  trigger = "click",
  placement = "top",
  arrow = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  role = "dialog",
  className,
  skeleton = false,
}: Readonly<PopoverProps>) {
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();
  const coords = useFloatingPosition(open, anchorRef, panelRef, {
    placement,
    gap: arrow ? FLOATING_ARROW_GAP_PX : FLOATING_GAP_PX,
    edge: FLOATING_EDGE_PX,
    arrow: arrow ? { inset: FLOATING_ARROW_INSET_PX, pointAtCenter: false } : undefined,
  });
  const hover = useHoverIntent(setOpen);

  useDismiss(open, anchorRef, panelRef, () => setOpen(false));
  useFocusOnOpen(open, coords !== null, trigger === "click", panelRef);
  const trackFocus = useReturnFocus(open, anchorRef);

  const decorated = isValidElement<Record<string, unknown>>(children)
    ? React.cloneElement(children, {
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "aria-controls": open ? panelId : undefined,
      })
    : children;

  const triggerHandlers = {
    click: { onClick: () => setOpen(!open) },
    hover: { onMouseEnter: hover.enter, onMouseLeave: hover.leave, onFocus: () => setOpen(true), onBlur: (e: React.FocusEvent) => !panelRef.current?.contains(e.relatedTarget as Node) && hover.leave() },
    focus: { onFocus: () => setOpen(true), onBlur: (e: React.FocusEvent) => !panelRef.current?.contains(e.relatedTarget as Node) && setOpen(false) },
  }[trigger];

  return (
    <>
      {/* Sarmalayıcı etkileşimli değil — olaylar içindeki gerçek tetikleyiciden kabarır. */}
      <span ref={anchorRef} className="inline-flex" {...triggerHandlers}>
        {decorated}
      </span>
      {open && (
        <PopoverPanel
          panelRef={panelRef}
          id={panelId}
          titleId={titleId}
          title={title}
          content={content}
          ariaLabel={ariaLabel}
          ariaLabelledBy={ariaLabelledBy}
          ariaDescribedBy={ariaDescribedBy}
          role={role}
          focusTracking={trackFocus}
          coords={coords}
          arrow={arrow}
          skeleton={skeleton}
          hover={trigger === "hover" ? hover : undefined}
          className={className}
        />
      )}
    </>
  );
}

interface PopoverPanelProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  id: string;
  titleId: string;
  title: React.ReactNode;
  content: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role: "dialog" | "alertdialog";
  focusTracking: ReturnType<typeof useReturnFocus>;
  coords: ReturnType<typeof useFloatingPosition>;
  arrow: boolean;
  skeleton: boolean;
  /** Yalnız `hover` modunda: panelin üstüne gelmek kapanmayı iptal eder. */
  hover?: ReturnType<typeof useHoverIntent>;
  className?: string;
}

function PopoverPanel({
  panelRef,
  id,
  titleId,
  title,
  content,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  role,
  focusTracking,
  coords,
  arrow,
  skeleton,
  hover,
  className,
}: PopoverPanelProps) {
  if (typeof document === "undefined") return null;
  const labelledBy = ariaLabelledBy ?? (title ? titleId : undefined);
  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={skeleton || undefined}
      onFocus={focusTracking.onFocus}
      onBlur={focusTracking.onBlur}
      onMouseEnter={hover?.cancel}
      onMouseLeave={hover?.leave}
      className={cn(
        "fixed z-mari-dropdown w-max max-w-[min(22rem,calc(100vw-1rem))] rounded-lg bg-mari-surface p-3 text-sm text-mari-foreground outline-none",
        "transition-opacity duration-150 starting:opacity-0 motion-reduce:transition-none",
        elevationClass.md,
        !coords && "invisible",
        className
      )}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0 }}
    >
      {arrow && coords && <FloatingArrow side={coords.side} offset={coords.arrowOffset} />}
      <ContentSkeleton on={skeleton} fallback={PLACEHOLDER}>
        <div>
          {title && (
            <p id={titleId} className="mb-1 font-semibold">
              {title}
            </p>
          )}
          {content}
        </div>
      </ContentSkeleton>
    </div>,
    document.body
  );
}
