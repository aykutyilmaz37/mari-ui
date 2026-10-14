import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

/**
 * RN'de satır içi (inline) öğe yok: bir View sütunda tam genişliğe uzar.
 * Etiket/rozet gibi içeriği kadar olması gereken öğelerde `alignSelf:
 * "flex-start"` KULLANMAYIN — yatay bir satırda ebeveynin `alignItems:
 * "center"`ını ezip öğeyi tepeye yaslar. Bunun yerine dış kutu ebeveynin
 * hizasını izler, içerik onun içinde kendi boyutunda kalır.
 */
export function Hug({ style, children }: Readonly<{ style?: StyleProp<ViewStyle>; children: React.ReactNode }>) {
  return <View style={[{ alignItems: "flex-start", maxWidth: "100%" }, style]}>{children}</View>;
}
