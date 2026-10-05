import { forwardRef, type ReactNode, type ComponentRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { Pressable, Text, View, type TextStyle } from "react-native";
import { useStyles } from "../styles/useStyles";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { SkeletonBox } from "../lib/Skeleton";
import type { CardRecipeResult } from "../styles/recipes/cardRecipe";
import type { CardProps } from "./types";

export type { CardProps };

/** Native'de string/sayı doğrudan View çocuğu olamaz. */
export function cardText(node: ReactNode, style: TextStyle, numberOfLines?: number): ReactNode {
  return typeof node === "string" || typeof node === "number" ? <Text style={style} numberOfLines={numberOfLines}>{node}</Text> : node;
}

/** İçerik her iki halde aynı kutuda kalır; uzun gövde yüklenirken de yer tutar. */
function Slot({ skeleton, radius, children }: { skeleton: boolean; radius: number; children: ReactNode }) {
  return skeleton ? <SkeletonBox style={{ borderRadius: radius }}>{children}</SkeletonBox> : <View>{children}</View>;
}

function CardContent({ props, styles, skeleton }: { props: CardProps; styles: CardRecipeResult; skeleton: boolean }) {
  const { children, title, extra, cover, footer, actions, slotStyles } = props;
  const theme = useTheme();
  const slotRadius = toPx(theme.radius.sm);
  const hasBottom = footer != null || Boolean(actions?.length);
  // İki grup: kapsayıcı `space-between` ile alt grubu (alt bilgi + eylemler) eşit
  // yükseklikteki kartlarda dibe indirir; esneyen çocuk gerekmez (bkz. cardRecipe).
  return (
    <>
      <View>
        {cover != null ? <View style={slotStyles?.cover}><Slot skeleton={skeleton} radius={slotRadius}>{cardText(cover, styles.bodyText)}</Slot></View> : null}
        {title != null || extra != null ? (
          <>
            <View style={[styles.header, slotStyles?.header]}>
              {title != null ? <View style={{ flex: 1, minWidth: 0 }}><Slot skeleton={skeleton} radius={slotRadius}>{cardText(title, styles.titleText, 1)}</Slot></View> : null}
              {extra != null ? <View style={{ flexShrink: 0, marginStart: "auto" }}><Slot skeleton={skeleton} radius={slotRadius}>{cardText(extra, styles.extraText)}</Slot></View> : null}
            </View>
            <View style={styles.divider} />
          </>
        ) : null}
        <View style={[styles.body, slotStyles?.body]}><Slot skeleton={skeleton} radius={slotRadius}>{cardText(children, styles.bodyText)}</Slot></View>
      </View>
      {hasBottom ? (
        <View>
          {footer != null ? (
            <>
              <View style={styles.divider} />
              <View style={[styles.footer, slotStyles?.footer]}><Slot skeleton={skeleton} radius={slotRadius}>{cardText(footer, styles.bodyText)}</Slot></View>
            </>
          ) : null}
          {actions?.length ? (
            <View style={[styles.actions, slotStyles?.actions]}>
              {actions.map((action, index) => (
                <View key={index} style={[styles.action, index > 0 && styles.actionDivider]}>
                  <Slot skeleton={skeleton} radius={slotRadius}>{cardText(action, styles.bodyText)}</Slot>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

/** Web slotları + native onPress; hoverable sadece basılma görünümünü belirler. */
export const Card: ForwardRefExoticComponent<CardProps & RefAttributes<ComponentRef<typeof View>>> = forwardRef<ComponentRef<typeof View>, CardProps>(function Card(props, ref) {
  const { bordered = true, inset = false, size = "md", loading = false, skeleton = loading, disabled = false, hoverable = true, style, onPress, onLongPress, testID, accessibilityLabel, accessibilityHint } = props;
  const styles = useStyles("card", { size, bordered, inset });
  const interactive = Boolean(onPress || onLongPress);
  const content = <CardContent props={props} styles={styles} skeleton={skeleton} />;
  const shared = {
    ref,
    testID,
    accessibilityLabel,
    accessibilityHint,
    accessibilityElementsHidden: skeleton, "aria-hidden": skeleton,
    importantForAccessibility: skeleton ? "no-hide-descendants" as const : "auto" as const,
  };
  const containerStyle = [styles.container, interactive && { minHeight: 44 }, disabled && { opacity: 0.5 }, style];
  if (interactive && !skeleton) {
    return (
      <Pressable
        {...shared}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        style={({ pressed }) => [containerStyle, disabled && { pointerEvents: "none" as const }, pressed && hoverable && !disabled && styles.pressedContainer]}
      >
        {content}
      </Pressable>
    );
  }
  return <View {...shared} style={[containerStyle, (skeleton || disabled) && { pointerEvents: "none" }]}>{content}</View>;
});
Card.displayName = "Card";
