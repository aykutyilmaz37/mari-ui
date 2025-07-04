import React from "react";

export function getIsHalf(
  e: React.MouseEvent<HTMLSpanElement>,
  allowHalf: boolean
): boolean {
  const { left, width } = e.currentTarget.getBoundingClientRect();
  return allowHalf && e.clientX - left < width / 2;
}

export function handleClick(
  e: React.MouseEvent<HTMLSpanElement>,
  index: number,
  allowHalf: boolean,
  allowClear: boolean,
  displayValue: number,
  isControlled: boolean,
  setInternalValue: (v: number) => void,
  onChange?: (v: number) => void
) {
  const isHalf = getIsHalf(e, allowHalf);
  let newValue = isHalf ? index + 0.5 : index + 1;
  if (allowClear && displayValue === newValue) newValue = 0;
  if (!isControlled) setInternalValue(newValue);
  onChange?.(newValue);
}

export function handleMouseEnter(
  e: React.MouseEvent<HTMLSpanElement>,
  index: number,
  allowHalf: boolean,
  setHoverValue: (v: number) => void,
  onHoverChange?: (v: number) => void
) {
  const isHalf = getIsHalf(e, allowHalf);
  const val = isHalf ? index + 0.5 : index + 1;
  setHoverValue(val);
  onHoverChange?.(val);
}

export function handleMouseLeave(
  setHoverValue: (v: number | undefined) => void,
  onHoverChange?: (v: number) => void
) {
  setHoverValue(undefined);
  onHoverChange?.(0);
}
