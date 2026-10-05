import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useControllableState } from "@mari-ui/core";
import { useStyles } from "../styles/useStyles";
import { useTheme } from "../theme/useTheme";
import type { InputProps } from "./types";

export type { InputProps };

/**
 * Controlled/uncontrolled mantığı web'deki `Input`la AYNI paylaşılan hook'tan
 * (`useControllableState`, `@mari-ui/core`) gelir — bu hook Faz 2'de tam da
 * bu ikili kullanım için (Input/Checkbox/Radio/Slider web tarafında, şimdi
 * Input native tarafında) çıkarılmıştı; iki platform arasında BİREBİR aynı
 * state mantığı, ayrı ayrı yazılmış iki versiyon değil.
 */
export function Input({
  value,
  defaultValue = "",
  onChangeText,
  placeholder,
  disabled = false,
  size = "md",
  shape = "default",
  variant = "outline",
  color,
  icon,
  iconPosition = "start",
  allowClear = false,
  maxLength,
  secureTextEntry = false,
  onFocus,
  onBlur,
  onSubmitEditing,
  style,
  inputStyle,
  testID,
  accessibilityLabel,
}: InputProps) {
  const [internalValue, setInternalValue] = useControllableState({ value, defaultValue, onChange: onChangeText });
  const [focused, setFocused] = useState(false);
  const styles = useStyles("input", { color, variant, size, shape, disabled, focused });
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && iconPosition === "start" && <View>{icon}</View>}
      <TextInput
        value={internalValue}
        onChangeText={setInternalValue}
        placeholder={placeholder}
        // Yer tutucu soluk (web'deki `input::placeholder` ile aynı `muted`); eskiden metin rengiydi →
        // boş alan doldurulmuş gibi görünüyordu (Expo'da gerçek render'da fark edildi).
        placeholderTextColor={theme.color.canvas.muted}
        editable={!disabled}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, inputStyle]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      />
      {allowClear && internalValue.length > 0 && !disabled && (
        <Pressable onPress={() => setInternalValue("")} accessibilityRole="button" accessibilityLabel="Temizle" hitSlop={8}>
          <Text style={styles.input}>✕</Text>
        </Pressable>
      )}
      {icon && iconPosition === "end" && <View>{icon}</View>}
    </View>
  );
}
