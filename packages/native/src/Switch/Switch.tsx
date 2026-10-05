import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig, type NativeSwitchSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { switchTrackColor } from "../lib/selectionColors";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { Hug } from "../lib/Hug";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";

export interface SwitchProps extends SkeletonableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  /** Anahtarın solunda etiket; tüm satır dokunulabilir (iOS ayar satırı). */
  label?: string;
  /** İzin içinde açıkken / kapalıyken görünen kısa metin. */
  switchTrueLabel?: string;
  switchFalseLabel?: string;
  /** İz sm 40×24 · md 51×31 (iOS) · lg 60×36. Varsayılan: `md`. */
  size?: Size;
  /** Açık hal rengi. Varsayılan: `primary`. Kapalı hal her renkte nötr gri. */
  color?: ColorRole;
  /** Süren işlem: topuzda dönen gösterge, anahtar kilitli. */
  loading?: boolean;
  /** Etiket yoksa erişilebilir ad. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const MIN_TOUCH = 44;
const INSET = 2;

/** 0 (kapalı) → 1 (açık) ilerleme; hareket azaltmada anlık. */
function useToggleProgress(on: boolean): Animated.Value {
  const progress = useRef(new Animated.Value(on ? 1 : 0)).current;
  const reduce = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduce.current = v)).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (reduce.current) progress.setValue(on ? 1 : 0);
    else Animated.timing(progress, { toValue: on ? 1 : 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [on, progress]);
  return progress;
}

interface TrackProps {
  on: boolean;
  m: NativeSwitchSize;
  color: ColorRole;
  disabled: boolean;
  loading: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

function SwitchTrack({ on, m, color, disabled, loading, trueLabel, falseLabel }: TrackProps) {
  const theme = useTheme();
  const hasInnerLabel = Boolean(trueLabel || falseLabel);
  const width = hasInnerLabel ? m.labelWidth : m.width;
  const progress = useToggleProgress(on);
  const onColor = switchTrackColor(theme, color, true, hasInnerLabel);
  const trackColor = progress.interpolate({ inputRange: [0, 1], outputRange: [switchTrackColor(theme, color, false, hasInnerLabel), onColor] });
  const knobX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, width - m.knob - INSET * 2] });
  const innerText = on ? trueLabel : falseLabel;
  // Metin topuzun karşı tarafında, kalan alanda ortalı.
  const near = INSET + 8;
  const far = m.knob + INSET + 6;

  return (
    <Animated.View style={{ width, height: m.height, borderRadius: m.height / 2, backgroundColor: trackColor, justifyContent: "center", opacity: disabled ? 0.5 : 1 }}>
      {innerText ? (
        <Text
          numberOfLines={1}
          style={{ position: "absolute", left: on ? near : far, right: on ? far : near, textAlign: "center", fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.fontSize, fontWeight: "600", color: theme.color[on ? color : "neutral"].solidContrast }}
        >
          {innerText}
        </Text>
      ) : null}
      <Animated.View
        style={{
          position: "absolute",
          left: INSET,
          width: m.knob,
          height: m.knob,
          borderRadius: m.knob / 2,
          backgroundColor: "#ffffff", // kullanıcı kuralı: topuz her zaman beyaz
          alignItems: "center",
          justifyContent: "center",
          transform: [{ translateX: knobX }],
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        {loading ? <ActivityIndicator size="small" color={on ? onColor : theme.color.canvas.muted} style={{ transform: [{ scale: m.knob / 30 }] }} /> : null}
      </Animated.View>
    </Animated.View>
  );
}

export function Switch({ checked, defaultChecked = false, onChange, disabled: ownDisabled, label, switchTrueLabel, switchFalseLabel, size = "md", color = "primary", loading = false, skeleton: ownSkeleton, accessibilityLabel: ownLabel, style }: SwitchProps) {
  const { disabled, skeleton, accessibilityLabel } = useFieldControl({ disabled: ownDisabled, skeleton: ownSkeleton, accessibilityLabel: ownLabel });
  const theme = useTheme();
  const config = useNativeConfig();
  const m = config.switch[size];
  const body = config.selection[size];
  const [on, setOn] = useControllable(checked, defaultChecked);
  const width = switchTrueLabel || switchFalseLabel ? m.labelWidth : m.width;
  const rowStyle: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: label ? "space-between" : "flex-start", gap: 12, minHeight: MIN_TOUCH };

  const labelText = label ? (
    <Text style={{ flexShrink: 1, fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: body.fontSize, lineHeight: body.lineHeight, color: disabled ? theme.color.canvas.disabled : theme.color.canvas.foreground }}>{label}</Text>
  ) : null;

  if (skeleton) {
    const placeholder = (
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={[rowStyle, label ? style : null]}>
        {labelText ? <SkeletonBox style={{ borderRadius: 4 }}>{labelText}</SkeletonBox> : null}
        <SkeletonBox style={{ width, height: m.height, borderRadius: m.height / 2 }} />
      </View>
    );
    return label ? placeholder : <Hug style={style}>{placeholder}</Hug>;
  }

  const pressable = (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label ?? accessibilityLabel}
      accessibilityState={{ checked: on, disabled, busy: loading }}
      aria-checked={on}
      aria-disabled={disabled}
      aria-busy={loading}
      disabled={disabled || loading}
      onPress={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      style={[rowStyle, label ? style : null]}
    >
      {labelText}
      <SwitchTrack on={on} m={m} color={color} disabled={disabled} loading={loading} trueLabel={switchTrueLabel} falseLabel={switchFalseLabel} />
    </Pressable>
  );
  // Etiketsiz anahtar içeriği kadar; yatay satırda ortalamayı bozmasın diye Hug.
  return label ? pressable : <Hug style={style}>{pressable}</Hug>;
}
