"use client";

import React, { forwardRef, useState } from "react";
import type { InputMask } from "@react-input/mask";
import { skeletonBoxProps } from "../lib/skeleton";
import { touchTargetClass } from "../lib/sizeClasses";
import { cn, useControllableState } from "@mari-ui/core";
import { useFieldControl } from "../lib/fieldContext";
import type { InputProps } from "./types";
import type { useMention } from "./mention/useMention";
import { ClearButton, clearIconOf, PasswordToggle } from "./_components/FieldAdornments";
import {
  FIELD_BASE_CLASS,
  FIELD_DISABLED_CLASS,
  FIELD_MOBILE_TEXT_CLASS,
  getShapeClasses,
  getSizeClasses,
  getVariantClasses,
  clearNativeValue,
  isClearable,
} from "./utils";

/**
 * Input'un isteğe bağlı, ağır özellikleri (bundle performansı Faz 4b): `mask`
 * (@react-input/mask, ~5 KB min+gz) ve `mentions` (öneri paneli, ~3 KB). Public
 * `Input` ikisini de alır; bu özellikleri hiç kullanmayan iç bileşenler
 * (AutoComplete, Slider, Transfer, Table, ColorPicker) `PlainInput`'u kullanır ve
 * o kodu bundle'a almaz. Verilmeyen özellik için prop'lar yok sayılır — bu yüzden
 * `PlainInput`'un tipinde `mask`/`replacement`/`mentions` hiç yoktur.
 */
export interface InputFeatures {
  MaskInput?: typeof InputMask;
  useMention?: typeof useMention;
}

// Bahsetme kapalıyken `useMention`'ın döndürdüğüyle birebir aynı.
const NO_MENTION: ReturnType<typeof useMention> = { controlProps: {}, panel: null, handleKeyDown: () => false, close: () => {} };
const useNoMention: typeof useMention = () => NO_MENTION;

export function createInput(features: InputFeatures) {
  const Input = forwardRef<HTMLInputElement, InputProps>((outerProps, ref) => {
    // Field içindeyse id / aria-describedby / hata / required / disabled oradan tamamlanır.
    return <InputInner {...useFieldControl(outerProps)} forwardedRef={ref} features={features} />;
  });
  Input.displayName = "Input";
  return Input;
}

const InputInner = (
    {
      forwardedRef: ref,
      features: { MaskInput, useMention: useMentionFeature = useNoMention },
      placeholder,
      allowClear = false,
      clearLabel = "Temizle",
      skeleton = false,
      classNames = {},
      className = "",
      style,
      count,
      defaultValue = "",
      disabled = false,
      id,
      maxLength,
      icon,
      iconPosition = "start",
      showCount,
      color,
      size = "md",
      shape = "default",
      type = "text",
      value,
      variant = "outline",
      onChange,
      onPressEnter,
      onClear,
      onFocus,
      onBlur,
      onKeyDown,
      onInput,
      onPaste,
      mask,
      replacement = { _: /\d/ },
      visibilityToggle,
      visibilityIconRender,
      max,
      min,
      mentions,
      ...nativeProps
    }: InputProps & { forwardedRef: React.ForwardedRef<HTMLInputElement>; features: InputFeatures }
  ) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };
    // `color` varsayılansız: verilmezse dinlenmede nötr, odakta primary (bkz. `getVariantClasses`).
    // `error` rengi aynı zamanda gerçek bir doğrulama durumudur — ekran
    // okuyucuya da bildirilsin diye `aria-invalid` otomatik eklenir
    // (tüketici zaten kendi `aria-invalid`'ini verdiyse o kazanır).
    const ariaInvalid = nativeProps["aria-invalid"] ?? (color === "error" || undefined);
    // `onChange` burada hook'a geçirilmiyor — tam ChangeEvent'i tüketiciye
    // iletmek için `handleChange` içinde ayrıca çağrılıyor.
    const [currentValue, setCurrentValue] = useControllableState<string>({ value, defaultValue });
    const [passwordVisible, setPasswordVisible] = useState(false);

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

    // Maskeli alanda bahsetme yok (maske metni yeniden biçimlendirir).
    const mention = useMentionFeature(mask ? undefined : mentions, innerRef, currentValue, "input");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Açık öneri listesinde Enter bir öneri seçer — formu göndermesin / onPressEnter tetiklenmesin.
      const handledByMention = mention.handleKeyDown(e);
      if (e.key === "Enter" && !handledByMention) onPressEnter?.(e);
      onKeyDown?.(e);
    };

    // Temizledikten sonra odak alana döner — kullanıcı hemen yeniden yazabilsin
    // (buton kaybolduğu için odak aksi halde <body>'ye düşüyordu).
    const handleClear = () => {
      // onChange'i gerçek olayla tetikler (handleChange → iç state + tüketici).
      clearNativeValue(innerRef.current);
      onClear?.();
      innerRef.current?.focus();
    };

    // Geometri iskeletle ORTAK (boyut + şekil) — yüklenince kutu zıplamaz.
    const geometryClass = cn("flex w-full items-center gap-2", getSizeClasses(size), getShapeClasses(shape, variant));

    if (skeleton) {
      return <div {...skeletonBoxProps(cn(geometryClass, classNames.wrapper, className))} style={style} />;
    }

    const wrapperClass = cn(
      geometryClass,
      "group relative cursor-text",
      touchTargetClass[size],
      FIELD_BASE_CLASS,
      getVariantClasses(variant, color),
      disabled && FIELD_DISABLED_CLASS,
      classNames.wrapper,
      className
    );
    const adornmentClass = "flex shrink-0 items-center text-mari-muted";

    // Kutunun input DIŞINDAKİ alanına (dolgu, ikon, dokunmatikte genişletilmiş
    // alan) tıklamak da alanı odaklar — eskiden sadece metin satırının kendisi
    // tıklanabilirdi. İç butonlar (temizle, şifre) kendi işini yapar.
    const handleWrapperMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (disabled || innerRef.current?.contains(target) || target.closest("button")) return;
      e.preventDefault();
      innerRef.current?.focus();
    };

    // `w-full min-w-0`: native <input>'un tarayıcı varsayılanı ~20 karakterlik
    // bir içsel genişliktir (≈250px) ve bu, kapsayıcının min-content boyutuna
    // katkı olarak sızıp dar grid kolonlarını (mobil form) taşırıyordu —
    // `min-w-0` tek başına yetmez, yüzdelik genişlik bu katkıyı sıfırlar
    // (Faz 13.6 Steps mobil incelemesinde bulundu).
    const inputClass = cn("w-full min-w-0 flex-grow bg-transparent placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed", FIELD_MOBILE_TEXT_CLASS, classNames.input);

    return (
      <>
      {/* Fare kısayolu; klavye kullanıcısı zaten doğrudan <input>'a sekmeyle gelir. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className={wrapperClass} style={style} onMouseDown={handleWrapperMouseDown}>
        {/* Boşluk wrapper'ın `gap-*`'ından gelir — eskiden ayrıca `mr-2` vardı, ikon ile metin arası 2 katıydı. */}
        {icon && iconPosition === "start" && <span className={cn(adornmentClass, classNames.icon)}>{icon}</span>}

        {mask && MaskInput ? (
          <MaskInput
            ref={setRefs}
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
            onPaste={onPaste}
            className={inputClass}
            {...nativeProps}
            aria-invalid={ariaInvalid}
          />
        ) : (
          <input
            ref={setRefs}
            id={id}
            disabled={disabled}
            type={inputType}
            maxLength={maxLength}
            placeholder={placeholder}
            value={currentValue}
            {...mention.controlProps}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={(e) => {
              mention.close();
              onBlur?.(e);
            }}
            onInput={onInput}
            onPaste={onPaste}
            className={inputClass}
            max={max}
            min={min}
            {...nativeProps}
            aria-invalid={ariaInvalid}
          />
        )}

        {allowClear && <ClearButton visible={showClear} label={clearLabel} icon={clearIconOf(allowClear)} onClear={handleClear} className={classNames.clear} />}

        {(showCount || count?.formatter) && (
          <span className={cn("flex flex-none items-center text-xs tabular-nums text-mari-muted", classNames.count)}>
            {count?.formatter ? count.formatter({ value: currentValue, count: charCount, maxLength }) : countLabel}
          </span>
        )}

        {icon && iconPosition === "end" && <span className={cn(adornmentClass, classNames.icon)}>{icon}</span>}

        {showPasswordToggle && (
          <PasswordToggle visible={passwordVisible} disabled={disabled} onToggle={() => setPasswordVisible((prev) => !prev)} iconRender={visibilityIconRender} />
        )}
      </div>
      {mention.panel}
      </>
    );
  };
