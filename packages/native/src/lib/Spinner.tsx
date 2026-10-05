import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

/**
 * Web'deki yükleniyor göstergesinin (lucide `Loader2` + `animate-spin`)
 * native karşılığı — platformun ActivityIndicator'ı web'den farklı şekil ve
 * boyutta görünüyordu (web ↔ native ölçümü). Ek bağımlılık yok (svg değil).
 *
 * Geometri lucide ile aynı oran: 24'lük kutuda r=9 yay, 2 kalınlık →
 * çap = boyut × 18/24, çizgi = boyut × 2/24. Dönüş 1 sn, doğrusal (Tailwind `animate-spin`).
 */
export function Spinner({ size, color }: { size: number; color: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const diameter = (size * 18) / 24;
  const stroke = Math.max(1, (size * 2) / 24);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth: stroke,
          // Üç kenar renkli, biri boş → açık yay (Loader2'nin boşluğu).
          borderColor: color,
          borderTopColor: "transparent",
          transform: [{ rotate: spin }],
        }}
      />
    </View>
  );
}
