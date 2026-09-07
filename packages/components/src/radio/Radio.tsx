"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import type { RadioChangeEvent, RadioProps } from "./types";
import { getDotSizeClasses, getSizeClasses, getVariantClasses, getVariantDotClasses, resolveRadioColor } from "./utils";

export type { RadioProps };

/**
 * Eskiden `isChecked` sadece İLK render'da `defaultChecked ?? checked ?? false`
 * ile kuruluyor, sonra `checked` prop'u değiştiğinde bir `useEffect` ile
 * SENKRONİZE edilmeye çalışılıyordu — ama JSX zaten `checked ?? isChecked`
 * kullandığı için bu effect'in render üzerinde hiçbir etkisi yoktu (ölü
 * senkronizasyon). `useControllableState` bunu tek, doğru bir mekanizmaya indirger.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      autoFocus = false,
      checked,
      defaultChecked = false,
      disabled = false,
      onChange,
      onBlur,
      onFocus,
      className,
      classNames = {},
      label,
      description,
      variant = "outline",
      color,
      status,
      type,
      size = "md",
      id,
      value,
      name,
    },
    ref
  ) => {
    const resolvedColor = resolveRadioColor({ color, status, type });
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked });

    const handleChange = (e: RadioChangeEvent) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    const baseClasses = cn(
      "relative appearance-none border outline-none rounded-full",
      getSizeClasses(size),
      getVariantClasses(variant, resolvedColor),
      disabled && "opacity-50",
      classNames.radio,
      className
    );

    return (
      <label className={cn("inline-flex flex-col gap-1 cursor-pointer", disabled && "cursor-not-allowed", classNames.wrapper)}>
        <span className="inline-flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center">
            <input
              ref={inputRef}
              id={id}
              type="radio"
              autoFocus={autoFocus}
              checked={isChecked}
              disabled={disabled}
              value={value}
              name={name}
              onChange={handleChange}
              onBlur={onBlur}
              onFocus={onFocus}
              className={baseClasses}
            />
            {isChecked && (
              <span className={cn("absolute rounded-full pointer-events-none", getDotSizeClasses(size), getVariantDotClasses(variant, resolvedColor))} />
            )}
          </span>
          {label && (
            <span className={cn("select-none text-mari-foreground", disabled && "text-mari-disabled", classNames.label)}>{label}</span>
          )}
        </span>
        {description && <span className="text-xs text-mari-muted">{description}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
