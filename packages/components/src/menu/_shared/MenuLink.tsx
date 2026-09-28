"use client";

import React from "react";
import { MariLink } from "../../link";

export interface MenuLinkProps {
  /** Varsa gerçek bir `<a href>` render edilir; yoksa (ya da `disabled`) düğme. */
  route?: string;
  onNavigate?: (route: string) => void;
  /** Tıklamada (gezinmeden önce) — host aktif öğeyi güncellesin / panelini kapatsın diye. */
  onSelect?: () => void;
  disabled?: boolean;
  /** Geçerli sayfa ise `aria-current="page"`. */
  current?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Faz 15.5 — menü öğeleri eskiden `<button>` + `window.location.href` idi:
 * orta tık / "yeni sekmede aç" / adres önizlemesi çalışmıyor, arama motorları
 * menüdeki sayfaları hiç göremiyordu. Artık route'u olan öğe gerçek bir link.
 * `onNavigate` verilmişse DÜZ sol tık engellenip router'a devredilir (SPA
 * geçişi); değiştirici tuşlu tıklamalar (⌘/Ctrl/Shift/orta tık) tarayıcıya
 * bırakılır — yeni sekmede açma her zaman çalışır. Link, `MariLinkProvider`da
 * verilen router bileşenidir (Next `Link`, React Router `Link`); yoksa `<a>`.
 */
export function MenuLink({ route, onNavigate, onSelect, disabled, current, className, children }: MenuLinkProps) {
  if (!route || disabled) {
    return (
      <button type="button" disabled={disabled} onClick={onSelect} className={className}>
        {children}
      </button>
    );
  }
  return (
    <MariLink
      href={route}
      aria-current={current ? "page" : undefined}
      className={className}
      onClick={(event) => {
        onSelect?.();
        if (!onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {children}
    </MariLink>
  );
}
