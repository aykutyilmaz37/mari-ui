import { RangeSize } from "./types";

export const getSizeClasses = (size: RangeSize, vertical?: boolean): string => {
  const sizeMap = {
    large: !vertical ? "w-lg" : "w-sm",
    middle: !vertical ? "w-md" : "w-xs",
    small: !vertical ? "w-sm" : "w-64",
  };
  return sizeMap[size];
};
