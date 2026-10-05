import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox } from "../lib/Skeleton";
import type { CardRecipeResult } from "../styles/recipes/cardRecipe";
import type { CardProps } from "./types";

export type { CardProps };

/**
 * İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-
 * conditional`): `loading` → iskelet, string `children` → `<Text>`,
 * aksi halde `children` olduğu gibi.
 */
function resolveBodyContent(skeleton: boolean, children: CardProps["children"], styles: CardRecipeResult): ReactNode {
  if (skeleton) {
    // Gövde: metin satırları (son satır kısa) — satır yüksekliği gövde yazısına göre.
    const line = { height: Math.round((styles.bodyText.fontSize ?? 14) * 0.75), borderRadius: 4 };
    return (
      <View style={{ gap: 8 }}>
        <SkeletonBox style={[line, { width: "90%" }]} />
        <SkeletonBox style={[line, { width: "100%" }]} />
        <SkeletonBox style={[line, { width: "60%" }]} />
      </View>
    );
  }
  if (typeof children === "string") return <Text style={styles.bodyText}>{children}</Text>;
  return children;
}

/** Slot iskeleti: içerik görünmez ama yer kaplar (başlık, ek, kapak, alt kısım aynı boyutta). */
function slot(skeleton: boolean, node: ReactNode, radius = 4): ReactNode {
  return skeleton ? <SkeletonBox style={{ borderRadius: radius, alignSelf: "flex-start" }}>{node}</SkeletonBox> : node;
}

/**
 * Web'deki `Card`ın slot yapısıyla (header/body/footer/cover) aynı düzen.
 * `styles` prop'u web'de zaten hiç uygulanmadığı fark edilip kaldırılmıştı
 * (bkz. plan Faz 3) — burada baştan hiç eklenmedi.
 */
export function Card({ children, title, extra, cover, footer, bordered = true, hoverable = false, loading = false, skeleton: skeletonProp = false, size, inset = false, style, onPress, testID }: CardProps) {
  const styles = useStyles("card", { size, bordered, inset });
  // `loading` eskimiş takma ad (web'de de `skeleton`a devredildi).
  const skeleton = skeletonProp || loading;
  const canPress = hoverable && Boolean(onPress) && !skeleton;
  const titleNode = title != null && (typeof title === "string" ? <Text style={styles.titleText}>{title}</Text> : title);

  const content = (
    <>
      {cover && (skeleton ? <SkeletonBox>{cover}</SkeletonBox> : <View>{cover}</View>)}
      {(title || extra) && (
        <>
          <View style={styles.header}>
            {titleNode && slot(skeleton, titleNode)}
            {extra && slot(skeleton, extra)}
          </View>
          <View style={styles.divider} />
        </>
      )}
      <View style={styles.body}>{resolveBodyContent(skeleton, children, styles)}</View>
      {footer && (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>{slot(skeleton, footer)}</View>
        </>
      )}
    </>
  );

  if (canPress) {
    return (
      <Pressable onPress={onPress} style={(state) => [styles.container, state.pressed && styles.pressedContainer, style]} testID={testID}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {content}
    </View>
  );
}
