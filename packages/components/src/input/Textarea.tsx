"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { XIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import type { InputClassNames, InputShape, InputVariant, InputCountConfig, TextareaAutoSize } from "./types";
import { getShapeClasses, getTextareaSizeClasses, getVariantClasses, isClearable, resolveInputColor, resolveLegacyInputVariant } from "./utils";
import type { ColorRole, Size } from "@mari-ui/core";

export interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear?: () => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  disabled?: boolean;
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant | "outlined" | "filled" | "borderless";
  color?: ColorRole;
  /** @deprecated `color` kullanın. */
  status?: "error" | "warning";
  maxLength?: number;
  showCount?: boolean;
  count?: InputCountConfig;
  id?: string;
  classNames?: InputClassNames;
  className?: string;
  autoSize?: TextareaAutoSize;
}

/**
 * Eskiden `TextareaProps = Omit<InputProps, ...>` ile `Input`tan türetiliyordu
 * ama `onBlur`/`onFocus` Omit listesinde YOKTU — `InputProps.onBlur`'un tipi
 * `FormEvent<HTMLInputElement>` idi ve `{...rest}` ile `<textarea>`'ya
 * yayıldığında (`FocusEventHandler<HTMLTextAreaElement>` beklenen yerde)
 * gerçek bir TS hatasıydı (bkz. plan denetimi). Artık Textarea kendi tam
 * tip setini tanımlıyor, `Input`tan miras almıyor.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      placeholder,
      allowClear = false,
      classNames = {},
      className = "",
      count,
      defaultValue = "",
      disabled = false,
      id,
      maxLength,
      showCount,
      status,
      color,
      size = "md",
      shape = "default",
      variant,
      value,
      onChange,
      onClear,
      onFocus,
      onBlur,
      autoSize = false,
      name,
      required,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-invalid": ariaInvalidProp,
    },
    ref
  ) => {
    const resolvedVariant = resolveLegacyInputVariant(variant);
    const resolvedColor = resolveInputColor(color, status);
    const ariaInvalid = ariaInvalidProp ?? (resolvedColor === "error" || undefined);
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const [currentValue, setCurrentValue] = useControllableState<string>({ value, defaultValue });
    const charCount = currentValue.length;
    // Ayrık değişken — iç içe template literal yerine (Faz 8, SonarJS `no-nested-template-literals`).
    const countLabel = maxLength ? `${charCount} / ${maxLength}` : `${charCount}`;
    const showClear = isClearable(allowClear) && Boolean(currentValue) && !disabled;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setCurrentValue("");
      onClear?.();
    };

    useEffect(() => {
      if (autoSize && innerRef.current) {
        const el = innerRef.current;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [currentValue, autoSize]);

    const wrapperClass = cn(
      "flex gap-2 items-start rounded-md transition-colors duration-300",
      getTextareaSizeClasses(size),
      getVariantClasses(resolvedVariant, resolvedColor),
      getShapeClasses(shape),
      disabled && "opacity-50 pointer-events-none",
      classNames.wrapper,
      className
    );

    return (
      <div className="flex flex-col gap-2">
        <div className={wrapperClass}>
          <textarea
            id={id}
            ref={innerRef}
            value={currentValue}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            name={name}
            required={required}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={ariaInvalid}
            className={cn("w-full resize-none bg-transparent focus:outline-none", classNames.input)}
          />
          {allowClear && (
            <button
              type="button"
              onClick={handleClear}
              className={cn("shrink-0 invisible cursor-pointer", showClear && "visible", classNames.clear)}
            >
              {typeof allowClear === "object" && allowClear.clearIcon ? allowClear.clearIcon : <XIcon size={16} />}
            </button>
          )}
        </div>
        {(showCount || count?.formatter) && (
          <span className={cn("text-mari-muted text-xs flex flex-none items-center justify-end", classNames.count)}>
            {count?.formatter ? count.formatter({ value: currentValue, count: charCount, maxLength }) : countLabel}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
