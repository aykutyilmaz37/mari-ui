"use client";

import React from "react";
import { bypassesRouter, getLinkAttrs, isPlainLeftClick, type LinkBehaviorProps } from "../../lib/linkBehavior";

export interface MenuLinkProps extends LinkBehaviorProps {
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
  /** Ray satırı gibi hover/odakla seçim yapan öğeler için. */
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  /** Odak geri döndürme gibi DOM aramaları için (`[data-menu-key]`). */
  "data-menu-key"?: string;
  /** Seçili ray öğesi — klavyeyle açılan panelde odak buraya gelir. */
  "data-selected"?: boolean;
  "data-sidebar-key"?: string;
  /** Kapalı akordeonun içindeki satırlar Tab sırasından çıkar (`-1`). */
  tabIndex?: number;
  /** Daraltılmış rayda tam başlık ipucu. */
  title?: string;
}

/**
 * Faz 15.5 — menü öğeleri eskiden `<button>` + `window.location.href` idi:
 * orta tık / "yeni sekmede aç" / adres önizlemesi çalışmıyor, arama motorları
 * menüdeki sayfaları hiç göremiyordu. Artık route'u olan öğe gerçek bir link.
 *
 * Router bağımsızdır (component Next mi React Router mı bilmez): `onNavigate`
 * verilmişse DÜZ sol tık engellenip ona devredilir (Next: `router.push`,
 * React Router: `navigate`) → sayfa yenilenmeden geçiş. Değiştirici tuşlu
 * tıklamalar, `target` (`_self` dışı), `reloadDocument` ve dış adresler
 * (`https:`, `mailto:`…) her zaman tarayıcıya bırakılır.
 */
export function MenuLink({ route, onNavigate, onSelect, disabled, current, target, reloadDocument, className, children, ...rest }: Readonly<MenuLinkProps>) {
  if (!route || disabled) {
    return (
      <button type="button" {...rest} disabled={disabled} onClick={onSelect} className={className}>
        {children}
      </button>
    );
  }
  return (
    <a
      {...rest}
      href={route}
      {...getLinkAttrs(target)}
      aria-current={current ? "page" : undefined}
      className={className}
      onClick={(event) => {
        onSelect?.();
        if (!onNavigate || !isPlainLeftClick(event) || bypassesRouter(route, { target, reloadDocument })) return;
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {children}
    </a>
  );
}
