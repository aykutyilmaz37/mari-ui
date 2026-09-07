import { cn } from "@mari-ui/core";
import type { DrawerPosition, DrawerSize } from "./types";

export function getDimensionClass(size: DrawerSize, isHorizontal: boolean): string {
  return cn(
    size === "sm" && isHorizontal && "w-64",
    size === "md" && isHorizontal && "w-96",
    size === "lg" && isHorizontal && "w-[32rem]",
    size === "sm" && !isHorizontal && "h-64",
    size === "md" && !isHorizontal && "h-96",
    size === "lg" && !isHorizontal && "h-[32rem]"
  );
}

export function getBasePositionClass(position: DrawerPosition): string {
  return cn(
    "fixed bg-mari-surface shadow-lg z-mari-drawer transition-transform duration-300 ease-in-out flex flex-col",
    position === "top" && "top-0 left-0 right-0",
    position === "bottom" && "bottom-0 left-0 right-0",
    position === "left" && "top-0 bottom-0 left-0",
    position === "right" && "top-0 bottom-0 right-0"
  );
}

export function getAnimationClass(open: boolean, position: DrawerPosition): string {
  return cn(
    open && (position === "right" || position === "left") && "translate-x-0",
    !open && position === "right" && "translate-x-full",
    !open && position === "left" && "-translate-x-full",
    open && (position === "top" || position === "bottom") && "translate-y-0",
    !open && position === "bottom" && "translate-y-full",
    !open && position === "top" && "-translate-y-full"
  );
}
