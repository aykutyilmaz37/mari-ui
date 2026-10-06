import React, { useMemo, useRef, useState } from "react";
import { PanResponder, View, type AccessibilityActionEvent, type GestureResponderEvent, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { useTheme } from "../theme/useTheme";
import { StarIcon } from "../lib/icons";
import { Hug } from "../lib/Hug";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { rateValueAt, rateValueText, starFraction, stepRate } from "./utils";

export interface RateCharacterState {
  index: number;
  /** Dolu katman mı (boş katman `false`). */
  filled: boolean;
  /** O katmanın rengi — özel karakteri boyamak için. */
  color: string;
}

export interface RateProps extends SkeletonableProps {
  /** Yıldız sayısı. Varsayılan: `5`. */
  count?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Parmak yıldızların üzerinde gezinirken önizleme puanı; bırakınca `0` (web'deki hover sözleşmesi). */
  onHoverChange?: (value: number) => void;
  /** Yarım puan (dokunulan yıldızın sol yarısı). */
  allowHalf?: boolean;
  /** Aynı puana yeniden dokununca sıfırlar. Varsayılan: `true`. */
  allowClear?: boolean;
  disabled?: boolean;
  /** Salt gösterim (ortalama puan): etkileşim yok, ondalık değer (4,3) oranında dolar. */
  readOnly?: boolean;
  /** Yıldız yerine karakter. Fonksiyon her katmanı (boş/dolu) kendi rengiyle çizebilir. */
  character?: React.ReactNode | ((state: RateCharacterState) => React.ReactNode);
  /** Yıldız kutusu (pt). Varsayılan: `28`. */
  characterSize?: number;
  /** Verilmezse `rating` token'ları (parlak sarı). Rol verilirse düz o renk. */
  color?: ColorRole;
  /** İleri düzey kaçış: token yerine ham renk. */
  characterColor?: string;
  /** Varsayılan: "Puan". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const MIN_TOUCH = 44;

interface Palette {
  fill: string;
  stroke: string;
  empty: string;
}

function Character({ character, index, filled, size, palette }: { character: RateProps["character"]; index: number; filled: boolean; size: number; palette: Palette }) {
  if (character === undefined) {
    return filled ? <StarIcon size={size} fill={palette.fill} color={palette.stroke} /> : <StarIcon size={size} color={palette.empty} />;
  }
  if (typeof character === "function") return <>{character({ index, filled, color: filled ? palette.fill : palette.empty })}</>;
  // Düz düğüm her iki katmanda aynı; boş katman soluk.
  return <View style={{ opacity: filled ? 1 : 0.25 }}>{character}</View>;
}

function Star({ fraction, index, size, character, palette }: { fraction: number; index: number; size: number; character: RateProps["character"]; palette: Palette }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Character character={character} index={index} filled={false} size={size} palette={palette} />
      {fraction > 0 ? (
        // Dolu katman üstte, orana göre kırpılır; içerik SABİT genişlikte (küçülmez).
        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: size * fraction, overflow: "hidden" }}>
          <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Character character={character} index={index} filled size={size} palette={palette} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function Rate({
  count = 5,
  value,
  defaultValue = 0,
  onChange,
  onHoverChange,
  allowHalf = false,
  allowClear = true,
  disabled = false,
  readOnly = false,
  character,
  characterSize = 28,
  color,
  characterColor,
  accessibilityLabel = "Puan",
  skeleton = false,
  style,
}: RateProps) {
  const theme = useTheme();
  const [current, setCurrent] = useControllable(value, defaultValue);
  // Sürüklerken önizleme; bırakınca işlenir.
  const [preview, setPreview] = useState<number | undefined>(undefined);
  const size = characterSize;
  const gap = Math.round(size * 0.2);
  const interactive = !disabled && !readOnly && !skeleton;
  const slop = Math.max(0, (MIN_TOUCH - size) / 2);

  const roleColor = characterColor ?? (color ? theme.color[color].solid : undefined);
  const palette: Palette = roleColor
    ? { fill: roleColor, stroke: roleColor, empty: roleColor }
    : { fill: theme.color.canvas.rating, stroke: theme.color.canvas.ratingStroke, empty: theme.color.canvas.ratingStroke };

  const commit = (next: number) => {
    setCurrent(next);
    if (next !== current) onChange?.(next);
  };

  // Responder sürekli yeniden yaratılmasın; güncel değerleri ref'ten okur.
  const showPreview = (next: number | undefined) => {
    setPreview(next);
    onHoverChange?.(next ?? 0);
  };
  const live = useRef({ current, interactive, count, size, gap, allowHalf, allowClear, commit, showPreview });
  live.current = { current, interactive, count, size, gap, allowHalf, allowClear, commit, showPreview };
  const drag = useRef({ originX: 0, value: 0, moved: false });

  const responder = useMemo(() => {
    const valueAt = (pageX: number) => {
      const s = live.current;
      return rateValueAt(pageX - drag.current.originX, { count: s.count, size: s.size, gap: s.gap, allowHalf: s.allowHalf });
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => live.current.interactive,
      onMoveShouldSetPanResponder: () => live.current.interactive,
      // Dikey kaydırma (ScrollView) yatay puan sürüklemesini çalmasın.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        // Yıldızlar pointerEvents="none" → hedef her zaman satır; locationX satıra göredir.
        drag.current = { originX: e.nativeEvent.pageX - e.nativeEvent.locationX, value: 0, moved: false };
        drag.current.value = valueAt(e.nativeEvent.pageX);
        live.current.showPreview(drag.current.value);
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const next = valueAt(e.nativeEvent.pageX);
        if (next !== drag.current.value) drag.current.moved = true;
        drag.current.value = next;
        live.current.showPreview(next);
      },
      onPanResponderRelease: () => {
        const s = live.current;
        const { value: next, moved } = drag.current;
        s.showPreview(undefined);
        s.commit(!moved && s.allowClear && next === s.current ? 0 : next);
      },
      onPanResponderTerminate: () => live.current.showPreview(undefined),
    });
  }, []);

  if (skeleton) {
    return (
      <Hug style={style}>
        <View style={{ flexDirection: "row", gap }} accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: count }, (_, i) => <SkeletonBox key={i} style={{ width: size, height: size, borderRadius: 4 }} />)}
        </View>
      </Hug>
    );
  }

  const shown = preview ?? current;
  const text = rateValueText(current, count);
  const stars = Array.from({ length: count }, (_, i) => (
    <Star key={i} index={i} size={size} character={character} palette={palette} fraction={starFraction(shown, i, allowHalf, readOnly)} />
  ));

  if (readOnly) {
    return (
      <Hug style={style}>
        <View accessible accessibilityRole="image" accessibilityLabel={`${accessibilityLabel}: ${text}`} aria-label={`${accessibilityLabel}: ${text}`} style={{ flexDirection: "row", gap }}>
          {stars}
        </View>
      </Hug>
    );
  }

  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    if (!interactive) return;
    if (e.nativeEvent.actionName === "increment") commit(stepRate(current, 1, count, allowHalf));
    if (e.nativeEvent.actionName === "decrement") commit(stepRate(current, -1, count, allowHalf));
  };

  return (
    <Hug style={style}>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        accessibilityValue={{ min: 0, max: count, now: current, text }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={onAccessibilityAction}
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={current}
        aria-valuetext={text}
        aria-disabled={disabled || undefined}
        // Dokunma alanı 44 yüksekliğe uzar, yerleşim değişmez (negatif kenar boşluğu).
        style={{ paddingVertical: slop, marginVertical: -slop, opacity: disabled ? 0.5 : 1 }}
      >
        <View pointerEvents="none" style={{ flexDirection: "row", gap }}>
          {stars}
        </View>
      </View>
    </Hug>
  );
}
