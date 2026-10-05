import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon, SparklesIcon, XIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";

export interface AlertProps extends SkeletonableProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Varsayılan: `info`. */
  color?: ColorRole;
  /** `true` (renge göre ikon), `false` ya da özel öğe. */
  icon?: boolean | React.ReactNode;
  /** Sağda eylem (ör. "Tekrar dene" düğmesi). */
  action?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  /** Varsayılan: `"Uyarıyı kapat"`. */
  closeLabel?: string;
  /** Ekran üstünde kenardan kenara şerit (köşesiz, yalnız alt çizgi). */
  banner?: boolean;
  /**
   * Duyuru. Varsayılan: error/warning → `alert` (hemen okunur), diğerleri
   * `status` (sırası gelince). `none`: duyurma (sayfa açılışında zaten görünen içerik).
   */
  role?: "alert" | "status" | "none";
  style?: StyleProp<ViewStyle>;
}

type IconComponent = (props: { size?: number; color?: string }) => React.ReactElement;

const ICON: Record<ColorRole, IconComponent> = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: CircleAlertIcon,
  error: CircleXIcon,
  primary: InfoIcon,
  accent: SparklesIcon,
  neutral: InfoIcon,
};

const LIVE = { alert: "assertive", status: "polite" } as const;

const EXIT_MS = 200;
const ICON_SIZE = 20;
const MIN_TOUCH = 44;

function resolveRole(role: AlertProps["role"], color: ColorRole): "alert" | "status" | undefined {
  if (role === "none") return undefined;
  if (role) return role;
  return color === "error" || color === "warning" ? "alert" : "status";
}

/** 28pt düğme, `hitSlop` ile 44pt dokunma alanı; iskelette yer kaplar ama görünmez. */
function CloseButton({ label, hidden, color, onPress }: { label: string; hidden: boolean; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={hidden}
      hitSlop={(MIN_TOUCH - 28) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityElementsHidden={hidden} aria-hidden={hidden}
      style={({ pressed }) => ({ width: 28, height: 28, margin: -4, alignItems: "center", justifyContent: "center", borderRadius: 6, opacity: pressed ? 0.6 : 1 })}
    >
      {hidden ? null : <XIcon size={16} color={color} />}
    </Pressable>
  );
}

/** Düz metin → `Text`; öğe olduğu gibi. İskelette görünmez metnin boyutunda kutu. */
function Slot({ node, style, skeleton }: { node: React.ReactNode; style: object; skeleton: boolean }) {
  if (node == null || node === false) return null;
  const content = typeof node === "string" || typeof node === "number" ? <Text style={style}>{node}</Text> : node;
  return skeleton ? <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start", maxWidth: "100%" }}>{content}</SkeletonBox> : <>{content}</>;
}

function resolveIcon(icon: AlertProps["icon"], color: ColorRole, tint: string): React.ReactNode {
  if (icon === false) return null;
  if (icon !== true) return icon;
  const Icon = ICON[color];
  return <Icon size={ICON_SIZE} color={tint} />;
}

/** Banner: kenardan kenara, yalnız alt çizgi; kutu: köşeli, dört kenar. */
function containerStyle(banner: boolean, radius: number): ViewStyle {
  return banner ? { borderBottomWidth: 1, paddingHorizontal: 16, paddingVertical: 10 } : { borderWidth: 1, borderRadius: radius, padding: 14 };
}

export function Alert({ title, description, color = "info", icon = true, action, closable = false, onClose, closeLabel = "Uyarıyı kapat", banner = false, role, skeleton = false, style }: AlertProps) {
  const theme = useTheme();
  const t = useNativeConfig().typography.h6;
  const [closed, setClosed] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const reduce = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduce.current = v)).catch(() => undefined);
  }, []);
  if (closed) return null;

  const roleColor = theme.color[color];
  const font = nativeFontFamily(theme.fontFamily.sans);
  // Metin HIG Subheadline 15/20; açıklama başlık varken soluk.
  const titleStyle = { fontFamily: font, fontSize: t.fontSize, lineHeight: t.lineHeight, fontWeight: "600" as const, color: theme.color.canvas.foreground };
  const descriptionStyle = { fontFamily: font, fontSize: t.fontSize, lineHeight: t.lineHeight, color: title != null ? theme.color.canvas.muted : theme.color.canvas.foreground };
  const announce = skeleton ? undefined : resolveRole(role, color);

  const close = () => {
    onClose?.();
    if (reduce.current) {
      setClosed(true);
      return;
    }
    Animated.timing(opacity, { toValue: 0, duration: EXIT_MS, useNativeDriver: true }).start(() => setClosed(true));
  };

  const iconNode = resolveIcon(icon, color, roleColor.text);
  const container = containerStyle(banner, toPx(theme.radius.lg));

  return (
    <Animated.View
      accessibilityRole={announce === "alert" ? "alert" : undefined}
      accessibilityLiveRegion={announce ? LIVE[announce] : "none"}
      aria-live={announce ? LIVE[announce] : undefined}
      aria-busy={skeleton || undefined}
      style={[{ flexDirection: "row", alignItems: "flex-start", gap: 12, alignSelf: "stretch", backgroundColor: roleColor.subtle, borderColor: roleColor.border, opacity }, container, style]}
    >
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: 12, rowGap: 8 }}>
        {iconNode ? <View style={{ paddingTop: (t.lineHeight - ICON_SIZE) / 2 }}>{skeleton ? <SkeletonBox style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2 }} /> : iconNode}</View> : null}
        <View style={{ flex: 1, flexBasis: 180, gap: 2 }}>
          <Slot node={title} style={titleStyle} skeleton={skeleton} />
          <Slot node={description} style={descriptionStyle} skeleton={skeleton} />
        </View>
        {action ? <View style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: skeleton ? 0 : 1 }}>{action}</View> : null}
      </View>
      {closable ? <CloseButton label={closeLabel} hidden={skeleton} color={theme.color.canvas.muted} onPress={close} /> : null}
    </Animated.View>
  );
}
