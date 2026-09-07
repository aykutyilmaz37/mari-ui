import React from "react";
import { X } from "lucide-react";
import type { TagProps } from "./types";
import { getTagClass, resolveLegacyTagColor } from "./utils";

export type { TagProps };

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Tag({
  children,
  statu,
  color,
  variant = "soft",
  icon,
  closeIcon,
  bordered = false,
  onClose,
  className,
}: TagProps) {
  const resolvedColor = resolveLegacyTagColor(statu, color);
  const tagClass = getTagClass(resolvedColor, variant, bordered, className);

  // Eski davranış her Tag'de varsayılan olarak bir X gösteriyordu — `onClose`
  // verilmese bile. Artık kapatılabilirlik `onClose` VEYA açık `closeIcon`
  // varlığına bağlı; aksi halde işlevsiz bir buton render edilmez.
  const showCloseButton = closeIcon !== false && (closeIcon !== undefined || Boolean(onClose));
  const closeIconEl = closeIcon === true || closeIcon === undefined || closeIcon === false ? <X size={14} /> : closeIcon;

  return (
    <span className={tagClass}>
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full hover:opacity-70 focus:outline-none"
        >
          {closeIconEl}
        </button>
      )}
    </span>
  );
}
