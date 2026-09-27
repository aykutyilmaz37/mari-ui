import React from "react";
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon, SparklesIcon } from "lucide-react";
import type { ColorRole, Size } from "@mari-ui/core";
import { bgSubtleClass, textClass } from "../lib/colorClasses";

const ICON_BY_COLOR: Record<ColorRole, React.ComponentType<{ className?: string; size?: number }>> = {
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
  info: InfoIcon,
  primary: InfoIcon,
  accent: SparklesIcon,
  neutral: InfoIcon,
};

/**
 * Durum ikonu tonlu bir dairenin içinde (ant.design confirm düzeninin
 * yapısı). `color` yoksa ve özel `icon` da yoksa hiç ikon gösterilmez.
 */
export function renderModalIcon(color: ColorRole | undefined, icon: React.ReactNode): React.ReactNode {
  if (!color && !icon) return null;
  const role = color ?? "neutral";
  const Icon = ICON_BY_COLOR[role];
  return (
    <span aria-hidden className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bgSubtleClass[role]} ${textClass[role]}`}>
      {icon ?? <Icon size={20} />}
    </span>
  );
}

/** ant.design: varsayılan 520px. */
export const sizeMap: Record<Size, string> = {
  sm: "sm:max-w-[25rem]",
  md: "sm:max-w-[32.5rem]",
  lg: "sm:max-w-[45rem]",
};
