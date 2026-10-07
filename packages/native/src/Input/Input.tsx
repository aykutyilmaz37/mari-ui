import { cloneElement, isValidElement, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Pressable, TextInput, type TextInputProps } from "react-native";
import { useControllableState } from "@mari-ui/core";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox } from "../lib/Skeleton";
import { useFieldControl } from "../lib/fieldContext";
import { formatMask } from "./mask";
import { ClearButton, CountText, PasswordToggle } from "./FieldAdornments";
import type { InputProps, InputType } from "./types";

export type { InputProps };

/** Web `type` → native klavye / otomatik doldurma ayarları. */
function keyboardFor(type: InputType, masked: boolean): Partial<TextInputProps> {
  switch (type) {
    case "email":
      return { keyboardType: "email-address", autoCapitalize: "none", autoCorrect: false, textContentType: "emailAddress" };
    case "number":
      return { keyboardType: "numeric" };
    case "tel":
      return { keyboardType: "phone-pad", textContentType: "telephoneNumber" };
    case "url":
      return { keyboardType: "url", autoCapitalize: "none", autoCorrect: false };
    case "search":
      // Süzme/arama: iOS otomatik düzeltmesi klavye kapanırken "mugla"yı "Mughal" yapıyor,
      // liste boşalıp dokunulan sonuç kayboluyordu (simülatörde görüldü).
      return { returnKeyType: "search", autoCorrect: false, autoCapitalize: "none", spellCheck: false };
    case "password":
      return { autoCapitalize: "none", autoCorrect: false, textContentType: "password" };
    default:
      return masked ? { keyboardType: "number-pad" } : {};
  }
}

/** Süs ikonu: boyut / renk verilmemişse alan boyutunun ikon ölçüsü ve soluk renk (web adornment `text-mari-muted`). */
function adornment(icon: ReactNode, size: number, color: string): ReactNode {
  if (!isValidElement<{ size?: number; color?: string }>(icon)) return icon;
  return cloneElement(icon, { size: icon.props.size ?? size, color: icon.props.color ?? color });
}

/**
 * Web `Input` ile aynı renk / kenarlık / odak davranışı (ölçümle doğrulandı),
 * boyutlar native ölçekte (theme/nativeSize), ve aynı özellikler:
 * varyant / boyut / şekil, doğrulama rengi (`color` / `status`), ikon,
 * temizle, şifre göster/gizle, karakter sayacı, maske, Enter eylemi, iskelet.
 * Alanın herhangi bir yerine dokununca yazma alanı odaklanır (web: wrapper
 * mousedown); dokunma alanı 44px'e tamamlanır.
 */
export function Input({
  value,
  defaultValue = "",
  onChangeText,
  onPressEnter,
  placeholder,
  type = "text",
  disabled: ownDisabled,
  readOnly = false,
  size = "md",
  shape = "default",
  variant = "outline",
  color,
  status: ownStatus,
  icon,
  iconPosition = "start",
  allowClear = false,
  clearLabel = "Temizle",
  onClear,
  maxLength,
  showCount = false,
  count,
  visibilityToggle = true,
  visibilityIconRender,
  mask,
  replacement,
  secureTextEntry,
  autoFocus,
  autoComplete,
  returnKeyType,
  onFocus,
  onBlur,
  onSubmitEditing,
  style,
  inputStyle,
  testID,
  accessibilityLabel: ownLabel,
  accessibilityHint: ownHint,
  skeleton: ownSkeleton,
}: InputProps) {
  // Field içindeyse etiket, ipucu/hata, devre dışı, hata rengi ve iskelet oradan gelir.
  const { disabled, skeleton, accessibilityLabel, accessibilityHint, status } = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel, accessibilityHint: ownHint, status: ownStatus });
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onChangeText });
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const resolvedColor = status ?? color;
  const styles = useStyles("input", { color: resolvedColor, variant, size, shape, disabled, focused });

  // Aynı kutu: yükseklik, köşe, kenarlık kalınlığı; tam genişlik (alan da öyle).
  if (skeleton) return <SkeletonBox style={[styles.container, style]} />;

  const isPassword = type === "password" || secureTextEntry === true;
  const showToggle = isPassword && visibilityToggle;
  const clearable = Boolean(allowClear);
  const showClear = clearable && current.length > 0 && !disabled && !readOnly;
  const clearIcon = typeof allowClear === "object" ? allowClear.clearIcon : undefined;

  const handleChange = (text: string) => setCurrent(mask ? formatMask(text, mask, replacement) : text);
  const handleClear = () => {
    setCurrent("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      disabled={disabled}
      hitSlop={styles.hitSlop}
      accessible={false}
      style={[styles.container, style]}
      testID={testID}
    >
      {icon && iconPosition === "start" && adornment(icon, styles.iconSize, styles.mutedColor)}
      <TextInput
        ref={inputRef}
        value={current}
        onChangeText={handleChange}
        placeholder={placeholder}
        // Yer tutucu soluk (web `placeholder:text-mari-muted`).
        placeholderTextColor={styles.mutedColor}
        editable={!disabled && !readOnly}
        maxLength={mask ? mask.length : maxLength}
        secureTextEntry={isPassword && !passwordVisible}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        returnKeyType={returnKeyType}
        {...keyboardFor(type, Boolean(mask))}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onSubmitEditing={(e) => {
          onPressEnter?.(current);
          onSubmitEditing?.(e);
        }}
        style={[styles.input, inputStyle]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        // Hata rengi = geçersiz (web: otomatik aria-invalid).
        aria-invalid={resolvedColor === "error" || undefined}
      />
      {clearable && <ClearButton visible={showClear} label={clearLabel} icon={clearIcon} size={styles.iconSize} color={styles.mutedColor} onClear={handleClear} />}
      {(showCount || count?.formatter) && <CountText value={current} maxLength={maxLength} formatter={count?.formatter} style={styles.count} />}
      {icon && iconPosition === "end" && adornment(icon, styles.iconSize, styles.mutedColor)}
      {showToggle && <PasswordToggle visible={passwordVisible} disabled={disabled} size={styles.iconSize} color={styles.mutedColor} onToggle={() => setPasswordVisible((v) => !v)} iconRender={visibilityIconRender} />}
    </Pressable>
  );
}
