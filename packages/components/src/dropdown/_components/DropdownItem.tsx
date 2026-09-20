"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownItemProps } from "../types";
import { useDropdown } from "../useDropdown";

/**
 * Yapı ant.design menü öğesinden: 32px yükseklik (5px/12px iç boşluk, 22px
 * satır yüksekliği), 4px yarıçap, ikon + metin, disabled durumu. Renkler kendi
 * token'larımızdan: hover'da hafif zemin, danger'da hafif kırmızı zemin.
 */
export function DropdownItem({ children, icon, danger = false, disabled = false, onClick, className }: DropdownItemProps) {
  const { setVisible, triggerRef } = useDropdown();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        setVisible(false);
        triggerRef.current?.focus();
      }}
      className={cn(
        "flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-[0.3125rem] text-start text-sm leading-[1.375rem] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring disabled:cursor-not-allowed disabled:opacity-25",
        danger
          ? "text-mari-error enabled:hover:bg-mari-error-subtle"
          : "text-mari-foreground enabled:hover:bg-mari-foreground/[0.04]",
        className
      )}
    >
      {icon && (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

/** Menü ayırıcısı: 1px, dikeyde 4px boşluk, hafif çizgi. */
export function DropdownDivider({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-mari-foreground/[0.06]", className)} />;
}
