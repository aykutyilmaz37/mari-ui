import React from "react";
import { Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

/**
 * Web `MariLogo`nun (packages/components/src/logo) native-studio karşılığı:
 * aynı iris işareti + "mari·ui" yazısı. SVG `<text>` RN'de font yüklemeye
 * bağlı ve güvenilmez; yazı RN `Text` ile çizilir, renkler web ile aynı.
 */
export function MariLogo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  const fontSize = size * 0.64;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Mari UI Native" style={{ flexDirection: "row", alignItems: "center", gap: size * 0.3 }}>
      <Svg width={size} height={size} viewBox="4 4 48 48">
        <Rect x={4} y={4} width={48} height={48} rx={15} fill="#6951CE" />
        <Path d="M28 10.5c-3.1 3.2-3.2 5.5 0 8.2 3.2-2.7 3.1-5 0-8.2Z" fill="#D2C8FF" />
        <Path d="M20.6 13.3c-.3 4.5 1.2 6.5 5.6 7.1.5-4.4-1-6.4-5.6-7.1Zm14.8 0c.3 4.5-1.2 6.5-5.6 7.1-.5-4.4 1-6.4 5.6-7.1Z" fill="#F8F6FF" />
        <Path d="M14.5 40V27a4.5 4.5 0 0 1 8.1-2.7L28 31l5.4-6.7a4.5 4.5 0 0 1 8.1 2.7v13" fill="none" stroke="#fff" strokeWidth={3.7} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={{ fontSize, fontWeight: "800", letterSpacing: -0.6, color: dark ? "#f1effa" : "#242331" }}>mari</Text>
        <Text style={{ fontSize, fontWeight: "800", color: "#9B87F5" }}>·</Text>
        <Text style={{ fontSize, fontWeight: "800", letterSpacing: -0.6, color: dark ? "#b7a5ff" : "#6951CE" }}>ui</Text>
        <Text style={{ marginLeft: 6, fontSize: fontSize * 0.55, fontWeight: "600", color: dark ? "#bcb5cf" : "#696579" }}>native</Text>
      </View>
    </View>
  );
}
