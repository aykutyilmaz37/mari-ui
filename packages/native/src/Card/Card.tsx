import { Pressable, Text, View } from "react-native";
import { useStyles } from "../styles/useStyles";
import type { CardProps } from "./types";

export type { CardProps };

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
      <View style={styles.body}>
        {loading ? (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.divider, { width: "75%", height: 12, borderRadius: 4, marginBottom: 8 }]} />
            <View style={[styles.divider, { width: "50%", height: 12, borderRadius: 4 }]} />
          </View>
        ) : typeof children === "string" ? (
          <Text style={styles.bodyText}>{children}</Text>
        ) : (
          children
        )}
      </View>
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
