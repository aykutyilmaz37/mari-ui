"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { FloatButton } from "./FloatButton";
import type { BackTopProps } from "./types";
import { defaultFocusTarget, shouldShowBackTop } from "./utils";

export type { BackTopProps };

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Faz 16.6 — FloatButton.BackTop: sayfa (ya da `target`) yeterince
 * kaydırılınca beliren "başa dön". Hareket azaltma tercihinde anında atlar.
 * Başa dönünce odak sayfanın başına (ilk h1 / main) taşınır — düğme
 * gizlendiğinde odak kaybolmasın ve klavye kullanıcısı baştan devam etsin.
 */
export function BackTop({ visibilityHeight = 400, target, focusTarget, icon = <ArrowUpIcon />, "aria-label": ariaLabel = "Başa dön", tooltip, ...rest }: BackTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = target?.() ?? null;
    const source: HTMLElement | Window = el ?? window;
    const read = () => setVisible(shouldShowBackTop(el ? el.scrollTop : window.scrollY, visibilityHeight));
    read();
    source.addEventListener("scroll", read, { passive: true });
    return () => source.removeEventListener("scroll", read);
  }, [target, visibilityHeight]);

  if (!visible) return null;

  const backToTop = () => {
    const el = target?.() ?? null;
    const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
    (el ?? window).scrollTo({ top: 0, behavior });
    const focusEl = focusTarget?.() ?? defaultFocusTarget(el ?? document);
    if (focusEl) {
      if (!focusEl.hasAttribute("tabindex") && !focusEl.matches("a, button, input, select, textarea")) focusEl.setAttribute("tabindex", "-1");
      focusEl.focus({ preventScroll: true });
    }
  };

  return <FloatButton {...rest} icon={icon} aria-label={ariaLabel} tooltip={tooltip} onClick={backToTop} />;
}
