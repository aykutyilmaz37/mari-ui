"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { Input } from "./Input";
import type { InputShape, InputVariant } from "./types";

export interface OtpInputProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant | "outlined" | "filled" | "borderless";
  color?: ColorRole;
  /** @deprecated `color` kullanın. */
  status?: "error" | "warning";
  onChange?: (value: string) => void;
  onInput?: (value: string[]) => void;
  mask?: boolean;
  formatter?: (val: string) => string;
  separator?: React.ReactNode | ((i: number) => React.ReactNode);
  className?: string;
}

const WIDTH_CLASS: Record<Size, string> = { sm: "w-6 p-0", md: "w-8 p-0", lg: "w-10 p-0" };

/** İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-conditional`). */
function resolveDisplayValue(rawValue: string, formatter: ((val: string) => string) | undefined, mask: boolean): string {
  if (formatter) return formatter(rawValue);
  if (mask && rawValue) return "•";
  return rawValue;
}

export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  disabled = false,
  size = "md",
  shape = "default",
  variant,
  color,
  status,
  onChange,
  onInput,
  mask = false,
  formatter,
  separator,
  className,
}: OtpInputProps) {
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length }, (_, i) => value?.[i] ?? defaultValue[i] ?? ""));
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
      if (i + j < length) updated[i + j] = chars[j] ?? "";
    }
    setOtpValues(updated);
    onInput?.(updated);
    if (!updated.includes("")) onChange?.(updated.join(""));
    focusInput(Math.min(i + chars.length, length - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
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
      setOtpValues((prev) => Array.from({ length }, (_, i) => split[i] ?? prev[i] ?? ""));
    }
  }, [value, length]);

  // Faz 13 gözden geçirmesi: `ghost` Input'ta ("kenarlıksız, arka planı
  // saydam") bir metin alanının içinde/etrafında bağlam olduğu için anlamlı
  // — ama OTP'de her kutucuk TEK BAŞINA bir hücre, çevresinde hiçbir görsel
  // referans yok. `ghost` seçilince kutucuklar TAMAMEN görünmez oluyordu,
  // kullanıcı nereye yazacağını göremiyordu. OTP için `ghost`, `underlined`e
  // (en azından bir alt çizgi kalır) düşürülür.
  const resolvedVariant = variant === "ghost" ? "underlined" : variant;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length }).map((_, i) => {
        const rawValue = otpValues[i] ?? "";
        const displayValue = resolveDisplayValue(rawValue, formatter, mask);

        return (
          <React.Fragment key={`otp-${i}`}>
            <Input
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={displayValue}
              onInput={(e) => handleInput(i, (e.target as HTMLInputElement).value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={(e) => e.currentTarget.select()}
              maxLength={1}
              disabled={disabled}
              size={size}
              shape={shape}
              variant={resolvedVariant}
              color={color}
              status={status}
              className={cn(WIDTH_CLASS[size], className)}
              classNames={{ input: "w-full text-center" }}
            />
            {separator && i < length - 1 && <span>{typeof separator === "function" ? separator(i) : separator}</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
