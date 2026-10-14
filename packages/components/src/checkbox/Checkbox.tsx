"use client";

import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { CheckIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { bgSolidContrastClass, textSolidContrastClass } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import { checkableTouchTargetClass, fontSizeClass } from "../lib/sizeClasses";
import type { CheckboxChangeEvent, CheckboxProps } from "./types";
import { getCheckIconClass, getIndeterminateSizeClasses, getShapeClasses, getSizeClasses, getVariantClasses } from "./utils";

export type { CheckboxProps };

/*
 * `useControllableState` ile controlled/uncontrolled ayrımı artık burada
 * elle yazılmıyor (eskiden `useState(defaultChecked ?? checked ?? false)`
 * ile başlatılıp `checked={typeof checked === "boolean" ? checked :
 * isChecked}` şeklinde ayrıca kontrol ediliyordu — iki yerde aynı mantık).
 */
const DESCRIPTION_INDENT_CLASS = { sm: "pl-5", md: "pl-6", lg: "pl-7" } as const;

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
      size = "md",
      shape = "default",
      id,
      name,
      value,
      required,
      skeleton = false,
    },
    ref
  ) => {
    // `color` varsayılansız: "renk açıkça verilmedi" ile "primary seçildi"
    // ayrımı dinlenme halindeki kenarlığın nötr mü renkli mi olacağını
    // belirler (Faz 13 — checked OLMAYAN kutucuk mavi görünmemeli).
    // İşaretliyken çentiğin/açıklamanın rengi — renk verilmediyse `primary`.
    const fillColor = color ?? "primary";
    const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked });

    const inputRef = useRef<HTMLInputElement>(null);
    const descriptionId = useId();
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleChange = (e: CheckboxChangeEvent) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    if (skeleton) {
      return (
        <span aria-hidden className={cn("inline-flex items-center gap-2", classNames.wrapper)}>
          <span {...skeletonBoxProps(cn("shrink-0", getSizeClasses(size), getShapeClasses(shape)))} />
          {label && <span {...skeletonBoxProps(cn("rounded-sm", fontSizeClass[size]))}>{label}</span>}
        </span>
      );
    }

    const baseClasses = cn(
      "shrink-0 cursor-pointer appearance-none border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
      getSizeClasses(size),
      getShapeClasses(shape),
      getVariantClasses(variant, color, indeterminate),
      disabled && "opacity-50 cursor-not-allowed",
      classNames.checkbox,
      className
    );

    return (
      <label className={cn("inline-flex flex-col gap-1 cursor-pointer", disabled && "cursor-not-allowed", classNames.wrapper)}>
        <span className={cn("relative inline-flex items-center gap-2", checkableTouchTargetClass[size])}>
          <input
            ref={inputRef}
            id={id}
            type="checkbox"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- pass-through: kütüphane autofocus'u ZORLAMIYOR, tüketicinin verdiği prop'u iletiyor.
            autoFocus={autoFocus}
            checked={isChecked}
            disabled={disabled}
            name={name}
            value={value}
            required={required}
            aria-describedby={description ? descriptionId : undefined}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={baseClasses}
          />
          {(indeterminate || isChecked) && (
            <span className={cn("absolute pointer-events-none", getSizeClasses(size), "flex items-center justify-center")}>
              {indeterminate ? (
                <span className={cn("rounded-full", bgSolidContrastClass[fillColor], getIndeterminateSizeClasses(size))} />
              ) : (
                <CheckIcon className={cn(textSolidContrastClass[fillColor], getCheckIconClass(size))} strokeWidth={3.5} />
              )}
            </span>
          )}
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

Checkbox.displayName = "Checkbox";
