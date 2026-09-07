import React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ColorRole, Size } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";

const ICON_BY_COLOR: Partial<Record<ColorRole, React.ComponentType<{ className?: string }>>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

/** `color` verilmemişse hiç ikon gösterilmez (eski `variant="default"` davranışı). */
export function renderModalIcon(color: ColorRole | undefined): React.ReactNode {
  if (!color) return null;
  const Icon = ICON_BY_COLOR[color];
  if (!Icon) return null;
  return React.createElement(Icon, { className: `w-5 h-5 ${textClass[color]}` });
}

export const sizeMap: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};
