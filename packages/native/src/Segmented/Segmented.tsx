import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View, type LayoutRectangle, type StyleProp, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { shadowStyle } from "../theme/effects";
import { useMotionScale, useTheme } from "../theme/useTheme";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { Hug } from "../lib/Hug";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";

export type SegmentedValue = string | number;

export interface SegmentedOption {
  value: SegmentedValue;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Yalnız ikonlu seçenekte zorunlu erişilebilir ad. */
  accessibilityLabel?: string;
}

export interface SegmentedProps extends SkeletonableProps {
  options: (SegmentedValue | SegmentedOption)[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  /** Tam genişlik, eşit bölmeler. */
  block?: boolean;
  /** sm 28 · md 32 (iOS) · lg 40. Varsayılan: `md`. */
  size?: Size;
  disabled?: boolean;
  /** Grubun erişilebilir adı. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const PAD = 2;
const MIN_TOUCH = 44;

const toOption = (option: SegmentedValue | SegmentedOption): SegmentedOption => (typeof option === "object" ? option : { value: option, label: String(option) });

/** Seçili bölmenin altında kayan yüzey (iOS UISegmentedControl). */
function useThumb(layout: LayoutRectangle | undefined) {
  const motion = useMotionScale();
  const x = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const reduce = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduce.current = v)).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!layout) return;
    // İlk yerleşim ve hareket azaltma: anlık; sonra kayarak.
    if (!placed.current || reduce.current) {
      x.setValue(layout.x);
      width.setValue(layout.width);
      placed.current = true;
      return;
    }
    const timing = (v: Animated.Value, to: number) => Animated.timing(v, { toValue: to, duration: Math.round(220 * motion), easing: Easing.out(Easing.cubic), useNativeDriver: false });
    Animated.parallel([timing(x, layout.x), timing(width, layout.width)]).start();
  }, [layout, x, width, motion]);
  return { x, width };
}

export function Segmented({ options, value, defaultValue, onChange, block = false, size = "md", disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel, style }: SegmentedProps) {
  const field = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel });
  const theme = useTheme();
  const m = useNativeConfig().segmented[size];
  const items = options.map(toOption);
  const [selected, setSelected] = useControllable<SegmentedValue | undefined>(value, defaultValue ?? items[0]?.value);
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const thumb = useThumb(selected === undefined ? undefined : layouts[String(selected)]);
  const c = theme.color.canvas;
  const inner = m.height - PAD * 2;
  const slop = Math.max(0, (MIN_TOUCH - m.height) / 2);
  const font = nativeFontFamily(theme.fontFamily.sans);

  const track: ViewStyle = { flexDirection: "row", padding: PAD, borderRadius: m.radius, backgroundColor: c.surfaceAlt, alignSelf: block ? "stretch" : "flex-start", opacity: field.disabled ? 0.5 : 1 };

  const labelOf = (item: SegmentedOption, on: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {item.icon}
      {item.label != null ? <Text numberOfLines={1} style={{ fontFamily: font, fontSize: m.fontSize, fontWeight: on ? "600" : "500", color: on ? c.foreground : c.muted }}>{item.label}</Text> : null}
    </View>
  );
  const segmentStyle = (flex: boolean): ViewStyle => ({ height: inner, paddingHorizontal: m.paddingHorizontal, alignItems: "center", justifyContent: "center", ...(flex ? { flex: 1 } : null) });

  if (field.skeleton) {
    const placeholder = (
      <SkeletonBox style={[track, { opacity: 1 }]}>
        <View style={{ flexDirection: "row" }}>{items.map((item) => <View key={String(item.value)} style={segmentStyle(block)}>{labelOf(item, item.value === selected)}</View>)}</View>
      </SkeletonBox>
    );
    return block ? <View style={style}>{placeholder}</View> : <Hug style={style}>{placeholder}</Hug>;
  }

  const control = (
    <View accessibilityRole="radiogroup" accessibilityLabel={field.accessibilityLabel} style={track}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: PAD,
          height: inner,
          left: thumb.x,
          width: thumb.width,
          borderRadius: m.radius - PAD,
          backgroundColor: c.surface,
          opacity: selected !== undefined && layouts[String(selected)] ? 1 : 0,
          ...shadowStyle(theme, { opacity: 0.1, radius: 3, offsetY: 1, elevation: 1 }),
        }}
      />
      {items.map((item) => {
        const on = item.value === selected;
        const isDisabled = field.disabled || Boolean(item.disabled);
        return (
          <Pressable
            key={String(item.value)}
            accessibilityRole="radio"
            accessibilityLabel={item.accessibilityLabel}
            accessibilityState={{ checked: on, disabled: isDisabled }}
            aria-checked={on}
            aria-disabled={isDisabled || undefined}
            disabled={isDisabled}
            hitSlop={{ top: slop, bottom: slop }}
            onLayout={(e) => {
              const rect = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [String(item.value)]: rect }));
            }}
            onPress={() => {
              if (on) return;
              setSelected(item.value);
              onChange?.(item.value);
            }}
            style={({ pressed }) => [segmentStyle(block), { opacity: (item.disabled ? 0.4 : 1) * (pressed && !on ? 0.6 : 1) }]}
          >
            {labelOf(item, on)}
          </Pressable>
        );
      })}
    </View>
  );
  return block ? <View style={style}>{control}</View> : <Hug style={style}>{control}</Hug>;
}
