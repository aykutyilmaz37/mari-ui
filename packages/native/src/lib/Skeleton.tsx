import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { skeletonColor } from "../theme/skeletonColor";

/**
 * Native `skeleton` sözleşmesi — web'deki (Faz 15) ile aynı: veri gelene kadar
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

function useReduceMotion(): boolean {
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
function usePulse(): Animated.Value {
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, opacity]);
  return opacity;
}

/**
 * Yer tutucu kutu. `style` component'in GERÇEK geometrisini (yükseklik,
 * köşe, iç boşluk) taşır; dolgu ve kenarlık burada iskelet tonuna çevrilir.
 * `children` görünmez ama yer kaplar (ör. buton etiketi → aynı genişlik).
 */
export function SkeletonBox({ style, children }: { style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const theme = useTheme();
  const opacity = usePulse();
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[style, { backgroundColor: skeletonColor(theme), borderColor: "transparent", opacity }]}
    >
      {children ? <View style={{ opacity: 0 }}>{children}</View> : null}
    </Animated.View>
  );
}
