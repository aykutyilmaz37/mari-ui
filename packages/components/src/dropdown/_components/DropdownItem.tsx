"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownItemProps } from "../types";
import { useDropdown } from "../useDropdown";
import { NewTabHint, getLinkAttrs } from "../../lib/linkBehavior";

/**
 * Yapı ant.design menü öğesinden: 32px yükseklik (5px/12px iç boşluk, 22px
 * satır yüksekliği), 4px yarıçap, ikon + metin, disabled durumu. Renkler kendi
 * token'larımızdan: hover'da hafif zemin, danger'da hafif kırmızı zemin.
 */
export function DropdownItem({ children, icon, extra, danger = false, disabled = false, href, target, onClick, className }: DropdownItemProps) {
  const { setVisible, triggerRef } = useDropdown();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    onClick?.(event);
    setVisible(false);
    // Link sayfadan çıkarır; odağı tetikleyiciye döndürmek yalnızca yerinde kalan eylemlerde anlamlı.
    if (!href) triggerRef.current?.focus();
  };

  const classes = cn(
    "flex min-h-8 pointer-coarse:min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-[0.3125rem] text-start text-sm leading-[1.375rem] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring disabled:cursor-not-allowed disabled:opacity-25",
    danger
      ? "text-mari-error hover:bg-mari-error-subtle disabled:hover:bg-transparent"
      : "text-mari-foreground hover:bg-mari-foreground/[0.04] disabled:hover:bg-transparent",
    className
  );

  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
      {href && <NewTabHint target={target} />}
      {extra && <span className="ms-4 shrink-0 text-xs text-mari-muted">{extra}</span>}
    </>
  );

  // `href` → gerçek bir link (orta tık / yeni sekmede aç / adres önizlemesi çalışır).
  // Devre dışı öğe her durumda `disabled` bir düğmedir: `<a>`nın `disabled` özniteliği yok.
  if (href && !disabled) {
    return (
      <a href={href} {...getLinkAttrs(target)} onClick={handleClick} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} onClick={handleClick} className={classes}>
      {content}
    </button>
  );
}

/** Grup başlığı ("Hesap", kullanıcı e-postası…): odaklanılamaz, soluk küçük metin. */
export function DropdownLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-3 pb-1 pt-1.5 text-xs text-mari-muted", className)}>{children}</div>;
}

/** Menü ayırıcısı: 1px, dikeyde 4px boşluk, hafif çizgi. */
export function DropdownDivider({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-mari-foreground/[0.06]", className)} />;
}
