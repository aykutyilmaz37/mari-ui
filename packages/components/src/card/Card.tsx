import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { Skeleton, SkeletonBlock } from "../skeleton";
import { skeletonFill } from "../lib/skeleton";
import { SkeletonSlot } from "../lib/SkeletonSlot";
import type { CardMetaProps, CardProps } from "./types";
import { cardPadding, getBaseClassname } from "./utils";

export type { CardProps, CardMetaProps };

/**
 * Eski sürümdeki sorunlar:
 * - `hoverable` gölgeyi her zaman veriyordu (üzerine gelince değil).
 * - Kapak kartın yuvarlak köşelerinden taşıyor, altına keyfi `mb-4` boşluk
 *  ekleniyordu. Artık kenardan kenara, üst köşeler karttan miras.
 * - Başlık uzun olunca `extra`'yı itiyordu; artık başlık kesilir (`truncate`).
 * - Gövde `flex-1` değildi — ızgarada eşit yükseklikli kartların alt
 *  kısımları (footer/actions) hizalanmıyordu.
 * - `lg` `md` ile aynıydı; yükleme iskeleti iki gri çizgiden ibaretti.
 * Yeni: `actions`, `href` (link kart), `CardMeta`.
 *
 * Hook yok — sunucu bileşeni olarak render edilebilir.
 */
export const Card = /* @__PURE__ */ forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      children,
      title,
      extra,
      cover,
      footer,
      actions,
      bordered = true,
      hoverable,
      skeleton = false,
      size = "md",
      inset,
      href,
      target,
      className,
      classNames,
      onClick,
    },
    ref
  ) {
    // İskeletteyken kart gezinmez/tıklanmaz: henüz var olmayan bir kaydın
    // sayfasına gitmek ya da onClick'i veri yokken çağırmak yanlış.
    const isLink = !skeleton && Boolean(href);
    const isButton = !skeleton && !isLink && Boolean(onClick);
    const base = getBaseClassname({
      bordered,
      hoverable: !skeleton && (hoverable ?? isLink),
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
          // İskelette kapak kendi kutusunu (en-boy oranı) korur, içi parıltı olur.
          <div
            className={cn(
              "overflow-hidden rounded-t-[inherit] [&_img]:block [&_img]:w-full [&_img]:object-cover",
              skeleton && skeletonFill(true),
              classNames?.cover
            )}
            aria-hidden={skeleton || undefined}
          >
            {skeleton ? <div className="invisible">{cover}</div> : cover}
          </div>
        )}

        {(title || extra) && (
          <div className={cn("flex items-center gap-3 border-b border-mari-border", cardPadding.header(size), classNames?.header)}>
            {title && (
              <div className="min-w-0 flex-1 truncate font-heading font-semibold">
                <SkeletonSlot on={skeleton} className="items-center" placeholder={<SkeletonBlock active width="40%" height="1rem" radius="sm" />}>
                  {title}
                </SkeletonSlot>
              </div>
            )}
            {extra && (
              <div className="ml-auto flex shrink-0 items-center text-sm">
                <SkeletonSlot on={skeleton} flow="flex" className="items-center justify-items-end" placeholder={<SkeletonBlock active width="3rem" height="0.75rem" radius="sm" />}>
                  {extra}
                </SkeletonSlot>
              </div>
            )}
          </div>
        )}

        <div className={cn("flex-1", cardPadding.body(size), classNames?.body)}>
          <SkeletonSlot on={skeleton} placeholder={<Skeleton active title={false} paragraph={{ rows: 3 }} />}>
            {children}
          </SkeletonSlot>
        </div>

        {footer && (
          <div className={cn("border-t border-mari-border", cardPadding.footer(size), classNames?.footer)}>
            <SkeletonSlot on={skeleton} className="items-center" placeholder={<SkeletonBlock active width="45%" height="0.75rem" radius="sm" />}>
              {footer}
            </SkeletonSlot>
          </div>
        )}

        {actions && actions.length > 0 && (
          <ul className={cn("flex divide-x divide-mari-border border-t border-mari-border", classNames?.actions)}>
            {actions.map((action, i) => (
              <li key={i} className={cn("flex min-w-0 flex-1 items-center justify-center", cardPadding.action(size))}>
                <SkeletonSlot on={skeleton} flow="flex" className="place-items-center" placeholder={<SkeletonBlock active width="2.5rem" height="0.75rem" radius="full" />}>
                  {action}
                </SkeletonSlot>
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

/*
 * ant.design `Card.Meta`: avatar + başlık + açıklama.
 */
/** Kart içinde avatar, başlık ve açıklamadan oluşan satır. */
export function CardMeta({ avatar, title, description, className }: Readonly<CardMetaProps>) {
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
