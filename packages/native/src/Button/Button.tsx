import { cloneElement, isValidElement, useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../styles/useStyles";
import { SkeletonBox } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import type { ButtonIconPosition, ButtonLoading, ButtonProps } from "./types";

export type { ButtonProps };

/** Web'deki `resolveLoading` ile aynı: nesne verilmesi "yükleniyor" demektir. */
function resolveLoading(loading: ButtonLoading): { isLoading: boolean; icon?: ReactNode; position: ButtonIconPosition; delay: number } {
  if (typeof loading === "object") return { isLoading: true, icon: loading.icon, position: loading.iconPosition ?? "start", delay: loading.delay ?? 0 };
  return { isLoading: loading, position: "start", delay: 0 };
}

/** `delay` ms sonra `true` — gecikmeli gösterge (buton bu sırada zaten devre dışı). */
function useDelayed(active: boolean, delay: number): boolean {
  const [shown, setShown] = useState(active && delay <= 0);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    if (delay <= 0) {
      setShown(true);
      return;
    }
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);
  return shown;
}

/**
 * İkona boyut ve renk — verilmemişse butonunkini ver (web: `[&>svg]:size-*` +
 * `currentColor`). lucide-react-native, @expo/vector-icons gibi ikonlar `size`
 * ve `color` prop'u alır; kendi değerini vermiş ikona dokunulmaz.
 */
function sizedIcon(icon: ReactNode, size: number, color: unknown): ReactNode {
  if (!isValidElement<{ size?: number; color?: unknown }>(icon)) return icon;
  return cloneElement(icon, { size: icon.props.size ?? size, color: icon.props.color ?? color });
}

/**
 * Web `Button` ile aynı eksenler, renkler ve davranış (web ↔ native ölçümüyle
 * doğrulandı: renkler, kenarlık, kalınlık, varyantlar). Boyutlar native
 * ölçekte (theme/nativeSize — Apple HIG + Material 3; md 44). Native
 * farkları: `onClick` → `onPress`; `href`/`target` yok; hover yok → basılınca
 * web'in hover + active hali birlikte.
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
  onLongPress,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  skeleton = false,
}: ButtonProps) {
  const load = resolveLoading(loading);
  // Yüklenirken de soluk (web: loading → disabled görünümü, opacity 0.5).
  const styles = useStyles("button", { color, variant, size, shape, block, disabled: disabled || load.isLoading });
  const indicatorShown = useDelayed(load.isLoading, load.delay);
  const isDisabled = disabled || load.isLoading;
  const iconColor = styles.label.color;
  const iconNode = sizedIcon(icon, styles.iconSize, iconColor);

  if (__DEV__ && children == null && icon && !accessibilityLabel) {
    console.warn("[@mari-ui/native] Button: yalnız ikonlu butona `accessibilityLabel` verin — ekran okuyucu aksi halde adsız bir buton okur.");
  }

  const label =
    children != null &&
    (typeof children === "string" ? (
      <Text style={[styles.label, { flexShrink: 1 }]} numberOfLines={1}>
        {children}
      </Text>
    ) : (
      children
    ));

  if (skeleton) {
    // Aynı kutu (yükseklik, köşe, iç boşluk); etiket ve ikon görünmez ama yer kaplar → aynı genişlik.
    return (
      <SkeletonBox style={[styles.container, style]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: styles.container.gap }}>
          {iconNode}
          {label}
        </View>
      </SkeletonBox>
    );
  }

  // Gösterge ikonun yerine geçer, ikon boyutunda (web: Loader2 + animate-spin).
  const indicator = load.icon ? sizedIcon(load.icon, styles.iconSize, iconColor) : <Spinner size={styles.iconSize} color={iconColor as string} />;
  // Gecikme dolana kadar gösterge yerinde ama görünmez (web: opacity-0 → belirme) — genişlik zıplamaz.
  const loadingSlot = <View style={{ opacity: indicatorShown ? 1 : 0 }}>{indicator}</View>;
  const showIcon = !load.isLoading && Boolean(iconNode);

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onLongPress={isDisabled ? undefined : onLongPress}
      disabled={isDisabled}
      hitSlop={styles.hitSlop}
      style={(state) => [styles.container, state.pressed && !isDisabled && styles.pressedContainer, style]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: load.isLoading }}
      aria-busy={load.isLoading}
    >
      {load.isLoading && load.position === "start" && loadingSlot}
      {showIcon && iconPosition === "start" && iconNode}
      {label}
      {showIcon && iconPosition === "end" && iconNode}
      {load.isLoading && load.position === "end" && loadingSlot}
    </Pressable>
  );
}
