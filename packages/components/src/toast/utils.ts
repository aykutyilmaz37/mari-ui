import React from "react";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon } from "lucide-react";
import { textSolidContrastClass } from "../lib/colorClasses";
import { cn } from "@mari-ui/core";
import type { ToastPosition, ToastType } from "./types";

/**
 * Eskiden bu dosya `useToastHook.tsx` diye adlandırılmıştı ama içinde
 * hiçbir hook yoktu — düz bir ikon seçici fonksiyondu (bkz. plan denetimi:
 * "toast/useToastHook.tsx" ismi yanıltıcı). `utils.ts`'e taşındı, gerçek
 * bir isim aldı.
 */
export function getToastIcon(type: ToastType | undefined): React.ReactNode {
  switch (type) {
    case "error":
      return React.createElement(CircleXIcon, { className: cn("fill-mari-error", textSolidContrastClass.error) });
    case "success":
      return React.createElement(CircleCheckIcon, { className: cn("fill-mari-success", textSolidContrastClass.success) });
    case "warning":
      return React.createElement(CircleAlertIcon, { className: cn("fill-mari-warning", textSolidContrastClass.warning) });
    case "info":
      return React.createElement(InfoIcon, { className: cn("fill-mari-info", textSolidContrastClass.info) });
    default:
      return null;
  }
}

/**
 * Konum bazlı KAP (container) class'ları — tekil toast'lar artık kendi
 * konumunu taşımıyor (bkz. Toast.tsx'teki not: eskiden her toast bağımsız
 * `absolute` konumlanıyordu, aynı köşede aynı anda 2+ toast birbirinin
 * TAM ÜSTÜNE biniyordu — stacking mantığı hiç yoktu).
 */
export function getContainerPositionClass(position: ToastPosition): string {
  switch (position) {
    case "top":
      return "top-4 left-1/2 -translate-x-1/2 items-center";
    case "bottom":
      return "bottom-4 left-1/2 -translate-x-1/2 items-center";
    case "topLeft":
      return "top-4 left-4 items-start";
    case "topRight":
      return "top-4 right-4 items-end";
    case "bottomLeft":
      return "bottom-4 left-4 items-start";
    case "bottomRight":
      return "bottom-4 right-4 items-end";
  }
}
