import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { Skeleton } from "../skeleton";
import type { CardMetaProps, CardProps } from "./types";
import { cardPadding, getBaseClassname } from "./utils";

export type { CardProps, CardMetaProps };

/**
 * Faz 13.6 — yapı ant.design Card'ından, görünüm kendi token'larımızdan.
 * Eski sürümdeki sorunlar:
 * - `hoverable` gölgeyi her zaman veriyordu (üzerine gelince değil).
 * - Kapak kartın yuvarlak köşelerinden taşıyor, altına keyfi `mb-4` boşluk
 *   ekleniyordu. Artık kenardan kenara, üst köşeler karttan miras.
 * - Başlık uzun olunca `extra`'yı itiyordu; artık başlık kesilir (`truncate`).
 * - Gövde `flex-1` değildi — ızgarada eşit yükseklikli kartların alt
 *   kısımları (footer/actions) hizalanmıyordu.
 * - `lg` `md` ile aynıydı; yükleme iskeleti iki gri çizgiden ibaretti.
 * Yeni: `actions`, `href` (link kart), `CardMeta`.
 *
 * Hook yok — sunucu bileşeni olarak render edilebilir.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      title,
      extra,
      cover,
      footer,
      actions,
      bordered = true,
      hoverable,
      loading = false,
      size = "md",
      inset,
      href,
      target,
      className,
      classNames,
      styles,
      onClick,
    },
    ref
  ) => {
    if (process.env.NODE_ENV !== "production" && styles) {
      console.warn("[@mari-ui/components] Card: `styles` prop'u kaldırıldı. Stil için `classNames` kullanın.");
    }

    const isLink = Boolean(href);
    const isButton = !isLink && Boolean(onClick);
    const base = getBaseClassname({
      bordered,
      hoverable: hoverable ?? isLink,
      interactive: isLink || isButton,
      size,
      inset,
      className,
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.();
      }
    };

    const content = (
      <>
        {cover && (
          // Üst köşeleri karttan miras al — görsel yuvarlak kenardan taşmasın.
          <div className={cn("overflow-hidden rounded-t-[inherit] [&_img]:block [&_img]:w-full [&_img]:object-cover", classNames?.cover)}>
            {cover}
          </div>
        )}

        {(title || extra) && (
          <div className={cn("flex items-center gap-3 border-b border-mari-border", cardPadding.header(size), classNames?.header)}>
            {title && <div className="min-w-0 flex-1 truncate font-semibold">{title}</div>}
            {extra && <div className="ml-auto flex shrink-0 items-center text-sm">{extra}</div>}
          </div>
        )}

        <div className={cn("flex-1", cardPadding.body(size), classNames?.body)}>
          {loading ? <Skeleton active title={false} paragraph={{ rows: 3 }} /> : children}
        </div>

        {footer && <div className={cn("border-t border-mari-border", cardPadding.footer(size), classNames?.footer)}>{footer}</div>}

        {actions && actions.length > 0 && (
          <ul className={cn("flex divide-x divide-mari-border border-t border-mari-border", classNames?.actions)}>
            {actions.map((action, i) => (
              <li key={i} className={cn("flex min-w-0 flex-1 items-center justify-center", cardPadding.action(size))}>
                {action}
              </li>
            ))}
          </ul>
        )}
      </>
    );

    if (isLink) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={cn(base, "no-underline")}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        ref={ref}
        className={base}
        onClick={onClick}
        onKeyDown={isButton ? handleKeyDown : undefined}
        role={isButton ? "button" : undefined}
        tabIndex={isButton ? 0 : undefined}
      >
        {content}
      </div>
    );
  }
);

Card.displayName = "Card";

/** ant.design `Card.Meta`: avatar + başlık + açıklama. */
export function CardMeta({ avatar, title, description, className }: CardMetaProps) {
  return (
    <div className={cn("flex min-w-0 gap-4", className)}>
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="min-w-0 flex-1">
        {title && <div className="truncate text-base font-semibold text-mari-foreground">{title}</div>}
        {description && <div className="mt-1 text-sm text-mari-muted">{description}</div>}
      </div>
    </div>
  );
}
