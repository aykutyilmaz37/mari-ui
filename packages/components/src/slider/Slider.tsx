"use client";

import React from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { Input } from "../input";
import { Tooltip } from "../tooltip";
import type { SliderProps, SliderValue } from "./types";
import { getSizeClasses } from "./utils";

export type { SliderProps };

/**
 * Eskiden `types.ts` tamamen boştu, `index.ts` da boştu — bu component
 * `@mari-ui/components/slider`den import EDİLEMİYORDU (bkz. plan denetimi).
 * Ayrıca `Tooltip`e `disabled={tooltipVisible}` geçiriliyordu: `tooltipVisible`
 * true iken tooltip'i GİZLEMEK gibi TERS bir mantıktı (isimle davranış
 * uyuşmuyordu). `tooltipVisible === false` olarak düzeltildi.
 */
export function Slider({
  value,
  defaultValue = 0,
  size = "md",
  min = 0,
  max = 100,
  vertical = false,
  disabled = false,
  tooltipVisible,
  tooltipAlwaysVisible,
  iconList = [],
  iconPosition = "bottom",
  showInput = false,
  onChange,
}: SliderProps) {
  const [internalValue, setInternalValue] = useControllableState<SliderValue>({ value, defaultValue, onChange });

  const sizeClass = getSizeClasses(size, vertical);

  return (
    <div className="flex items-center gap-2">
      <div className={cn("relative w-full", vertical && "transform -rotate-90", sizeClass)}>
        <Tooltip
          content={<div className={cn(vertical && "transform rotate-90")}>{internalValue}</div>}
          disabled={tooltipVisible === false}
          alwaysVisible={tooltipAlwaysVisible}
          placement={iconPosition === "top" ? "bottom" : "top"}
          color="neutral"
          className="absolute"
          style={{ left: `${internalValue}%` }}
          trigger={
            <Input
              className="p-0"
              type="range"
              variant="ghost"
              min={min}
              max={max}
              disabled={disabled}
              value={String(internalValue)}
              onChange={(e) => setInternalValue(Number(e.target.value))}
            />
          }
        />
        <div className="relative">
          {iconList.map((item, i) => (
            <div
              key={i}
              className={cn(
                "absolute transform",
                iconPosition === "bottom" && "top-0 -translate-x-1/2",
                iconPosition === "top" && "bottom-6 -translate-x-1/2",
                internalValue === item.value ? "opacity-100" : "opacity-50"
              )}
              style={{ left: `${((item.value - min) / (max - min)) * 96}%` }}
            >
              {item.icon}
            </div>
          ))}
        </div>
      </div>
      {showInput && (
        <Input
          type="number"
          className="border rounded p-1 text-sm w-14"
          value={String(internalValue)}
          disabled={disabled}
          min={min}
          max={max}
          onChange={(e) => setInternalValue(Number(e.target.value))}
        />
      )}
    </div>
  );
}
