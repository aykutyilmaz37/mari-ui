import React, { useEffect, useRef, useState, type ComponentRef } from "react";
import { Platform, Pressable, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useTheme } from "../theme/useTheme";
import { useStyles } from "../styles/useStyles";
import type { InputShape, InputVariant } from "../Input/types";
import { MinusIcon, PlusIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { clamp, formatForEditing, formatNumber, isAllowedInput, numberKeyboard, parseNumber, roundTo, stepValue } from "./numberUtils";

export interface InputNumberProps extends SkeletonableProps {
  /** Değer; boş alan `null`. */
  value?: number | null;
  defaultValue?: number | null;
  /**
   * Her geçerli değişiklikte (yazarken, adımda, temizlenince `null`). Yazarken
   * min/max dışına çıkan değer de bildirilir; alandan çıkınca sınıra çekilip
   * yeniden bildirilir.
   */
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Artır/azalt adımı. Varsayılan: `1`. */
  step?: number;
  /** Sabit ondalık basamak (ör. para için 2). Verilmezse yazılan kadar. */
  precision?: number;
  /** Binlik ayıracı (1.234.567). Varsayılan: `true`. */
  grouping?: boolean;
  /** Biçimlendirme yereli. Varsayılan: `"tr-TR"` (virgül ondalık, nokta binlik). */
  locale?: string;
  /** Solda sabit metin/ikon, ör. `"₺"`. */
  prefix?: React.ReactNode;
  /** Sağda sabit metin/ikon, ör. `"%"`, `"kg"`. */
  suffix?: React.ReactNode;
  /** −/+ düğmeleri (iki yanda; basılı tutunca tekrarlar). Varsayılan: `true`. */
  controls?: boolean;
  /** Düğmelerin erişilebilir adları. Varsayılan: "Azalt" / "Artır". */
  incrementLabel?: string;
  decrementLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Alan Input ölçeğinde (md 44). */
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Klavyenin "bitti" tuşu (değer sınıra çekildikten sonra). */
  onPressEnter?: (value: number | null) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const REPEAT_DELAY_MS = 400;
const REPEAT_EVERY_MS = 80;

/** Basılı tutunca tekrar: önce kısa bekleme, sonra sık aralık. Bırakınca / sökülünce durur. */
function useRepeat() {
  const timers = useRef<{ delay?: ReturnType<typeof setTimeout>; every?: ReturnType<typeof setInterval> }>({});
  const stop = () => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.every);
    timers.current = {};
  };
  useEffect(() => stop, []);
  const start = (fn: () => void) => {
    stop();
    timers.current.delay = setTimeout(() => {
      timers.current.every = setInterval(fn, REPEAT_EVERY_MS);
    }, REPEAT_DELAY_MS);
  };
  return { start, stop };
}

function Adornment({ node, color, fontSize }: Readonly<{ node: React.ReactNode; color: string; fontSize: number | undefined }>) {
  if (node == null) return null;
  if (typeof node === "string" || typeof node === "number") return <Text style={{ color, fontSize }}>{node}</Text>;
  return <View>{node}</View>;
}

interface StepButtonProps {
  kind: "dec" | "inc";
  label: string;
  disabled: boolean;
  size: number;
  iconSize: number;
  color: string;
  pressedBg: string;
  /** Kutunun köşe yarıçapı — basılı zemin dış köşelerde kutudan taşmasın. */
  radius: number;
  onStep: () => void;
  repeat: ReturnType<typeof useRepeat>;
}

function StepButton({ kind, label, disabled, size, iconSize, color, pressedBg, radius, onStep, repeat }: Readonly<StepButtonProps>) {
  const Icon = kind === "inc" ? PlusIcon : MinusIcon;
  // Kapsayıcıda overflow:hidden KULLANILMAZ — iOS'ta kırpılan kutudaki TextInput dokunuşla odak almıyordu (simülatörde ölçüldü).
  const corners = kind === "dec" ? { borderTopLeftRadius: radius, borderBottomLeftRadius: radius } : { borderTopRightRadius: radius, borderBottomRightRadius: radius };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onStep}
      onLongPress={() => repeat.start(onStep)}
      onPressOut={repeat.stop}
      delayLongPress={REPEAT_DELAY_MS}
      style={({ pressed }) => ({ width: size, alignSelf: "stretch", alignItems: "center", justifyContent: "center", ...corners, opacity: disabled ? 0.35 : 1, backgroundColor: pressed ? pressedBg : "transparent" })}
    >
      <Icon size={iconSize} color={color} strokeWidth={2.25} />
    </Pressable>
  );
}

/** Düğme kutusu = alan yüksekliği; dış köşe = alanın köşe yarıçapı. */
function boxMetrics(container: ViewStyle) {
  return {
    buttonSize: typeof container.height === "number" ? container.height : 44,
    radius: typeof container.borderRadius === "number" ? container.borderRadius : 0,
  };
}

/**
 * Sayı alanı: Türkçe biçim (1.234,56), min/max, adım, sabit ondalık, ön/son
 * ek. −/+ iki yanda (sepetteki adet gibi), basılı tutunca tekrarlar; VoiceOver /
 * TalkBack'te yukarı/aşağı kaydırma artırır/azaltır. Uygun sayı klavyesi kendiliğinden.
 */
export function InputNumber({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  precision,
  grouping = true,
  locale = "tr-TR",
  prefix,
  suffix,
  controls = true,
  incrementLabel = "Artır",
  decrementLabel = "Azalt",
  placeholder,
  disabled: ownDisabled,
  readOnly = false,
  size = "md",
  variant = "outline",
  shape = "default",
  color,
  onFocus,
  onBlur,
  onPressEnter,
  accessibilityLabel: ownLabel,
  accessibilityHint: ownHint,
  skeleton: ownSkeleton,
  style,
}: Readonly<InputNumberProps>) {
  const field = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel, accessibilityHint: ownHint });
  const theme = useTheme();
  const [current, setCurrent] = useControllable<number | null>(value, defaultValue);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const repeat = useRepeat();
  // Basılı tutarken her tekrar güncel değerden adım atsın (kapanıştaki eski değerden değil).
  const live = useRef(current);
  live.current = current;
  const styles = useStyles("input", { color: field.status ?? color, variant, size, shape, disabled: field.disabled, focused });
  const config = { locale, precision, grouping };

  if (field.skeleton) return <SkeletonBox style={[styles.container, style]} />;

  const commit = (next: number | null) => {
    live.current = next;
    setCurrent(next);
    onChange?.(next);
  };
  const settle = (next: number | null) => (next === null ? null : clamp(roundTo(next, precision), min, max));
  const stepBy = (direction: 1 | -1) => {
    const next = stepValue(live.current, direction, step, min, max, precision);
    if (next !== live.current) commit(next);
    if (focused) setDraft(formatForEditing(next, config));
  };

  const editable = !field.disabled && !readOnly;
  const atMin = current !== null && min !== undefined && current <= min;
  const atMax = current !== null && max !== undefined && current >= max;
  const { buttonSize, radius } = boxMetrics(styles.container);
  const pressedBg = theme.color.canvas.surfaceAlt;
  const fontSize = styles.input.fontSize;
  const text = focused ? draft : formatNumber(current, config);
  const centered = controls && prefix == null && suffix == null;

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={field.disabled} hitSlop={styles.hitSlop} accessible={false} style={[styles.container, controls ? { paddingHorizontal: 0, gap: 0 } : null, style]}>
      {controls ? <StepButton kind="dec" label={decrementLabel} disabled={!editable || atMin} size={buttonSize} iconSize={styles.iconSize} color={theme.color.canvas.foreground} pressedBg={pressedBg} radius={radius} onStep={() => stepBy(-1)} repeat={repeat} /> : null}
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: controls ? 4 : 0 }}>
        <Adornment node={prefix} color={styles.mutedColor} fontSize={fontSize} />
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={(t) => {
            if (!isAllowedInput(t, locale)) return;
            setDraft(t);
            const parsed = parseNumber(t, locale);
            if (parsed !== undefined) commit(parsed);
          }}
          placeholder={placeholder}
          placeholderTextColor={styles.mutedColor}
          editable={editable}
          keyboardType={numberKeyboard(min, precision, step, Platform.OS === "ios")}
          returnKeyType="done"
          onFocus={() => {
            setDraft(formatForEditing(current, config));
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            const settled = settle(current);
            if (settled !== current) commit(settled);
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={() => onPressEnter?.(settle(current))}
          // Ekler yokken (adet seçici) değer ortada; eklerle (₺ 1.250) sola yaslı — ek değere bitişik dursun.
          style={[styles.input, { fontVariant: ["tabular-nums"], textAlign: centered ? "center" : "left" }]}
          accessibilityLabel={field.accessibilityLabel}
          accessibilityHint={field.accessibilityHint}
          accessibilityState={{ disabled: field.disabled }}
          // VoiceOver / TalkBack: yukarı/aşağı kaydırma artırır/azaltır.
          accessibilityActions={editable ? [{ name: "increment" }, { name: "decrement" }] : undefined}
          onAccessibilityAction={(e) => stepBy(e.nativeEvent.actionName === "increment" ? 1 : -1)}
          accessibilityValue={{ text: text || undefined, ...(min === undefined ? null : { min }), ...(max === undefined ? null : { max }) }}
          aria-invalid={(field.status ?? color) === "error" || undefined}
        />
        <Adornment node={suffix} color={styles.mutedColor} fontSize={fontSize} />
      </View>
      {controls ? <StepButton kind="inc" label={incrementLabel} disabled={!editable || atMax} size={buttonSize} iconSize={styles.iconSize} color={theme.color.canvas.foreground} pressedBg={pressedBg} radius={radius} onStep={() => stepBy(1)} repeat={repeat} /> : null}
    </Pressable>
  );
}
