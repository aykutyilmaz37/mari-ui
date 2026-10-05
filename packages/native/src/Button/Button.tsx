import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox } from "../lib/Skeleton";
import type { ButtonProps } from "./types";

export type { ButtonProps };

/**
 * Web'in `Button`ıyla aynı beş eksende (`color`/`variant`/`size`/`shape`/
 * `disabled`) konuşur — prop API'si kasıtlı olarak birebir aynı adları
 * kullanır (bkz. plan Faz 5: "Prop API'si web ile birebir aynı"). Web'e özgü
 * `href`/`target`/`htmlType`/mouse event'leri burada YOK — bunların native'de
 * karşılığı yok, uydurmak yerine dürüstçe dışarıda bırakıldı.
 */
export function Button({
  color = "primary",
  variant = "solid",
  size = "md",
  shape = "default",
  block = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "start",
  onPress,
  children,
  style,
  testID,
  accessibilityLabel,
  skeleton = false,
}: ButtonProps) {
  const styles = useStyles("button", { color, variant, size, shape, block, disabled });
  const isDisabled = disabled || loading;

  if (skeleton) {
    // Aynı kutu (yükseklik, köşe, iç boşluk); etiket ve ikon görünmez ama yer kaplar → aynı genişlik.
    return (
      <SkeletonBox style={[styles.container, style]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: styles.container.gap }}>
          {icon}
          {typeof children === "string" ? <Text style={styles.label}>{children}</Text> : children}
        </View>
      </SkeletonBox>
    );
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={(state) => [styles.container, state.pressed && !isDisabled && styles.pressedContainer, style]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.label.color} />
      ) : (
        icon && iconPosition === "start" && <View>{icon}</View>
      )}
      {children != null && (typeof children === "string" ? <Text style={styles.label}>{children}</Text> : children)}
      {!loading && icon && iconPosition === "end" && <View>{icon}</View>}
    </Pressable>
  );
}
