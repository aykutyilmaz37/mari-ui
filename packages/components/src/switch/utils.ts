import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { bgSolidClass } from "../lib/colorClasses";

const TRACK_SIZE_CLASS: Record<Size, string> = {
  sm: "h-6 w-12",
  md: "h-7 w-16",
  lg: "h-8 w-24",
};

const BALL_SIZE_CLASS: Record<Size, string> = {
  sm: "h-5 w-5 top-0.5",
  md: "h-6 w-6 top-0.5",
  lg: "h-7 w-7 top-0.5",
};

// Kayan topun "açık" konumdaki sol boşluğu — track genişliği - top genişliği - 4px kenar payı.
const BALL_LEFT_ON_CLASS: Record<Size, string> = {
  sm: "left-[calc(100%-1.5rem)]",
  md: "left-[calc(100%-1.75rem)]",
  lg: "left-[calc(100%-2.25rem)]",
};

export function getTrackClass(size: Size, color: ColorRole, checked: boolean): string {
  return cn(TRACK_SIZE_CLASS[size], checked ? bgSolidClass[color] : "bg-mari-border");
}

export function getBallClass(size: Size, checked: boolean): string {
  return cn(BALL_SIZE_CLASS[size], checked ? BALL_LEFT_ON_CLASS[size] : "left-1");
}
