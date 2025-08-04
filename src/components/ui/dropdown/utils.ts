import { Placement } from "./types";

export function getPlacementClass(placement: Placement): string {
  switch (placement) {
    case "bottom":
      return "top-full left-1/2 -translate-x-1/2";
    case "top":
      return "bottom-full left-1/2 -translate-x-1/2";
    case "right":
      return "left-full top-1/2 -translate-y-1/2";
    case "left":
      return "right-full top-1/2 -translate-y-1/2";
    default:
      return "";
  }
}
