"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/*
 * Kenardan açılan modal katmanların (Drawer, NavDrawer) ortak davranışı.
 * Faz 13.6'dan önce bu mantık yalnız `menu/_shared/NavDrawer.tsx`'te vardı;
 * `Drawer`da HİÇBİRİ yoktu (odak tuzağı, Escape, kaydırma kilidi, portal) —
 * kapalı Drawer DOM'da kalıyor, içindeki düğmeler Tab ile odaklanabiliyordu.
 * Artık tek yerde.
 */

export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Gerçekten odaklanabilen öğeler. `aria-hidden`/`inert` bir atanın içindekiler
 * elenir: iskelette gerçek içerik `SkeletonSlot` ile görünmez kopya olarak
 * DOM'da kalır (`visibility: hidden` → `focus()` sessizce başarısız olur);
 * bunlar sayılırsa odak tuzağının ilk/son öğesi görünmez bir düğme olur ve
 * Tab takılır.
 */
export function getFocusables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.closest('[aria-hidden="true"], [inert]')
  );
}

export function firstFocusable(root: ParentNode): HTMLElement | null {
  return getFocusables(root)[0] ?? null;
}

/** Öğe var ve iskeletin görünmez kopyasında (aria-hidden/inert) değilse kendisi. */
export function reachable(el: HTMLElement | null | undefined): HTMLElement | null {
  return el && !el.closest('[aria-hidden="true"], [inert]') ? el : null;
}

/**
 * İskelet → içerik geldi: iskelette odak "Kapat"a (ya da panele) düşer;
 * içerik gelince odak hâlâ orada ise normal ilk odağa taşınır. Kullanıcı
 * bu arada odağı başka yere taşıdıysa dokunulmaz.
 */
export function useRefocusAfterSkeleton(
  open: boolean,
  skeleton: boolean,
  panelRef: RefObject<HTMLElement | null>,
  getInitialFocus: (panel: HTMLElement) => HTMLElement | null | undefined,
  closeSelector: string
) {
  const wasSkeleton = useRef(skeleton);
  const getInitialFocusRef = useRef(getInitialFocus);
  getInitialFocusRef.current = getInitialFocus;
  useEffect(() => {
    const panel = panelRef.current;
    if (open && wasSkeleton.current && !skeleton && panel) {
      const active = document.activeElement;
      if (active === panel || (active instanceof HTMLElement && active.matches(closeSelector))) {
        const target = getInitialFocusRef.current(panel);
        if (target && target !== active) target.focus();
      }
    }
    wasSkeleton.current = skeleton;
  }, [skeleton, open, panelRef, closeSelector]);
}

/**
 * Açılışta hemen mount; kapanışta `exitMs` (çıkış animasyonu) bitince
 * unmount. `mounted` false iken hiç render etmeyin.
 */
export function usePresence(open: boolean, exitMs: number): boolean {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);
  return open || mounted;
}

export interface ModalBehaviorOptions {
  /** Escape kapatsın mı. Varsayılan: `true`. */
  closeOnEscape?: boolean;
  /** Sayfa kaydırmasını kilitle. Varsayılan: `true`. */
  lockScroll?: boolean;
  /**
   * Açılışta odaklanacak öğeyi seçer. Verilmezse: `[data-autofocus]` → ilk
   * odaklanabilir → panelin kendisi.
   */
  getInitialFocus?: (panel: HTMLElement) => HTMLElement | null | undefined;
}

/** `[data-autofocus]` — kendisi odaklanabilir değilse (bileşen data-* iletmiyorsa) içindeki ilk odaklanabilir. */
export function findAutofocus(root: ParentNode): HTMLElement | null {
  const auto = root.querySelector<HTMLElement>("[data-autofocus]");
  if (!auto || auto.closest('[aria-hidden="true"], [inert]')) return null;
  return auto.matches(FOCUSABLE_SELECTOR) ? auto : firstFocusable(auto);
}

/**
 * Açıkken:
 * - sayfa kaydırması kilitlenir (kaydırma çubuğu genişliği kadar sağ dolgu
 *   eklenir — kilitlenince içerik yana kaymasın),
 * - odak panelin ilk odaklanabilir öğesine (yoksa panelin kendisine) taşınır
 *   ve Tab/Shift+Tab ile panel içinde döner,
 * - Escape `onClose` çağırır,
 * - kapanınca odak açılıştan önceki öğeye (genelde tetikleyici) döner.
 */
export function useModalBehavior(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  { closeOnEscape = true, lockScroll = true, getInitialFocus }: ModalBehaviorOptions = {}
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const getInitialFocusRef = useRef(getInitialFocus);
  getInitialFocusRef.current = getInitialFocus;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    if (lockScroll) {
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }

    if (panel) {
      const target = getInitialFocusRef.current
        ? getInitialFocusRef.current(panel)
        : (findAutofocus(panel) ?? firstFocusable(panel));
      (target ?? panel).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        // İçteki açılır bir parça (Select listesi, DatePicker/Popover paneli) Escape'i zaten işlediyse
        // yalnız o kapanır — pencere değil.
        if (event.defaultPrevented) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = getFocusables(panel);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (lockScroll) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      }
      previouslyFocused?.focus();
    };
  }, [open, panelRef, closeOnEscape, lockScroll]);
}
