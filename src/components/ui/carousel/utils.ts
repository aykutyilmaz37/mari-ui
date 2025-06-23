import clsx from "clsx";

export function getDotWrapperClass(dotPosition: string): string {
  return clsx(
    "absolute flex gap-2",
    dotPosition === "top" && "top-2 left-1/2 transform -translate-x-1/2",
    dotPosition === "bottom" && "bottom-2 left-1/2 transform -translate-x-1/2",
    dotPosition === "left" &&
      "left-2 top-1/2 flex-col transform -translate-y-1/2",
    dotPosition === "right" &&
      "right-2 top-1/2 flex-col transform -translate-y-1/2"
  );
}

export function getArrowClass(
  dotPosition: string,
  direction: "prev" | "next"
): string {
  if (dotPosition === "left" || dotPosition === "right") {
    return direction === "prev"
      ? "top-2 left-1/2 -translate-x-1/2 rotate-90"
      : "bottom-2 left-1/2 -translate-x-1/2 rotate-90";
  } else {
    return direction === "prev"
      ? "left-2 top-1/2 -translate-y-1/2"
      : "right-2 top-1/2 -translate-y-1/2";
  }
}
