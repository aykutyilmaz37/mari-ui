import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import type { CardProps } from "./types";
import { getBaseClassname } from "./utils";

export type { CardProps };

/**
 * Hook yok, browser API yok (`onClick` bir PROP, çağrılması tüketicinin
 * sorumluluğu) — saf sunum, "use client" gerekmiyor. Eskiden `forwardRef`
 * değildi; artık diğer component'lerle tutarlı.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      title,
      extra,
      cover,
      footer,
      bordered = true,
      hoverable = false,
      loading = false,
      size,
      inset,
      className,
      classNames,
      styles,
      onClick,
    },
    ref
  ) => {
    if (process.env.NODE_ENV !== "production" && styles) {
      console.warn(
        "[@mari-ui/components] Card: `styles` prop'u kaldırıldı (eskiden de gerçekte hiç uygulanmıyordu). " +
          "Stil için `classNames` kullanın."
      );
    }

    const base = getBaseClassname({ bordered, hoverable, size, inset, className });

    // `onClick` verildiğinde Card TIKLANABİLİR hale geliyor ama bir `<div>`
    // olduğu için klavye kullanıcıları ve ekran okuyucular bunu asla
    // ETKİNLEŞTİREMİYORDU — sadece fare/dokunmayla erişilebiliyordu. Faz 9'da
    // eslint-plugin-jsx-a11y'nin yakaladığı gerçek bir bug (bkz. plan).
    // `onClick` yoksa hiçbir interaktiflik semantiği eklenmiyor — düz bir
    // kapsayıcı olarak kalıyor.
    const isInteractive = Boolean(onClick);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={base}
        onClick={onClick}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
      >
        {cover && <div className={cn("mb-4", classNames?.cover)}>{cover}</div>}

        {(title || extra) && (
          <div>
            <div className={cn("p-4 flex items-center justify-between font-semibold text-mari-foreground", classNames?.header)}>
              <div>{title}</div>
              <div>{extra}</div>
            </div>
            <div className="h-px bg-mari-border min-w-full" />
          </div>
        )}

        <div className={cn("p-4", classNames?.body)}>
          {loading ? (
            <div className="space-y-2 animate-pulse" aria-hidden>
              <div className="h-3 w-3/4 rounded bg-mari-surface-alt" />
              <div className="h-3 w-1/2 rounded bg-mari-surface-alt" />
            </div>
          ) : (
            children
          )}
        </div>

        {footer && (
          <>
            <div className="h-px bg-mari-border min-w-full" />
            <div className={cn("p-4", classNames?.footer)}>{footer}</div>
          </>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
