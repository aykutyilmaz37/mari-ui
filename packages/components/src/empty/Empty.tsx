import React from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import { skeletonBoxProps, type SkeletonableProps } from "../lib/skeleton";

export interface EmptyProps extends SkeletonableProps {
  title: string;
  description?: React.ReactNode;
  /** Tek birincil eylem. `onClick` (ya da `href`) olmadan buton çizilmez. */
  buttonText?: string;
  onClick?: () => void;
  /** Butonu bağlantı olarak çizer (başka sayfaya götüren eylem). */
  href?: string;
  icon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
  /** Birden çok ya da özel eylem (ör. birincil + ikincil buton). Verilirse `buttonText` yok sayılır. */
  actions?: React.ReactNode;
  /** `md` (varsayılan): sayfa/bölüm. `sm`: kart, tablo, liste içi — daha az boşluk, küçük ikon. */
  size?: "sm" | "md";
  /**
   * Başlığın etiketi. Varsayılan `p`: boş durum bir belge BÖLÜMÜ değildir —
   * eskiden sabit `<h2>`'ydi, kart/tablo içinde başlık hiyerarşisini bozuyordu.
   * Sayfanın ana içeriği boşsa uygun bir başlık seviyesi verin.
   */
  titleAs?: "p" | "h2" | "h3" | "h4";
  className?: string;
}

const SIZE = {
  sm: { root: "py-8 px-4 gap-1.5", icon: "size-10 [&_svg]:size-5", title: "text-sm", description: "text-xs", actionGap: "mt-3" },
  md: { root: "py-16 px-4 gap-2", icon: "size-14 [&_svg]:size-7", title: "text-lg", description: "text-sm", actionGap: "mt-4" },
} as const;

/**
 * Faz 15: varsayılan ikon `FileWarning` idi — boş durum bir HATA değil
 * (`InboxIcon`). İkon yumuşak bir daire içinde; başlık `h2` yerine `p`
 * (`titleAs`); `onClick` olmadan `buttonText` verilince işe yaramaz, devre dışı
 * bir buton çiziliyordu — artık buton yalnızca bir eylem varsa çıkar.
 */
// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Empty({
  title,
  description,
  buttonText,
  onClick,
  href,
  icon,
  buttonIcon,
  actions,
  size = "md",
  titleAs: TitleTag = "p",
  className,
  skeleton = false,
}: EmptyProps) {
  const s = SIZE[size];

  if (skeleton) {
    return (
      <div aria-hidden className={cn("flex flex-col items-center justify-center text-center", s.root, className)}>
        <span {...skeletonBoxProps(cn("rounded-full", s.icon))} />
        <span {...skeletonBoxProps(cn("mt-1 h-4 w-40 rounded-sm"))} />
        {description && <span {...skeletonBoxProps("h-3 w-56 max-w-full rounded-sm")} />}
      </div>
    );
  }

  const hasButton = Boolean(buttonText && (onClick || href));

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", s.root, className)}>
      <div aria-hidden className={cn("mb-1 flex items-center justify-center rounded-full bg-mari-surface-alt text-mari-muted", s.icon)}>
        {icon ?? <InboxIcon />}
      </div>
      <TitleTag className={cn("font-semibold text-balance text-mari-foreground", s.title)}>{title}</TitleTag>
      {description && <p className={cn("max-w-md text-pretty text-mari-muted", s.description)}>{description}</p>}
      {actions ? (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", s.actionGap)}>{actions}</div>
      ) : (
        hasButton && (
          <div className={s.actionGap}>
            <Button color="primary" size={size === "sm" ? "sm" : "md"} onClick={onClick} href={href} icon={buttonIcon}>
              {buttonText}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
