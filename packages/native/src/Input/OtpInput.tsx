import React, { useRef, useState, type ComponentRef } from "react";
import { Platform, Pressable, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { useControllableState, type ColorRole, type Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { useFieldControl } from "../lib/fieldContext";
import { Hug } from "../lib/Hug";
import { activeOtpIndex, normalizeOtp } from "./otp";
import type { InputShape, InputVariant } from "./types";

export interface OtpInputProps extends SkeletonableProps {
  /** Hane sayısı. Varsayılan: 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  /** Tüm haneler dolunca, birleşik kodla. */
  onChange?: (value: string) => void;
  /** Her değişiklikte hane dizisi (boş haneler `""`). */
  onInput?: (value: string[]) => void;
  disabled?: boolean;
  size?: Size;
  shape?: InputShape;
  /** `ghost` OTP'de görünmez olacağından `underlined` çizilir. */
  variant?: InputVariant;
  color?: ColorRole;
  status?: "error" | "warning";
  /** Haneleri • ile gizler. */
  mask?: boolean;
  /** Her hane için dönüştürücü (ör. büyük harf). */
  formatter?: (char: string) => string;
  /** Haneler arasına öğe; fonksiyonsa i. haneden sonra. */
  separator?: React.ReactNode | ((index: number) => React.ReactNode);
  /** Varsayılan `numeric` (rakam klavyesi); harfli kodlar için `text`. */
  inputMode?: "numeric" | "text";
  /** `separated` (varsayılan): her hane ayrı kutu. `single`: tek alanda yuvalar. */
  layout?: "separated" | "single";
  /** Yalnız `single`: yuva çizgisi ortada (boşken) ya da altta (her zaman). */
  linePosition?: "center" | "bottom";
  autoFocus?: boolean;
  /** Varsayılan: `"Doğrulama kodu"`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const GAP = 8;

export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onInput,
  disabled: ownDisabled,
  size = "md",
  shape = "default",
  variant = "outline",
  color,
  status: ownStatus,
  mask = false,
  formatter,
  separator,
  inputMode = "numeric",
  layout = "separated",
  linePosition = "center",
  autoFocus,
  accessibilityLabel: ownLabel,
  accessibilityHint: ownHint,
  skeleton: ownSkeleton,
  style,
}: OtpInputProps) {
  const field = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel, accessibilityHint: ownHint, status: ownStatus });
  const theme = useTheme();
  const control = useNativeConfig().sizes[size];
  const [code, setCode] = useControllableState({ value, defaultValue });
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const resolvedColor = field.status ?? color;
  const cellVariant = variant === "ghost" ? "underlined" : variant;
  const single = layout === "single";
  const base = useStyles("input", { color: resolvedColor, variant: cellVariant, size, shape, disabled: field.disabled, focused: false });
  const active = useStyles("input", { color: resolvedColor, variant: cellVariant, size, shape, disabled: field.disabled, focused: true });

  const chars = [...code].slice(0, length);
  const current = activeOtpIndex(chars.length, length);
  const cellWidth = control.height;
  const slotWidth = Math.round(control.fontSize * 1.4);
  const charStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: control.fontSize + 2, fontWeight: "600" as const, fontVariant: ["tabular-nums" as const], color: theme.color.canvas.foreground };

  const handleChange = (text: string) => {
    const next = normalizeOtp(text, length, inputMode === "numeric", formatter);
    const joined = next.join("");
    setCode(joined);
    onInput?.(Array.from({ length }, (_, i) => next[i] ?? ""));
    if (next.length === length) onChange?.(joined);
  };

  const sep = (i: number) => {
    if (i >= length - 1 || separator == null) return null;
    return <React.Fragment key={`sep-${i}`}>{typeof separator === "function" ? separator(i) : separator}</React.Fragment>;
  };

  const glyph = (i: number) => {
    const ch = chars[i];
    if (!ch) return null;
    return <Text style={charStyle}>{mask ? "•" : ch}</Text>;
  };

  if (field.skeleton) {
    if (single) return <SkeletonBox style={[base.container, { alignSelf: "flex-start", width: slotWidth * length + 12 * (length - 1) + 32 }, style]} />;
    return (
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={[{ flexDirection: "row", alignItems: "center", gap: GAP }, style]}>
        {Array.from({ length }, (_, i) => [<SkeletonBox key={i} style={[base.container, { width: cellWidth, minWidth: 32, flexShrink: 1, paddingHorizontal: 0 }]} />, sep(i)])}
      </View>
    );
  }

  const lineColor = (i: number) => (focused && i === current ? active.container.borderColor : theme.color.canvas.input) as string;

  const cells = single ? (
    <View style={[base.container, focused && active.container, { alignSelf: "flex-start", justifyContent: "center", gap: 12, paddingHorizontal: 16 }]}>
      {Array.from({ length }, (_, i) => (
        <React.Fragment key={i}>
          <View style={{ width: slotWidth, height: "100%", alignItems: "center", justifyContent: "center" }}>
            {glyph(i)}
            {linePosition === "center" && !chars[i] ? <View style={{ position: "absolute", width: slotWidth * 0.6, height: 2, borderRadius: 1, backgroundColor: lineColor(i) }} /> : null}
            {linePosition === "bottom" ? <View style={{ position: "absolute", bottom: 8, width: slotWidth, height: 2, borderRadius: 1, backgroundColor: lineColor(i) }} /> : null}
          </View>
          {sep(i)}
        </React.Fragment>
      ))}
    </View>
  ) : (
    <View style={{ flexDirection: "row", alignItems: "center", gap: GAP, maxWidth: "100%" }}>
      {Array.from({ length }, (_, i) => (
        <React.Fragment key={i}>
          <View style={[base.container, focused && i === current && active.container, { width: cellWidth, minWidth: 32, flexShrink: 1, paddingHorizontal: 0, justifyContent: "center" }]}>{glyph(i)}</View>
          {sep(i)}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <Hug style={style}>
    <Pressable onPress={() => inputRef.current?.focus()} disabled={field.disabled} accessible={false} style={{ maxWidth: "100%" }}>
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants">{cells}</View>
      {/* Tek gerçek alan, kutuların üstünde görünmez: dokunma, yapıştırma, SMS otomatik doldurma. */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        maxLength={length}
        editable={!field.disabled}
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden={false}
        keyboardType={inputMode === "numeric" ? "number-pad" : "default"}
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === "web" ? ("one-time-code" as "sms-otp") : "sms-otp"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={field.accessibilityLabel ?? "Doğrulama kodu"}
        accessibilityHint={field.accessibilityHint ?? `${length} haneli`}
        aria-invalid={resolvedColor === "error" || undefined}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.011, color: "transparent", fontSize: 1 }}
      />
    </Pressable>
    </Hug>
  );
}
