import type React from "react";
import type { ColorRole, Variant } from "@mari-ui/core";
import type { ButtonIconPosition, ButtonLoading, ButtonShape, LegacyButtonType } from "./types";

export interface ResolvedButtonStyle {
  color: ColorRole;
  variant: Variant;
}

const LEGACY_TYPE_TO_COLOR: Record<LegacyButtonType, ColorRole | undefined> = {
  primary: "primary",
  secondary: "neutral",
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  // "text" ve "link" bir RENK değil, bir VARIANT ifade ediyordu — renk ekseni
  // etkilenmez, `color` prop'u veya varsayılanı geçerli kalır.
  text: undefined,
  link: undefined,
};

const LEGACY_TYPE_TO_VARIANT: Partial<Record<LegacyButtonType, Variant>> = {
  text: "ghost",
  link: "link",
};

/**
 * Eski `type`/`variant` ("outlined"|"filled") prop'larını yeni `color`/
 * `variant` eksenine çevirir. Açıkça verilen yeni prop'lar (color/variant)
 * her zaman kazanır — legacy sadece onlar verilmediğinde devreye girer.
 */
export function resolveLegacyButtonProps(props: {
  type?: LegacyButtonType;
  color?: ColorRole;
  variant?: Variant | "outlined" | "filled";
}): ResolvedButtonStyle {
  const { type, color, variant } = props;

  if (process.env.NODE_ENV !== "production" && (type !== undefined || variant === "outlined" || variant === "filled")) {
    console.warn(
      '[@mari-ui/components] Button: "type" ve "outlined"/"filled" variant değerleri deprecated. ' +
        '`color` (ColorRole) ve `variant` ("solid"|"outline"|"soft"|"ghost"|"link") kullanın.'
    );
  }

  const resolvedColor: ColorRole = color ?? (type ? LEGACY_TYPE_TO_COLOR[type] : undefined) ?? "primary";

  let resolvedVariant: Variant;
  if (variant === "outlined") resolvedVariant = "outline";
  else if (variant === "filled") resolvedVariant = "solid";
  else if (variant) resolvedVariant = variant;
  else if (type && LEGACY_TYPE_TO_VARIANT[type]) resolvedVariant = LEGACY_TYPE_TO_VARIANT[type]!;
  else resolvedVariant = "solid";

  return { color: resolvedColor, variant: resolvedVariant };
}

export function getShapeClasses(shape: ButtonShape): string {
  return {
    default: "",
    square: "rounded-none",
    circle: "rounded-full aspect-square !px-0",
    pill: "rounded-full",
  }[shape];
}

export function resolveLoading(loading: ButtonLoading): {
  isLoading: boolean;
  loadingIcon: React.ReactNode | null;
  loadingIconPosition: ButtonIconPosition;
  loadingDelay: number;
} {
  // Bir obje verilmişse (ör. `{ iconPosition: "end" }`) niyet "yükleniyor"dur —
  // `icon`/`delay` alanı olmasa bile. Varsayılan gösterge Button'da eklenir.
  const isLoading = typeof loading === "boolean" ? loading : loading != null;

  const loadingIcon = typeof loading === "object" && loading.icon ? loading.icon : null;

  const loadingIconPosition: ButtonIconPosition =
    typeof loading === "object" && loading.iconPosition ? loading.iconPosition : "start";

  const loadingDelay = typeof loading === "object" && loading.delay ? loading.delay : 0;

  return { isLoading, loadingIcon, loadingIconPosition, loadingDelay };
}
