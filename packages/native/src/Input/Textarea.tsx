import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Pressable, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useControllableState, type ColorRole, type Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { useFieldControl } from "../lib/fieldContext";
import { ClearButton, CountText } from "./FieldAdornments";
import type { InputCountConfig, InputShape, InputVariant } from "./types";

export interface TextareaAutoSize {
  minRows?: number;
  maxRows?: number;
}

export interface TextareaProps extends SkeletonableProps {
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  /** Başlangıç satır sayısı (sabit yükseklik). Varsayılan: 3. */
  rows?: number;
  /** İçerikle büyür: `true` ya da `{ minRows, maxRows }`; `maxRows` sonrası alan içinde kaydırılır. */
  autoSize?: boolean | TextareaAutoSize;
  disabled?: boolean;
  readOnly?: boolean;
  size?: Size;
  shape?: Exclude<InputShape, "pill">;
  variant?: InputVariant;
  color?: ColorRole;
  status?: "error" | "warning";
  allowClear?: boolean | { clearIcon?: ReactNode };
  clearLabel?: string;
  onClear?: () => void;
  maxLength?: number;
  showCount?: boolean;
  count?: InputCountConfig;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/** Satır yüksekliği: alanın yazı boyutuna göre (web `leading-normal` ≈ 1,375). */
const lineHeightOf = (fontSize: number) => Math.round(fontSize * 1.375);

/**
 * Web `Textarea` ile aynı kutu (Input'un renk/kenar/odak kuralları), çok
 * satırlı. Sayaç ve temizle düğmesi sağ alt / sağ üst köşede, metnin üstüne
 * binmez. `autoSize` içerik yüksekliğini izler.
 */
export function Textarea({
  value,
  defaultValue = "",
  onChangeText,
  placeholder,
  rows = 3,
  autoSize = false,
  disabled: ownDisabled,
  readOnly = false,
  size = "md",
  shape = "default",
  variant = "outline",
  color,
  status: ownStatus,
  allowClear = false,
  clearLabel = "Temizle",
  onClear,
  maxLength,
  showCount = false,
  count,
  autoFocus,
  onFocus,
  onBlur,
  style,
  inputStyle,
  accessibilityLabel: ownLabel,
  accessibilityHint: ownHint,
  skeleton: ownSkeleton,
}: TextareaProps) {
  const { disabled, skeleton, accessibilityLabel, accessibilityHint, status } = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel, accessibilityHint: ownHint, status: ownStatus });
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onChangeText });
  const [focused, setFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const resolvedColor = status ?? color;
  const styles = useStyles("input", { color: resolvedColor, variant, size, shape, disabled, focused });
  const fontSize = useNativeConfig().sizes[size].fontSize;
  const lineHeight = lineHeightOf(fontSize);
  const paddingVertical = 10;

  const auto = autoSize === true ? {} : autoSize || null;
  const minRows = auto ? (auto.minRows ?? 1) : rows;
  const maxRows = auto ? auto.maxRows : rows;
  const minHeight = minRows * lineHeight;
  const maxHeight = maxRows ? maxRows * lineHeight : undefined;
  let textHeight = minHeight;
  if (auto) textHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight ?? Number.POSITIVE_INFINITY);

  const showFooter = showCount || Boolean(count?.formatter);
  // Yükseklik açıkça: Input kutusunun sabit `height`ı `undefined` ile ezilmiyor (react-native-web undefined'ı yok sayar).
  const boxHeight = textHeight + paddingVertical * 2 + (showFooter ? 20 : 0);
  const boxStyle: ViewStyle = { height: boxHeight, alignItems: "flex-start", paddingVertical, flexDirection: "column", gap: 4 };

  if (skeleton) {
    return <SkeletonBox style={[styles.container, boxStyle, style]} />;
  }

  const clearable = Boolean(allowClear);
  const showClear = clearable && current.length > 0 && !disabled && !readOnly;

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={disabled} accessible={false} style={[styles.container, boxStyle, style]}>
      <View style={{ flexDirection: "row", alignSelf: "stretch", gap: 8 }}>
        <TextInput
          ref={inputRef}
          multiline
          value={current}
          onChangeText={setCurrent}
          placeholder={placeholder}
          placeholderTextColor={styles.mutedColor}
          editable={!disabled && !readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
          textAlignVertical="top"
          scrollEnabled={!auto || (maxHeight !== undefined && contentHeight > maxHeight)}
          onContentSizeChange={(e) => setContentHeight(Math.ceil(e.nativeEvent.contentSize.height))}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={[styles.input, { lineHeight, height: textHeight }, inputStyle]}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          aria-invalid={resolvedColor === "error" || undefined}
          aria-disabled={disabled || undefined}
        />
        {clearable ? (
          <ClearButton
            visible={showClear}
            label={clearLabel}
            icon={typeof allowClear === "object" ? allowClear.clearIcon : undefined}
            size={styles.iconSize}
            color={styles.mutedColor}
            onClear={() => {
              setCurrent("");
              onClear?.();
              inputRef.current?.focus();
            }}
          />
        ) : null}
      </View>
      {showFooter ? (
        <View style={{ alignSelf: "stretch", alignItems: "flex-end", height: 16 }}>
          <CountText value={current} maxLength={maxLength} formatter={count?.formatter} style={styles.count} />
        </View>
      ) : null}
    </Pressable>
  );
}
