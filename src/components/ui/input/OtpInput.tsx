"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type OtpInputProps = Omit<
  InputProps,
  | "onChange"
  | "onPressEnter"
  | "onClear"
  | "allowClear"
  | "icon"
  | "iconPosition"
  | "showCount"
  | "count"
  | "type"
  | "prefix"
  | "suffix"
  | "autoComplete"
  | "visibilityToggle"
  | "visibilityIconRender"
  | "mask"
  | "replacement"
> & {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onInput?: (value: string[]) => void;
  mask?: boolean;
  formatter?: (val: string) => string;
  separator?: React.ReactNode | ((i: number) => React.ReactNode);
};

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  defaultValue = "",
  disabled = false,
  size = "middle",
  shape = "default",
  variant = "outlined",
  status,
  onChange,
  onInput,
  mask = false,
  formatter,
  separator,
  className,
  ...rest
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(
    Array.from({ length }, (_, i) => value?.[i] ?? defaultValue[i] ?? "")
  );

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const handleInput = (i: number, rawValue: string) => {
    const chars = rawValue.replace(/\s/g, "").split("");
    const updated = [...otpValues];

    for (let j = 0; j < chars.length; j++) {
      if (i + j < length) {
        updated[i + j] = chars[j];
      }
    }

    setOtpValues(updated);
    onInput?.(updated);
    if (!updated.includes("")) onChange?.(updated.join(""));

    const nextIndex = Math.min(i + chars.length, length - 1);
    focusInput(nextIndex);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number
  ) => {
    const input = e.currentTarget;
    const cursorAtStart = input.selectionStart === 0;
    const cursorAtEnd = input.selectionStart === input.value.length;

    if (e.key === "Backspace") {
      e.preventDefault();
      const updated = [...otpValues];
      if (otpValues[i]) {
        updated[i] = "";
        setOtpValues(updated);
        onInput?.(updated);
        focusInput(i);
      } else if (i > 0) {
        updated[i - 1] = "";
        setOtpValues(updated);
        onInput?.(updated);
        focusInput(i - 1);
      }
    }

    if (e.key === "ArrowLeft" && cursorAtStart && i > 0) {
      e.preventDefault();
      focusInput(i - 1);
    }

    if (e.key === "ArrowRight" && cursorAtEnd && i < length - 1) {
      e.preventDefault();
      focusInput(i + 1);
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      const split = value.split("").slice(0, length);
      setOtpValues((prev) =>
        Array.from({ length }, (_, i) => split[i] ?? prev[i] ?? "")
      );
    }
  }, [value, length]);

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <React.Fragment key={i}>
          <Input
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={
              formatter
                ? formatter(otpValues[i])
                : mask && otpValues[i]
                ? "•"
                : otpValues[i]
            }
            onInput={(e) =>
              handleInput(i, (e.target as HTMLInputElement).value)
            }
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={(e) => e.currentTarget.select()}
            maxLength={1}
            disabled={disabled}
            size={size}
            shape={shape}
            variant={variant}
            status={status}
            className={twMerge(
              clsx(
                {
                  "w-6 p-0": size === "small",
                  "w-8 p-0": size === "middle",
                  "w-10 p-0": size === "large",
                },
                className
              )
            )}
            classNames={{ input: "w-full text-center" }}
            {...rest}
          />
          {separator && i < length - 1 && (
            <span>
              {typeof separator === "function" ? separator(i) : separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
