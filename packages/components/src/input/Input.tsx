"use client";

import React, { forwardRef, useState } from "react";
import { InputMask } from "@react-input/mask";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import type { InputProps } from "./types";
import { getShapeClasses, getSizeClasses, getVariantClasses, isClearable, resolveInputColor, resolveLegacyInputVariant } from "./utils";

export type { InputProps };

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      icon,
      iconPosition = "start",
      showCount,
      status,
      color,
      size = "md",
      shape = "default",
      type = "text",
      value,
      variant,
      onChange,
      onPressEnter,
      onClear,
      onFocus,
      onBlur,
      onKeyDown,
      onInput,
      mask,
      replacement = { _: /\d/ },
      visibilityToggle,
      visibilityIconRender,
      max,
      min,
      ...nativeProps
    },
    ref
  ) => {
    const resolvedVariant = resolveLegacyInputVariant(variant);
    const resolvedColor = resolveInputColor(color, status);
    // `error` rengi aynı zamanda gerçek bir doğrulama durumudur — ekran
    // okuyucuya da bildirilsin diye `aria-invalid` otomatik eklenir
    // (tüketici zaten kendi `aria-invalid`'ini verdiyse o kazanır).
    const ariaInvalid = nativeProps["aria-invalid"] ?? (resolvedColor === "error" || undefined);
    // `onChange` burada hook'a geçirilmiyor — tam ChangeEvent'i tüketiciye
    // iletmek için `handleChange` içinde ayrıca çağrılıyor.
    const [currentValue, setCurrentValue] = useControllableState<string>({ value, defaultValue });
    const [passwordVisible, setPasswordVisible] = useState(false);

    const defaultIconRender = (visible: boolean) => (visible ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />);
    const showPasswordToggle = type === "password" && visibilityToggle !== false;

    // İç içe ternary yerine ayrık if — SonarJS'in `no-nested-conditional`
    // kuralı bunu okunurluk için haklı olarak istiyordu (Faz 8).
    let inputType = type;
    if (showPasswordToggle) inputType = passwordVisible ? "text" : "password";
    const charCount = currentValue.length;
    // Ayrık değişken — iç içe template literal yerine (Faz 8, SonarJS `no-nested-template-literals`).
    const countLabel = maxLength ? `${charCount} / ${maxLength}` : `${charCount}`;
    const showClear = isClearable(allowClear) && Boolean(currentValue) && !disabled;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(e.target.value);
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onPressEnter?.(e);
      onKeyDown?.(e);
    };

    const handleClear = () => {
      setCurrentValue("");
      onClear?.();
    };

    const wrapperClass = cn(
      "flex items-center gap-2 rounded-md group transition-colors duration-300",
      getSizeClasses(size),
      getVariantClasses(resolvedVariant, resolvedColor),
      getShapeClasses(shape),
      disabled && "opacity-50 pointer-events-none",
      classNames.wrapper,
      className
    );

    // `w-full min-w-0`: native <input>'un tarayıcı varsayılanı ~20 karakterlik
    // bir içsel genişliktir (≈250px) ve bu, kapsayıcının min-content boyutuna
    // katkı olarak sızıp dar grid kolonlarını (mobil form) taşırıyordu —
    // `min-w-0` tek başına yetmez, yüzdelik genişlik bu katkıyı sıfırlar
    // (Faz 13.6 Steps mobil incelemesinde bulundu).
    const inputClass = cn("w-full min-w-0 flex-grow bg-transparent focus:outline-none", classNames.input);

    return (
      <div className={wrapperClass}>
        {icon && iconPosition === "start" && <span className="mr-2">{icon}</span>}

        {mask ? (
          <InputMask
            ref={ref}
            id={id}
            mask={mask}
            replacement={replacement}
            disabled={disabled}
            type={inputType}
            maxLength={maxLength}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            className={inputClass}
            {...nativeProps}
            aria-invalid={ariaInvalid}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            type={inputType}
            maxLength={maxLength}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            className={inputClass}
            max={max}
            min={min}
            {...nativeProps}
            aria-invalid={ariaInvalid}
          />
        )}

        {allowClear && (
          <button
            type="button"
            onClick={handleClear}
            className={cn("shrink-0 invisible cursor-pointer", showClear && "visible", classNames.clear)}
          >
            {typeof allowClear === "object" && allowClear.clearIcon ? allowClear.clearIcon : <XIcon size={16} />}
          </button>
        )}

        {(showCount || count?.formatter) && (
          <span className={cn("ml-2 text-mari-muted text-xs flex flex-none items-center", classNames.count)}>
            {count?.formatter ? count.formatter({ value: currentValue, count: charCount, maxLength }) : countLabel}
          </span>
        )}

        {icon && iconPosition === "end" && <span className="ml-2">{icon}</span>}

        {showPasswordToggle && (
          <button type="button" onClick={() => setPasswordVisible((prev) => !prev)} className="ml-2 cursor-pointer text-mari-muted">
            {visibilityIconRender ? visibilityIconRender(passwordVisible) : defaultIconRender(passwordVisible)}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
