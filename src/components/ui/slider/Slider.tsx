"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  defaultValue,
  iconList,
  iconPosition,
  RangeSize,
  value,
} from "./types";
import { getSizeClasses } from "./utils";
import { Input } from "../input";
import { Tooltip } from "../tooltip";

export interface SliderProps {
  value?: value;
  defaultValue?: defaultValue;
  size?: RangeSize;
  min?: number;
  max?: number;
  range?: boolean;
  vertical?: boolean;
  disabled?: boolean;
  tooltipVisible?: boolean;
  tooltipAlwaysVisible?: boolean;
  iconList?: iconList;
  iconPosition?: iconPosition;
  showInput?: boolean;
  onChange?: (value: number | [number, number]) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue = 0,
  size = "middle",
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
}) => {
  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    value ?? defaultValue
  );

  const getSize = getSizeClasses(size, vertical);

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "relative w-full",
          vertical && "transform -rotate-90",
          getSize
        )}
      >
        <Tooltip
          content={
            <div className={clsx(vertical && "transform rotate-90")}>
                {internalValue}
            </div>
          }
          disabled={tooltipVisible}
          alwaysVisible={tooltipAlwaysVisible}
          placement={iconPosition === 'top' ? 'bottom' : 'top'}
          variant="default"
          className={"absolute"}
          style={{ left: `${internalValue}%` }}
          trigger={
            <Input
              className={clsx("p-0")}
              type="range"
              variant="borderless"
              min={min}
              max={max}
              disabled={disabled}
              value={String(internalValue)}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setInternalValue(newValue);
                onChange?.(newValue);
              }}
            />
          }
        />
        <div className="relative">
          {iconList.map((item, i) => {
            const positionStyle = {
              left: `${((item.value - min) / (max - min)) * 96}%`,
            };

            return (
              <div
                className={clsx(
                  "absolute transform",
                  iconPosition === "bottom" && "top-0 -translate-x-1/2",
                  iconPosition === "top" && "bottom-6 -translate-x-1/2",
                  internalValue === item.value ? "opacity-100" : "opacity-50"
                )}
                key={i}
                style={positionStyle}
              >
                {item.icon}
              </div>
            );
          })}
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
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setInternalValue(newValue);
            onChange?.(newValue);
          }}
        />
      )}
    </div>
  );
};
