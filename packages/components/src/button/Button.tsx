import React, { forwardRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, resolveColorVariant } from "@mari-ui/core";
import { bgSubtleHoverClass, colorVariantToClassName } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import { iconSizeClass, sizeClass, touchTargetClass, touchTargetSquareClass } from "../lib/sizeClasses";
import type { ButtonProps } from "./types";
import { getShapeClasses, resolveLegacyButtonProps, resolveLoading } from "./utils";

export type { ButtonProps };

/**
 * Bu component saf sunum yapıyor — hiçbir hook, hiçbir browser API çağırmıyor
 * (yalnızca event handler PROP'ları kabul ediyor). Bu yüzden `"use client"`
 * DİREKTİFİ YOK: sunucu bileşeni olarak render edilebilir. Tüketici
 * `onClick` gibi bir handler geçtiğinde React bunu otomatik olarak client
 * boundary'sine taşır — Button'ın kendisinin client-only olması gerekmez.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    type,
    color,
    variant,
    size = "md",
    shape = "default",
    block = false,
    classNames = {},
    className = "",
    disabled = false,
    href,
    htmlType = "button",
    icon,
    iconPosition = "start",
    loading = false,
    skeleton = false,
    target,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onDragOver,
    onDrop,
    children,
    ...rest
  } = props;

  const { color: resolvedColor, variant: resolvedVariant } = resolveLegacyButtonProps({
    type,
    color,
    variant,
  });
  const { isLoading, loadingIcon, loadingIconPosition, loadingDelay } = resolveLoading(loading);

  // Yükleniyor durumunda buton HER ZAMAN devre dışıdır — çift gönderim /
  // yarım işlem sırasında ikinci tıklama engellenir.
  const isDisabled = disabled || isLoading;

  // `loading` bir ikon vermediyse (ör. `loading` veya `loading={{}}`) varsayılan
  // dönen göstergeyi kullan — "yükleniyor" durumunun HER ZAMAN görünür bir
  // ikonu olur.
  const resolvedLoadingIcon = loadingIcon ?? <Loader2Icon className="w-4 h-4 animate-spin" aria-hidden />;
  // `loading.delay`: buton hemen devre dışı olur (çift gönderim yok), ama
  // gösterge ancak gecikme dolunca belirir — saf CSS, hook gerekmez.
  // İkon kapsayıcısı: satır içi hizalama (taban çizgisi boşluğu yok) + butonun boyutuna göre ikon ölçüsü.
  const iconClass = cn("inline-flex shrink-0", iconSizeClass[size], classNames.icon);
  const loadingIconClass = cn(iconClass, loadingDelay > 0 && "opacity-0 animate-[mari-fade-in_150ms_ease-out_forwards]");
  const loadingIconStyle = loadingDelay > 0 ? { animationDelay: `${loadingDelay}ms` } : undefined;

  if (process.env.NODE_ENV !== "production" && !children && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("[@mari-ui/components] Button: metinsiz (ikon-only) butona `aria-label` verin — ekran okuyucu aksi halde adsız bir buton okur.");
  }

  const colorClasses = colorVariantToClassName(resolveColorVariant(resolvedColor, resolvedVariant));
  // `solid` hover'ını `resolveColorVariant` zaten veriyor; `outline`/`ghost`in
  // ise HİÇ hover durumu yoktu — tıklanabilir bir öğe için geri bildirim
  // eksikti. Etkileşim geri bildirimi bilinçli olarak burada: aynı `outline`
  // varyantını `Tag` gibi STATİK component'ler de kullanıyor, onlara hover
  // dolgusu vermek yanlış olurdu.
  const interactiveHoverClass = resolvedVariant === "outline" || resolvedVariant === "ghost" ? bgSubtleHoverClass[resolvedColor] : undefined;

  // Geometri (boyut + şekil + genişlik) iskeletle ORTAK — yüklenince kutu zıplamaz.
  const geometryClasses = cn(
    "inline-flex max-w-full items-center justify-center whitespace-nowrap font-medium select-none",
    sizeClass[size],
    getShapeClasses(shape),
    block && "w-full"
  );

  // Dokunmatikte görünmez 44px tıklama alanı (bkz. lib/sizeClasses). Kare/daire
  // ya da metinsiz butonlar her yönde, diğerleri yalnızca dikeyde genişler.
  const isIconOnly = shape === "circle" || (!children && Boolean(icon));
  const touchTarget = isIconOnly ? touchTargetSquareClass[size] : touchTargetClass[size];

  const rootClasses = cn(
    geometryClasses,
    "relative",
    touchTarget,
    // Basılma geri bildirimi: hafif küçülme (Tailwind v4'te `scale` ayrı bir
    // özellik — `transform` değil, geçiş listesine açıkça yazılır).
    "cursor-pointer transition-[color,background-color,border-color,box-shadow,scale] duration-150 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    colorClasses,
    interactiveHoverClass,
    // `pointer-events-none` KULLANILMAZ — imleci de kapatıp `cursor-not-allowed`'ı
    // hiç göstermiyordu. Tıklamayı native `disabled` zaten engeller.
    isDisabled && "opacity-50 cursor-not-allowed active:scale-100",
    className,
    classNames.wrapper
  );

  // İkon/etiket span'ları KÖKÜN doğrudan çocuklarıdır — `sizeClass[size]`
  // içindeki `gap-*` bu sayede flexbox üzerinden aralarına doğal olarak
  // uygulanır; ayrı bir "content" sarmalayıcıya ve gap'i regex'le tekrar
  // çıkarmaya gerek kalmaz.
  const children_ = (
    <>
      {isLoading && loadingIconPosition === "start" && <span className={loadingIconClass} style={loadingIconStyle}>{resolvedLoadingIcon}</span>}
      {icon && !isLoading && iconPosition === "start" && <span className={iconClass}>{icon}</span>}
      {children && <span className={cn("min-w-0 truncate", classNames.label)}>{children}</span>}
      {icon && !isLoading && iconPosition === "end" && <span className={iconClass}>{icon}</span>}
      {isLoading && loadingIconPosition === "end" && <span className={loadingIconClass} style={loadingIconStyle}>{resolvedLoadingIcon}</span>}
    </>
  );

  if (skeleton) {
    // Etiket ve ikon şeffaf olarak YERİNDE kalır → iskelet gerçek butonla aynı genişlikte.
    return (
      // `outline`'ın 1px kenarlığı kutuyu 2px genişletir — iskelet de aynı (şeffaf) kenarlığı taşır.
      <span {...skeletonBoxProps(cn(geometryClasses, resolvedVariant === "outline" && "border border-transparent", className, classNames.wrapper))}>
        {icon && <span className={iconClass}>{icon}</span>}
        {children && <span className="min-w-0 truncate">{children}</span>}
      </span>
    );
  }

  const commonProps = {
    ...rest,
    className: rootClasses,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onDragOver,
    onDrop,
  };

  if (href && !isDisabled) {
    return (
      <a href={href} target={target} {...commonProps} ref={ref as React.Ref<HTMLAnchorElement>}>
        {children_}
      </a>
    );
  }

  return (
    <button
      type={htmlType}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...commonProps}
      ref={ref}
    >
      {children_}
    </button>
  );
});

Button.displayName = "Button";
