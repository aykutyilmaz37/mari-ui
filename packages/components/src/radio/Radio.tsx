"use client";

import React, { forwardRef, useId, useImperativeHandle, useRef } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { skeletonBoxProps } from "../lib/skeleton";
import { checkableTouchTargetClass, fontSizeClass } from "../lib/sizeClasses";
import type { RadioChangeEvent, RadioProps } from "./types";
import { getDotSizeClasses, getSizeClasses, getVariantClasses, getVariantDotClasses } from "./utils";

export type { RadioProps };

/**
 * Eskiden `isChecked` sadece İLK render'da `defaultChecked ?? checked ?? false`
 * ile kuruluyor, sonra `checked` prop'u değiştiğinde bir `useEffect` ile
 * SENKRONİZE edilmeye çalışılıyordu — ama JSX zaten `checked ?? isChecked`
 * kullandığı için bu effect'in render üzerinde hiçbir etkisi yoktu (ölü
 * senkronizasyon). `useControllableState` bunu tek, doğru bir mekanizmaya indirger.
 */
const DESCRIPTION_INDENT_CLASS = { sm: "pl-5", md: "pl-6", lg: "pl-7" } as const;

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
      size = "md",
      id,
      value,
      name,
      skeleton = false,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked });
    const descriptionId = useId();

    const handleChange = (e: RadioChangeEvent) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    if (skeleton) {
      return (
        <span aria-hidden className={cn("inline-flex items-center gap-2", classNames.wrapper)}>
          <span {...skeletonBoxProps(cn("shrink-0 rounded-full", getSizeClasses(size)))} />
          {label && <span {...skeletonBoxProps(cn("rounded-sm", fontSizeClass[size]))}>{label}</span>}
        </span>
      );
    }

    const baseClasses = cn(
      "relative shrink-0 cursor-pointer appearance-none rounded-full border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
      getSizeClasses(size),
      getVariantClasses(variant, color),
      disabled && "opacity-50 cursor-not-allowed",
      classNames.radio,
      className
    );

    return (
      <label className={cn("inline-flex flex-col gap-1 cursor-pointer", disabled && "cursor-not-allowed", classNames.wrapper)}>
        <span className={cn("relative inline-flex items-center gap-2", checkableTouchTargetClass[size])}>
          <span className="relative inline-flex items-center justify-center">
            <input
              ref={inputRef}
              id={id}
              type="radio"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- pass-through: kütüphane autofocus'u ZORLAMIYOR, tüketicinin verdiği prop'u iletiyor.
              autoFocus={autoFocus}
              checked={isChecked}
              disabled={disabled}
              value={value}
              name={name}
              aria-describedby={description ? descriptionId : undefined}
              onChange={handleChange}
              onBlur={onBlur}
              onFocus={onFocus}
              className={baseClasses}
            />
            {isChecked && (
              // Nokta küçükten büyür (@starting-style) — seçim anlık "belirmez".
              <span
                className={cn(
                  "pointer-events-none absolute rounded-full transition-[scale] duration-150 starting:scale-0 motion-reduce:transition-none",
                  getDotSizeClasses(size),
                  getVariantDotClasses(variant, color)
                )}
              />
            )}
          </span>
          {label && (
            <span className={cn("select-none text-mari-foreground", fontSizeClass[size], disabled && "text-mari-disabled", classNames.label)}>
              {label}
            </span>
          )}
        </span>
        {description && (
          // Etiket hizasında başlar (kutu genişliği + gap): sm 12+8, md 16+8, lg 20+8px.
          <span id={descriptionId} className={cn("text-xs text-mari-muted", DESCRIPTION_INDENT_CLASS[size])}>
            {description}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";
