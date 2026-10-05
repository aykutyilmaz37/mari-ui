import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { useTheme } from "../theme/useTheme";
import { CheckIcon, MinusIcon } from "../lib/icons";
import { SelectionRow } from "../lib/SelectionRow";
import { checkboxColors, type SelectionVariant } from "../lib/selectionColors";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import type { SkeletonableProps } from "../lib/Skeleton";

export type CheckboxShape = "default" | "pill" | "square";

export interface CheckboxProps extends SkeletonableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Kısmi seçim (ör. "tümünü seç" alt öğelerin bir kısmı seçiliyken). */
  indeterminate?: boolean;
  disabled?: boolean;
  /** Yeni değer. Web'deki `onChange(event)` yerine doğrudan `boolean`. */
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  /** Etiketin altında soluk açıklama. */
  description?: React.ReactNode;
  /** Kutu sm 18 · md 22 · lg 26. Varsayılan: `md`. */
  size?: Size;
  shape?: CheckboxShape;
  /** Varsayılan: `outline`. */
  variant?: SelectionVariant;
  /** Varsayılan: `primary`. `error`/`warning` dinlenirken de renkli kenar → doğrulama durumu. */
  color?: ColorRole;
  /** Etiket yoksa erişilebilir ad. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({ checked, defaultChecked = false, indeterminate = false, disabled: ownDisabled, onChange, label, description, size = "md", shape = "default", variant = "outline", color, skeleton: ownSkeleton, accessibilityLabel, style }: CheckboxProps) {
  const { disabled, skeleton } = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton });
  const theme = useTheme();
  const m = useNativeConfig().selection[size];
  const [value, setValue] = useControllable(checked, defaultChecked);
  const on = value || indeterminate;
  const colors = checkboxColors(theme, variant, color, on);
  const radius = { default: m.radius, pill: m.box / 2, square: 0 }[shape];
  const icon = Math.round(m.box * 0.7);
  let mark: React.ReactNode = null;
  if (indeterminate) mark = <MinusIcon size={icon} color={colors.mark} />;
  else if (value) mark = <CheckIcon size={icon} color={colors.mark} />;

  const box = (
    <View style={{ width: m.box, height: m.box, borderRadius: radius, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 }}>
      {mark}
    </View>
  );

  return (
    <SelectionRow
      role="checkbox"
      state={{ checked: indeterminate ? "mixed" : value }}
      onPress={() => {
        const next = indeterminate ? true : !value;
        setValue(next);
        onChange?.(next);
      }}
      disabled={disabled}
      size={size}
      control={box}
      label={label}
      description={description}
      skeleton={skeleton}
      accessibilityLabel={accessibilityLabel}
      style={style}
    />
  );
}
