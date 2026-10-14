import React from "react";
import { X } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { TagProps } from "./types";
import { skeletonBoxProps } from "../lib/skeleton";
import { getTagClass, TAG_GEOMETRY_CLASS } from "./utils";

export type { TagProps };

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Tag({
  children,
  color = "neutral",
  variant = "soft",
  icon,
  closeIcon,
  bordered = false,
  onClose,
  closeLabel,
  skeleton = false,
  className,
}: Readonly<TagProps>) {
  if (skeleton) {
    return (
      <span {...skeletonBoxProps(cn(TAG_GEOMETRY_CLASS, (variant === "outline" || bordered) && "border border-transparent", className))}>
        {icon && <span className="inline-flex items-center">{icon}</span>}
        <span className="min-w-0 truncate">{children}</span>
        {(onClose || closeIcon) && <span className="-mr-1 size-4 shrink-0" />}
      </span>
    );
  }

  const tagClass = getTagClass(color, variant, bordered, className);

  // Eski davranış her Tag'de varsayılan olarak bir X gösteriyordu — `onClose`
  // verilmese bile. Artık kapatılabilirlik `onClose` VEYA açık `closeIcon`
  // varlığına bağlı; aksi halde işlevsiz bir buton render edilmez.
  const showCloseButton = closeIcon !== false && (closeIcon !== undefined || Boolean(onClose));
  const closeIconEl = closeIcon === true || closeIcon === undefined || closeIcon === false ? <X size={12} aria-hidden /> : closeIcon;
  const resolvedCloseLabel = closeLabel ?? (typeof children === "string" ? `${children} etiketini kaldır` : "Kaldır");

  return (
    <span className={tagClass}>
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span className="min-w-0 truncate">{children}</span>
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          aria-label={resolvedCloseLabel}
          // 16px görünür kutu + `before` ile 24px'e genişleyen tıklama alanı
          // (eskiden 10px'lik ikonun kendisi hedefti — dokunmatikte ıskalanıyordu).
          className="relative -mr-1 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-[opacity,background-color] duration-150 before:absolute before:-inset-1 hover:bg-current/15 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mari-ring"
        >
          {closeIconEl}
        </button>
      )}
    </span>
  );
}
