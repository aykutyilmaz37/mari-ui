import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { skeletonColor } from "../theme/skeletonColor";

/**
 * Native `skeleton` sözleşmesi — web'deki ile aynı: veri gelene kadar
 * component KENDİ geometrisinde (aynı yükseklik, köşe, genişlik) yer tutucu
 * çizer → yüklenince yerleşim kaymaz. Yer tutucu ekran okuyucudan gizlidir.
 * `loading` ≠ `skeleton`: `loading` süren bir EYLEM (Button spinner'ı),
 * `skeleton` henüz VERİ yok.
 *
 * Hareket: web'deki parıltının native karşılığı hafif nabız (opaklık).
 * Sistemde "Hareketi azalt" açıksa sabit.
 */
export interface SkeletonableProps {
  /** Veri gelene kadar component'in kendi boyutunda iskelet çizer. */
  skeleton?: boolean;
}

/** Sistemdeki "Hareketi azalt" tercihi (canlı). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduce(value))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/** Tüm iskeletler aynı ritimde nabız atar (1 → 0,55 → 1, 1,4 sn — web parıltısıyla aynı süre). */
export function usePulse(enabled = true, low = 0.55): Animated.Value {
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce || !enabled) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: low, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, enabled, low, opacity]);
  return opacity;
}

/**
 * Yer tutucu kutu. `style` component'in GERÇEK geometrisini (yükseklik,
 * köşe, iç boşluk) taşır; dolgu ve kenarlık burada iskelet tonuna çevrilir.
 * `children` görünmez ama yer kaplar (ör. buton etiketi → aynı genişlik).
 */
export function SkeletonBox({ style, children, animated = true }: Readonly<{ style?: StyleProp<ViewStyle>; children?: ReactNode; animated?: boolean }>) {
  const theme = useTheme();
  const opacity = usePulse(animated);
  return (
    <Animated.View
      accessibilityElementsHidden aria-hidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[style, { backgroundColor: skeletonColor(theme), borderColor: "transparent", opacity }]}
    >
      {children ? <View style={{ opacity: 0 }}>{children}</View> : null}
    </Animated.View>
  );
}

/**
 * Metin satırı iskeleti: tam bir satır yüksekliğinde kutu, ortasında yazı
 * gövdesi kalınlığında (≈0,7 em) çubuk — Typography ve `Skeleton` ortak
 * kullanır, böylece iskelet satırı gerçek metin satırıyla aynı yükseklikte.
 */
export function SkeletonLine({ fontSize, lineHeight, width, animated = true }: Readonly<{ fontSize: number; lineHeight: number; width: DimensionValue; animated?: boolean }>) {
  return (
    <View style={{ height: lineHeight, justifyContent: "center" }}>
      <SkeletonBox animated={animated} style={{ width, height: Math.round(fontSize * 0.7), borderRadius: 4 }} />
    </View>
  );
}

/**
 * Tek satırlık metnin iskeleti: metin görünmez ama yerini (genişlik + satır
 * yüksekliği) korur, üstünde satırın ortasında yazı gövdesi kalınlığında
 * çubuk. Satırın tamamını boyayan `SkeletonBox`un aksine alt alta iki metin
 * (başlık + alt başlık) birbirine yapışmaz; yüklenince yerleşim kaymaz.
 */
export function SkeletonText({ fontSize, align = "flex-start", children }: Readonly<{ fontSize: number; align?: "flex-start" | "center"; children: ReactNode }>) {
  return (
    <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ alignItems: align, maxWidth: "100%" }}>
      <View style={{ maxWidth: "100%" }}>
        <View style={{ opacity: 0 }}>{children}</View>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center" }}>
          <SkeletonBox style={{ height: Math.round(fontSize * 0.7), borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );
}
