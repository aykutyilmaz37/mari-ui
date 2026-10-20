import React, { createContext, useContext } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { useTheme } from "../theme/useTheme";
import { SelectionRow } from "../lib/SelectionRow";
import { radioColors, type SelectionVariant } from "../lib/selectionColors";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import type { SkeletonableProps } from "../lib/Skeleton";

export type RadioValue = string | number;

export interface RadioOption {
  label: React.ReactNode;
  value: RadioValue;
  disabled?: boolean;
  /** Etiketin altında soluk açıklama (ör. kargo seçeneğinin süresi). */
  description?: React.ReactNode;
}

export interface RadioProps extends SkeletonableProps {
  /** Grup içinde bu seçeneğin değeri. */
  value?: RadioValue;
  /** Grup dışında tek başına kullanımda. */
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Tek başına kullanımda seçildi. Grup içinde `RadioGroup.onChange` kullanın. */
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Daire sm 18 · md 22 · lg 26. Varsayılan: `md` (grup verirse grubunki). */
  size?: Size;
  variant?: SelectionVariant;
  color?: ColorRole;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export interface RadioGroupProps extends SkeletonableProps {
  value?: RadioValue;
  defaultValue?: RadioValue;
  onChange?: (value: RadioValue) => void;
  /** Dize/sayı ya da `{ label, value, description, disabled }`. Verilmezse `children` (Radio'lar). */
  options?: (RadioValue | RadioOption)[];
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: SelectionVariant;
  color?: ColorRole;
  size?: Size;
  /** Varsayılan: `vertical` (native'de seçenekler alt alta okunur; web varsayılanı `horizontal`). */
  orientation?: "horizontal" | "vertical";
  /** Grubun erişilebilir adı (görünür başlığı tekrarlayın). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

interface GroupContextValue {
  value: RadioValue | undefined;
  select: (value: RadioValue) => void;
  disabled: boolean;
  variant?: SelectionVariant;
  color?: ColorRole;
  size?: Size;
  skeleton: boolean;
}

const GroupContext = /* @__PURE__ */ createContext<GroupContextValue | null>(null);

export function Radio({ value, checked, defaultChecked = false, disabled = false, onChange, label, description, size, variant, color, skeleton, accessibilityLabel, style }: Readonly<RadioProps>) {
  const theme = useTheme();
  const group = useContext(GroupContext);
  const resolvedSize = size ?? group?.size ?? "md";
  const m = useNativeConfig().selection[resolvedSize];
  const [own, setOwn] = useControllable(checked, defaultChecked);
  const on = group ? group.value !== undefined && group.value === value : own;
  const isDisabled = disabled || Boolean(group?.disabled);
  const colors = radioColors(theme, variant ?? group?.variant ?? "outline", color ?? group?.color, on);
  const dot = Math.round(m.box * 0.45);

  const circle = (
    <View style={{ width: m.box, height: m.box, borderRadius: m.box / 2, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", opacity: isDisabled ? 0.5 : 1 }}>
      <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: colors.mark }} />
    </View>
  );

  return (
    <SelectionRow
      role="radio"
      state={{ checked: on }}
      onPress={() => {
        if (group) {
          if (value !== undefined) group.select(value);
          return;
        }
        if (own) return; // Radio seçimi geri alınmaz.
        setOwn(true);
        onChange?.(true);
      }}
      disabled={isDisabled}
      size={resolvedSize}
      control={circle}
      label={label}
      description={description}
      skeleton={skeleton ?? group?.skeleton}
      accessibilityLabel={accessibilityLabel}
      style={style}
    />
  );
}

const toOption = (option: RadioValue | RadioOption): RadioOption => (typeof option === "object" ? option : { label: String(option), value: option });

export function RadioGroup({ value, defaultValue, onChange, options, children, disabled: ownDisabled, variant, color, size, orientation = "vertical", skeleton: ownSkeleton, accessibilityLabel: ownLabel, style }: Readonly<RadioGroupProps>) {
  const { disabled, skeleton, accessibilityLabel } = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel });
  const [selected, setSelected] = useControllable<RadioValue | undefined>(value, defaultValue);
  const select = (next: RadioValue) => {
    if (next === selected) return;
    setSelected(next);
    onChange?.(next);
  };
  const horizontal = orientation === "horizontal";

  return (
    <GroupContext.Provider value={{ value: selected, select, disabled, variant, color, size, skeleton }}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        style={[{ flexDirection: horizontal ? "row" : "column", flexWrap: horizontal ? "wrap" : "nowrap", columnGap: 24 }, style]}
      >
        {options ? options.map(toOption).map((option) => <Radio key={String(option.value)} value={option.value} label={option.label} description={option.description} disabled={option.disabled} />) : children}
      </View>
    </GroupContext.Provider>
  );
}
