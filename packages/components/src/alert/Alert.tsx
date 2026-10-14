"use client";

import React, { useState } from "react";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon, SparklesIcon, XIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSubtleClass, borderColorClass, textClass } from "../lib/colorClasses";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { SkeletonBlock } from "../skeleton";
import type { AlertProps } from "./types";

export type { AlertProps };

const EXIT_MS = 200;

const ICON: Record<ColorRole, React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>> = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: CircleAlertIcon,
  error: CircleXIcon,
  primary: InfoIcon,
  accent: SparklesIcon,
  neutral: InfoIcon,
};

const PLACEHOLDER = (
  <div className="flex flex-col gap-2 py-0.5">
    <SkeletonBlock active width="40%" height="0.875rem" radius="sm" />
    <SkeletonBlock active width="75%" height="0.75rem" radius="sm" />
  </div>
);

function resolveRole(role: AlertProps["role"], color: ColorRole): "alert" | "status" | undefined {
  if (role === "none") return undefined;
  if (role) return role;
  return color === "error" || color === "warning" ? "alert" : "status";
}

function renderIcon(icon: AlertProps["icon"], color: ColorRole): React.ReactNode {
  if (icon === false) return null;
  if (icon !== true && icon !== undefined) return icon;
  const Icon = ICON[color];
  return <Icon size={18} aria-hidden />;
}

/**
 * (tonlu zemin + rol renginde ince kenarlık ve ikon; metin gövde renginde —
 * renkli uzun metin okunmaz). Eylem sağda, dar ekranda metnin altına iner.
 *
 * Erişilebilirlik: `error`/`warning` `role="alert"` (hemen duyurulur), diğerleri
 * `role="status"`. İkon görsel — anlam başlık/metinde. Kapat düğmesi
 * adlandırılmış, 44px dokunma hedefi; kapanınca kısa bir solma ile kalkar.
 */
export function Alert({
  title,
  description,
  color = "info",
  icon = true,
  action,
  closable = false,
  onClose,
  closeLabel = "Uyarıyı kapat",
  banner = false,
  role,
  className,
  skeleton = false,
}: Readonly<AlertProps>) {
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const close = () => {
    setClosing(true);
    onClose?.();
    setTimeout(() => setClosed(true), EXIT_MS);
  };

  const iconNode = renderIcon(icon, color);

  return (
    <div
      role={skeleton ? undefined : resolveRole(role, color)}
      aria-busy={skeleton || undefined}
      className={cn(
        "flex items-start gap-3 text-sm text-mari-foreground transition-opacity duration-200 motion-reduce:transition-none",
        bgSubtleClass[color],
        banner ? "border-b px-4 py-2.5" : "rounded-lg border p-3.5",
        borderColorClass[color],
        closing && "opacity-0",
        className
      )}
    >
      <ContentSkeleton on={skeleton} fallback={PLACEHOLDER} className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-2">
          {iconNode && <span className={cn("flex shrink-0 items-center pt-px", textClass[color])}>{iconNode}</span>}
          <div className="min-w-0 flex-1 basis-48">
            {title && <p className="font-semibold leading-5">{title}</p>}
            {description && <div className={cn("leading-5", title && "mt-0.5 text-mari-muted")}>{description}</div>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      </ContentSkeleton>
      {closable && (
        <button
          type="button"
          onClick={close}
          aria-label={closeLabel}
          className={cn(
            "relative -m-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors",
            "hover:bg-mari-foreground/5 hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            // 28px → 44px (her yönde 8px).
            "pointer-coarse:before:absolute pointer-coarse:before:-inset-2"
          )}
        >
          <XIcon size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
