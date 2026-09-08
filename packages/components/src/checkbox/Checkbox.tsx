"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CheckIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { textClass, textSolidContrastClass } from "../lib/colorClasses";
import type { CheckboxChangeEvent, CheckboxProps } from "./types";
import { getIndeterminateSizeClasses, getShapeClasses, getSizeClasses, getVariantClasses, resolveCheckboxColor } from "./utils";

export type { CheckboxProps };

/**
 * `useControllableState` ile controlled/uncontrolled ayrımı artık burada
 * elle yazılmıyor (eskiden `useState(defaultChecked ?? checked ?? false)`
 * ile başlatılıp `checked={typeof checked === "boolean" ? checked :
 * isChecked}` şeklinde ayrıca kontrol ediliyordu — iki yerde aynı mantık).
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      autoFocus = false,
      checked,
      defaultChecked = false,
      disabled = false,
      indeterminate = false,
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
      shape = "default",
      id,
    },
    ref
  ) => {
    const resolvedColor = resolveCheckboxColor({ color, status, type });
    const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked });

    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleChange = (e: CheckboxChangeEvent) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const baseClasses = cn(
      "appearance-none border outline-none focus:outline-none",
      getSizeClasses(size),
      getShapeClasses(shape),
      getVariantClasses(variant, resolvedColor),
      disabled && "opacity-50 cursor-not-allowed",
      classNames.checkbox,
      className
    );

    return (
      <label className={cn("inline-flex flex-col gap-1 cursor-pointer", disabled && "cursor-not-allowed", classNames.wrapper)}>
        <span className="inline-flex items-center gap-2 relative">
          <input
            ref={inputRef}
            id={id}
            type="checkbox"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- pass-through: kütüphane autofocus'u ZORLAMIYOR, tüketicinin verdiği prop'u iletiyor.
            autoFocus={autoFocus}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={baseClasses}
          />
          {(indeterminate || isChecked) && (
            <span className={cn("absolute pointer-events-none", getSizeClasses(size), "flex items-center justify-center")}>
              {indeterminate ? (
                <span className={cn("rounded-sm bg-mari-surface", getIndeterminateSizeClasses(size))} />
              ) : (
                <CheckIcon className={textSolidContrastClass[resolvedColor]} size={16} />
              )}
            </span>
          )}
          {label && (
            <span className={cn("select-none text-mari-foreground", disabled && "text-mari-disabled", classNames.label)}>{label}</span>
          )}
        </span>
        {description && <span className={cn("text-xs", textClass[resolvedColor])}>{description}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
