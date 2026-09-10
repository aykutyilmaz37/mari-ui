import React, { forwardRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, resolveColorVariant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";
import { sizeClass } from "../lib/sizeClasses";
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
    target,
    onClick,
    onMouseEnter,
    onMouseLeave,
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
  const { isLoading, loadingIcon, loadingIconPosition } = resolveLoading(loading);

  // Yükleniyor durumunda buton HER ZAMAN devre dışıdır — çift gönderim /
  // yarım işlem sırasında ikinci tıklama engellenir.
  const isDisabled = disabled || isLoading;

  // `loading` bir ikon vermediyse (ör. `loading` veya `loading={{}}`) varsayılan
  // dönen göstergeyi kullan — "yükleniyor" durumunun HER ZAMAN görünür bir
  // ikonu olur.
  const resolvedLoadingIcon = loadingIcon ?? <Loader2Icon className="w-4 h-4 animate-spin" aria-hidden />;

  const colorClasses = colorVariantToClassName(resolveColorVariant(resolvedColor, resolvedVariant));

  const rootClasses = cn(
    "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    sizeClass[size],
    getShapeClasses(shape),
    colorClasses,
    isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
    block && "w-full",
    className,
    classNames.wrapper
  );

  // İkon/etiket span'ları KÖKÜN doğrudan çocuklarıdır — `sizeClass[size]`
  // içindeki `gap-*` bu sayede flexbox üzerinden aralarına doğal olarak
  // uygulanır; ayrı bir "content" sarmalayıcıya ve gap'i regex'le tekrar
  // çıkarmaya gerek kalmaz.
  const children_ = (
    <>
      {isLoading && loadingIconPosition === "start" && <span className={classNames.icon}>{resolvedLoadingIcon}</span>}
      {icon && !isLoading && iconPosition === "start" && <span className={classNames.icon}>{icon}</span>}
      {children && <span className={classNames.label}>{children}</span>}
      {icon && !isLoading && iconPosition === "end" && <span className={classNames.icon}>{icon}</span>}
      {isLoading && loadingIconPosition === "end" && <span className={classNames.icon}>{resolvedLoadingIcon}</span>}
    </>
  );

  const commonProps = {
    ...rest,
    className: rootClasses,
    onClick,
    onMouseEnter,
    onMouseLeave,
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
