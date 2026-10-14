"use client";

import React, { Children, cloneElement, isValidElement, useState } from "react";
import { cn, resolveColorVariant } from "@mari-ui/core";
import { colorVariantToClassName } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import type { AvatarGroupProps, AvatarProps } from "./types";
import { getInitialFontClass, getInitials, getShapeClasses, getSizeStyle } from "./utils";

export type { AvatarProps, AvatarGroupProps };

/**
 * `useState` (resim yükleme hatası takibi) kullanıyor — bu yüzden gerçekten
 * `"use client"` gerekiyor. Tek boyut kaynağı `size` (görsel de kutu da).
 */
export function Avatar({ alt = "", icon, shape = "circle", size = "md", src, color, onError, skeleton = false, className }: Readonly<AvatarProps>) {
  const [imgError, setImgError] = useState(false);

  if (skeleton) {
    return <div {...skeletonBoxProps(cn(getShapeClasses(shape, size), className))} style={getSizeStyle(size)} />;
  }

  const handleImgError = () => {
    const preventDefault = onError?.() === false;
    if (!preventDefault) setImgError(true);
  };

  // `src=""` "görsel yok" sayılır — boş src tarayıcıda sayfanın kendi URL'ini
  // ister ve `onError` her zaman tetiklenmez (Faz 13.4'te gözlemlenen bug).
  const hasImage = typeof src === "string" && src !== "" && !imgError;
  const hasCustomNode = typeof src === "object" && src !== null;

  let content: React.ReactNode;
  if (hasImage) content = <img src={src} alt={alt} onError={handleImgError} className="h-full w-full object-cover" />;
  else if (hasCustomNode) content = src;
  else content = icon ?? <span className={cn(getInitialFontClass(size), "font-semibold leading-none")}>{getInitials(alt)}</span>;

  // Görsel yokken baş harf/ikon bir METİN değil, kişiyi temsil eden bir
  // görseldir: ekran okuyucu "A Y" değil `alt`ı okusun.
  const fallbackA11y = !hasImage && !hasCustomNode && alt ? { role: "img", "aria-label": alt } : { "aria-hidden": !alt || undefined };
  const toneClass = color ? colorVariantToClassName(resolveColorVariant(color, "soft")) : "bg-mari-surface-alt text-mari-muted";

  return (
    <div
      className={cn(getShapeClasses(shape, size), !hasImage && toneClass, "select-none", className)}
      style={getSizeStyle(size)}
      {...(hasImage ? {} : fallbackA11y)}
    >
      {content}
    </div>
  );
}

/**
 * Üst üste binen avatar yığını (ekip, katılımcılar). Her avatar yüzey renginde
 * bir halkayla ayrılır; `max`ı aşanlar tek bir "+N" avatarında toplanır.
 */
// Bindirme 2/4/6px (+2px halka): daha fazlası geniş baş harflerin ("MD")
// ikinci harfini bir sonraki avatarın altında bırakıyordu ("DK" → "D").
const GROUP_OVERLAP_CLASS = { sm: "-space-x-0.5", md: "-space-x-1", lg: "-space-x-1.5" } as const;

export function AvatarGroup({ children, max, size = "md", shape = "circle", className, skeleton }: Readonly<AvatarGroupProps>) {
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<AvatarProps>[];
  const visible = max !== undefined && items.length > max ? items.slice(0, max) : items;
  const rest = items.length - visible.length;

  return (
    <div role="group" aria-busy={skeleton || undefined} className={cn("flex items-center [&>*]:ring-2 [&>*]:ring-mari-surface", GROUP_OVERLAP_CLASS[typeof size === "number" ? "md" : size], className)}>
      {/* Grubun iskeleti avatarlara geçer (tek prop); avatarın kendi `skeleton`u verildiyse o kazanır. */}
      {visible.map((item) => cloneElement(item, { size: item.props.size ?? size, shape: item.props.shape ?? shape, skeleton: item.props.skeleton ?? skeleton }))}
      {rest > 0 && skeleton && <div {...skeletonBoxProps(getShapeClasses(shape, size))} style={getSizeStyle(size)} />}
      {rest > 0 && !skeleton && (
        <div
          role="img"
          aria-label={`${rest} kişi daha`}
          className={cn(getShapeClasses(shape, size), "bg-mari-surface-alt font-semibold text-mari-foreground", getInitialFontClass(size))}
          style={getSizeStyle(size)}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
