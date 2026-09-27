import { cn } from "@mari-ui/core";
import type { DrawerPosition, DrawerSize } from "./types";

/**
 * Yan çekmece genişliği / üst-alt yüksekliği. Yan çekmece dar ekranda
 * `100vw - 3rem`i aşmaz — solda örtüden bir şerit kalır, dokunarak
 * kapatılabilir ve kullanıcı hâlâ sayfada olduğunu görür.
 */
const SIDE_WIDTH: Record<DrawerSize, string> = {
  sm: "w-[min(20rem,calc(100vw-3rem))]",
  md: "w-[min(25rem,calc(100vw-3rem))]",
  lg: "w-[min(40rem,calc(100vw-3rem))]",
};
const EDGE_HEIGHT: Record<DrawerSize, string> = {
  sm: "h-[min(16rem,85dvh)]",
  md: "h-[min(28rem,85dvh)]",
  lg: "h-[min(40rem,90dvh)]",
};

export const isSide = (position: DrawerPosition) => position === "left" || position === "right";

export function getPanelClass(position: DrawerPosition, size: DrawerSize, custom: boolean): string {
  const side = isSide(position);
  return cn(
    "absolute flex flex-col bg-mari-surface text-mari-foreground shadow-mari-xl outline-none",
    "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
    position === "right" && "inset-y-0 right-0 border-l border-mari-border",
    position === "left" && "inset-y-0 left-0 border-r border-mari-border",
    position === "top" && "inset-x-0 top-0 rounded-b-2xl border-b border-mari-border",
    // Alt çekmece = mobil "bottom sheet": yuvarlak üst köşeler + tutamaç.
    position === "bottom" && "inset-x-0 bottom-0 rounded-t-2xl border-t border-mari-border pb-[env(safe-area-inset-bottom)]",
    !custom && (side ? SIDE_WIDTH[size] : EDGE_HEIGHT[size])
  );
}

/**
 * Açıkken yerinde; `starting:` (@starting-style) ilk boyamada kapalı
 * konumdan başlatır → mount anında kayarak girer. Kapanışta panel
 * `usePresence` süresi boyunca DOM'da kalıp dışarı kayar.
 */
const OPEN: Record<DrawerPosition, string> = {
  right: "translate-x-0 starting:translate-x-full",
  left: "translate-x-0 starting:-translate-x-full",
  top: "translate-y-0 starting:-translate-y-full",
  bottom: "translate-y-0 starting:translate-y-full",
};
const CLOSED: Record<DrawerPosition, string> = {
  right: "translate-x-full",
  left: "-translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
};

export function getTranslateClass(position: DrawerPosition, open: boolean): string {
  return open ? OPEN[position] : CLOSED[position];
}
