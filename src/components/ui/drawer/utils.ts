import clsx from "clsx";
import { DrawerPosition, DrawerSize } from "./types";

export const getDimensionClass = (size: DrawerSize, isHorizontal: boolean) =>
  clsx({
    "w-64": size === "sm" && isHorizontal,
    "w-96": size === "md" && isHorizontal,
    "w-[32rem]": size === "lg" && isHorizontal,
    "h-64": size === "sm" && !isHorizontal,
    "h-96": size === "md" && !isHorizontal,
    "h-[32rem]": size === "lg" && !isHorizontal,
  });

export const getBasePositionClass = (position: DrawerPosition) =>
  clsx(
    "fixed bg-white dark:bg-gray-800 shadow-lg z-50 transition-transform duration-300 ease-in-out flex flex-col",
    {
      "top-0 left-0 right-0": position === "top",
      "bottom-0 left-0 right-0": position === "bottom",
      "top-0 bottom-0 left-0": position === "left",
      "top-0 bottom-0 right-0": position === "right",
    }
  );

export const getAnimationClass = (open: boolean, position: DrawerPosition) =>
  clsx({
    "translate-x-0": open && (position === "right" || position === "left"),
    "translate-x-full": !open && position === "right",
    "-translate-x-full": !open && position === "left",
    "translate-y-0": open && (position === "top" || position === "bottom"),
    "translate-y-full": !open && position === "bottom",
    "-translate-y-full": !open && position === "top",
  });
