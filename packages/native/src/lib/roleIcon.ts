import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon, SparklesIcon } from "./icons";

type IconComponent = (props: { size?: number; color?: string }) => React.ReactElement;

/** Rol rengine göre varsayılan durum ikonu — Alert ve Toast ortak (web ile aynı eşleme). */
export const ROLE_ICON: Record<ColorRole, IconComponent> = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: CircleAlertIcon,
  error: CircleXIcon,
  primary: InfoIcon,
  accent: SparklesIcon,
  neutral: InfoIcon,
};
