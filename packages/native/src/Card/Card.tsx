import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../styles/useStyles";
import type { CardRecipeResult } from "../styles/recipes/cardRecipe";
import type { CardProps } from "./types";

export type { CardProps };

/**
 * İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-
 * conditional`): `loading` → iskelet, string `children` → `<Text>`,
 * aksi halde `children` olduğu gibi.
 */
function resolveBodyContent(loading: boolean, children: CardProps["children"], styles: CardRecipeResult): ReactNode {
  if (loading) {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.divider, { width: "75%", height: 12, borderRadius: 4, marginBottom: 8 }]} />
        <View style={[styles.divider, { width: "50%", height: 12, borderRadius: 4 }]} />
      </View>
    );
  }
  if (typeof children === "string") return <Text style={styles.bodyText}>{children}</Text>;
  return children;
}

/**
 * Web'deki `Card`ın slot yapısıyla (header/body/footer/cover) aynı düzen.
 * `styles` prop'u web'de zaten hiç uygulanmadığı fark edilip kaldırılmıştı
 * (bkz. plan Faz 3) — burada baştan hiç eklenmedi.
 */
export function Card({ children, title, extra, cover, footer, bordered = true, hoverable = false, loading = false, size, inset = false, style, onPress, testID }: CardProps) {
  const styles = useStyles("card", { size, bordered, inset });
  const canPress = hoverable && Boolean(onPress);

  const content = (
    <>
      {cover && <View>{cover}</View>}
      {(title || extra) && (
        <>
          <View style={styles.header}>
            {title != null && (typeof title === "string" ? <Text style={styles.titleText}>{title}</Text> : title)}
            {extra}
          </View>
          <View style={styles.divider} />
        </>
      )}
      <View style={styles.body}>{resolveBodyContent(loading, children, styles)}</View>
      {footer && (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>{footer}</View>
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
