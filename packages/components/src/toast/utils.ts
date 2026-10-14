import React from "react";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon } from "lucide-react";
import { textClass } from "../lib/colorClasses";
import type { ToastPosition, ToastType } from "./types";

/*
 * Durum ikonu rol renginde (eskiden içi dolu daire + kontrast renk — küçükte seçilmiyordu).
 */
export function getToastIcon(type: ToastType | undefined): React.ReactNode {
  const map = { error: CircleXIcon, success: CircleCheckIcon, warning: CircleAlertIcon, info: InfoIcon } as const;
  if (!type || !(type in map)) return null;
  const role = type as keyof typeof map;
  return React.createElement(map[role], { size: 20, "aria-hidden": true, className: `shrink-0 ${textClass[role]}` });
}

/**
 * Konum başına kap. Mobilde (sm altı) üst/alt kenarda tam genişlik — dar
 * ekranda köşeye sıkışmış 288px'lik kart yerine.
 */
export function getContainerPositionClass(position: ToastPosition): string {
  switch (position) {
    case "top":
      return "top-4 inset-x-4 items-center sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2";
    case "bottom":
      return "bottom-4 inset-x-4 items-center sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2";
    case "topLeft":
      return "top-4 inset-x-4 items-stretch sm:inset-x-auto sm:left-4 sm:items-start";
    case "topRight":
      return "top-4 inset-x-4 items-stretch sm:inset-x-auto sm:right-4 sm:items-end";
    case "bottomLeft":
      return "bottom-4 inset-x-4 items-stretch sm:inset-x-auto sm:left-4 sm:items-start";
    case "bottomRight":
      return "bottom-4 inset-x-4 items-stretch sm:inset-x-auto sm:right-4 sm:items-end";
  }
}

/** Alttaki konumlarda en yeni toast en altta (kenara yakın) değil, en üstte değil — kenara yakın olan en yeni. */
export const isBottom = (position: ToastPosition) => position.startsWith("bottom");
