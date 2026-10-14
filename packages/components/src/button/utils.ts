import type React from "react";
import type { ButtonIconPosition, ButtonLoading, ButtonShape } from "./types";

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
