import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { shadowStyle } from "../theme/effects";
import { useMotionScale, useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { useSafeInsets } from "../theme/insets";
import { Badge } from "../Badge";
import { XIcon } from "../lib/icons";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";

export type FloatButtonShape = "circle" | "square";
export type FloatButtonPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface FloatButtonBadge {
  count?: number | string;
  dot?: boolean;
  color?: ColorRole;
}

export interface FloatButtonIconState {
  /** İkon rengi (RN'de `currentColor` yok). */
  color: string;
  size: number;
}

export interface FloatButtonProps extends SkeletonableProps {
  icon?: React.ReactNode | ((state: FloatButtonIconState) => React.ReactNode);
  /**
   * Genişletilmiş düğme (Material 3 extended FAB): ikonun yanında metin, hap şeklinde.
   * Liste kaydırılınca daraltmak için `label`ı kaldırın. Native'e özgü.
   */
  label?: string;
  /** İkonun altında kısa metin (yalnız `square`); verilirse erişilebilir ad da odur. */
  description?: string;
  /** Grup menüsünde düğmenin yanında görünen etiket. Tek başına düğmede yalnız erişilebilir ad. */
  tooltip?: string;
  /** Verilmezse yüzey rengi (nötr); verilirse rolün dolu rengi (ör. `primary` = ana eylem). */
  color?: ColorRole;
  /** Varsayılan: `circle`. Grupta grubun şekli geçerli. */
  shape?: FloatButtonShape;
  /** Sayı ya da nokta rozeti (okunmamış mesaj gibi). */
  badge?: FloatButtonBadge;
  onPress?: () => void;
  /** Tek başına kullanımda kapsayıcının köşesi. Varsayılan: `bottom-right`. Grupta yok sayılır. */
  placement?: FloatButtonPlacement;
  /**
   * `false`: köşeye yapışmaz, akışta durur (ör. kendi düzeninizde). Varsayılan: `true` —
   * en yakın kapsayıcının (genelde ekranın) köşesine `position: absolute`.
   */
  floating?: boolean;
  /** Kenardan uzaklık (güvenli alan payının üstüne). Varsayılan: 16. */
  offset?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZE = 56;
const ICON = 24;

interface GroupCtx {
  shape: FloatButtonShape;
  /** Menüde etiketlerin hangi yanda duracağı (sağdaki grupta solda). */
  labelSide: "left" | "right";
  menu: boolean;
  onItemPress?: () => void;
}
const GroupContext = /* @__PURE__ */ createContext<GroupCtx | null>(null);

/** Kapsayıcının köşesine yerleşim; alt / üst güvenli alan payı eklenir (ev çubuğu, çentik). */
function cornerStyle(placement: FloatButtonPlacement, offset: number, insets: { top: number; bottom: number; left: number; right: number }): ViewStyle {
  const [v, h] = placement.split("-") as ["top" | "bottom", "left" | "right"];
  return { position: "absolute", [v]: offset + insets[v], [h]: offset + insets[h] };
}

function useCornerInsets() {
  const safe = useSafeInsets();
  return { top: safe?.top ?? 0, bottom: safe?.bottom ?? 0, left: safe?.left ?? 0, right: safe?.right ?? 0 };
}

function colors(theme: Theme, color: ColorRole | undefined) {
  const c = theme.color.canvas;
  if (!color) return { bg: c.surface, ink: c.foreground, border: c.border };
  return { bg: theme.color[color].solid, ink: theme.color[color].solidContrast, border: theme.color[color].solid };
}

/** Düğmenin yüzeyi: gölge + kenarlık (koyu temada gölge görünmez, kenarlık ayırır). */
function surface(theme: Theme, shape: FloatButtonShape, extended: boolean, bg: string, border: string, square: boolean): ViewStyle {
  const radius = square ? toPx(theme.radius.lg) : SIZE / 2;
  return {
    minWidth: SIZE,
    height: square ? undefined : SIZE,
    minHeight: SIZE,
    paddingHorizontal: extended ? 20 : 0,
    paddingVertical: square ? 8 : 0,
    borderRadius: shape === "circle" && !square ? radius : toPx(theme.radius.lg),
    backgroundColor: bg,
    borderWidth: 1,
    borderColor: border,
    flexDirection: extended ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: extended ? 10 : 2,
    ...shadowStyle(theme, { opacity: 0.16, radius: 10, offsetY: 4, elevation: 6 }),
  };
}

/** Menü öğesinin yanındaki etiket (speed dial). */
function MenuLabel({ text, theme }: Readonly<{ text: string; theme: Theme }>) {
  const c = theme.color.canvas;
  return (
    <View pointerEvents="none" style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
      <Text numberOfLines={1} style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, fontWeight: "500", color: c.foreground }}>{text}</Text>
    </View>
  );
}

function iconNode(icon: FloatButtonProps["icon"], ink: string) {
  return typeof icon === "function" ? icon({ color: ink, size: ICON }) : icon;
}

function withBadge(node: React.ReactNode, badge: FloatButtonBadge | undefined) {
  if (!badge || (badge.count === undefined && !badge.dot)) return node;
  return (
    <Badge count={badge.count} dot={badge.dot} color={badge.color} offset={[4, -4]}>
      {node}
    </Badge>
  );
}

/**
 * Yüzen eylem düğmesi (Material 3 FAB): ekranın ana eylemi, kapsayıcının
 * köşesine yapışık. Daire / kare (alt metinli) / genişletilmiş (`label`),
 * rozet, güvenli alan payı. Grupta (`FloatButtonGroup`) alt alta ya da menü.
 */
export function FloatButton({ icon, label, description, tooltip, color, shape: ownShape = "circle", badge, onPress, placement = "bottom-right", floating = true, offset = 16, disabled = false, accessibilityLabel, skeleton = false, style }: Readonly<FloatButtonProps>) {
  const theme = useTheme();
  const group = useContext(GroupContext);
  const insets = useCornerInsets();
  const shape = group?.shape ?? ownShape;
  const square = shape === "square" && !label;
  const extended = Boolean(label);
  const { bg, ink, border } = colors(theme, color);
  const name = accessibilityLabel ?? label ?? description ?? tooltip;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const box = surface(theme, shape, extended, bg, border, square);

  const button = skeleton ? (
    <SkeletonBox style={[box, { shadowOpacity: 0, elevation: 0 }]}>{label ? <Text style={{ fontSize: 15 }}>{label}</Text> : null}</SkeletonBox>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        onPress?.();
        group?.onItemPress?.();
      }}
      style={({ pressed }) => [box, { opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      {withBadge(iconNode(icon, ink), badge)}
      {extended ? <Text numberOfLines={1} style={{ fontFamily: font, fontSize: 15, fontWeight: "600", color: ink }}>{label}</Text> : null}
      {square && description ? <Text numberOfLines={1} style={{ fontFamily: font, fontSize: 11, fontWeight: "500", color: ink }}>{description}</Text> : null}
    </Pressable>
  );

  if (group) {
    // Menüde etiket düğmenin yanında (görünür); düz grupta yok.
    if (!group.menu || !tooltip) return button;
    return (
      <View style={{ flexDirection: group.labelSide === "left" ? "row" : "row-reverse", alignItems: "center", gap: 12 }}>
        <MenuLabel text={tooltip} theme={theme} />
        {button}
      </View>
    );
  }
  // Akışta: ebeveynin hizasını izler (alignSelf vermez) — menüde etiketler sütunu genişletince
  // ana düğme sola kayıyordu; içerik kendi boyutunda kalır (Hug deseni).
  return <View style={[floating ? cornerStyle(placement, offset, insets) : { alignItems: "flex-start", maxWidth: "100%" }, style]}>{button}</View>;
}

interface FloatButtonGroupBaseProps extends SkeletonableProps {
  /** Varsayılan: `circle`. */
  shape?: FloatButtonShape;
  /** Varsayılan: `bottom-right`. */
  placement?: FloatButtonPlacement;
  /** Bkz. `FloatButton.floating`. Varsayılan: `true`. */
  floating?: boolean;
  offset?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface FloatButtonGroupStaticProps extends FloatButtonGroupBaseProps {
  /** Verilmezse düğmeler hep görünür, alt alta. */
  trigger?: undefined;
}

export interface FloatButtonGroupMenuProps extends FloatButtonGroupBaseProps {
  /** Ana düğme menüyü açar / kapatır; düğmeler onun üstünde (ya da altında) açılır. Native'de yalnız `click`. */
  trigger: "click";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ana düğmenin ikonu (kapalıyken). Açıkken × (döner). */
  icon?: Exclude<FloatButtonProps["icon"], undefined>;
  /** Ana düğmenin erişilebilir adı. Varsayılan: "Hızlı işlemler". */
  accessibilityLabel?: string;
  color?: ColorRole;
}

export type FloatButtonGroupProps = FloatButtonGroupStaticProps | FloatButtonGroupMenuProps;

/** Menü öğeleri ana düğmeden çıkıp sırayla belirir; ana ikon × olacak şekilde döner. */
function useMenuMotion(open: boolean) {
  const motion = useMotionScale();
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(v, { toValue: open ? 1 : 0, duration: reduce ? 0 : Math.round(200 * motion), easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, reduce, v, motion]);
  return { v, mounted };
}

function MenuGroup(props: FloatButtonGroupMenuProps & { insets: ReturnType<typeof useCornerInsets> }) {
  const { children, shape = "circle", placement = "bottom-right", floating = true, offset = 16, icon, accessibilityLabel = "Hızlı işlemler", color = "primary", skeleton = false, insets, style } = props;
  const theme = useTheme();
  const [open, setOpenState] = useControllable<boolean>(props.open, props.defaultOpen ?? false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    props.onOpenChange?.(next);
  };
  const motion = useMenuMotion(open);
  const upward = placement.startsWith("bottom");
  const items = React.Children.toArray(children);
  const n = items.length;
  const ink = colors(theme, color).ink;
  const rotate = motion.v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] });

  const list = motion.mounted ? (
    <View accessibilityRole="menu" style={{ alignItems: placement.endsWith("right") ? "flex-end" : "flex-start", gap: 12 }}>
      {(upward ? items : [...items].reverse()).map((child, i) => {
        // Ana düğmeye en yakın öğe önce gelir.
        const order = upward ? n - 1 - i : i;
        const start = order / (n + 1);
        const p = motion.v.interpolate({ inputRange: [start, Math.min(1, start + 0.5)], outputRange: [0, 1], extrapolate: "clamp" });
        return (
          <Animated.View key={i} style={{ opacity: p, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [upward ? 12 : -12, 0] }) }, { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
            {child}
          </Animated.View>
        );
      })}
    </View>
  ) : null;

  const main = (
    <FloatButton
      floating={false}
      color={color}
      shape={shape}
      skeleton={skeleton}
      accessibilityLabel={open ? "Menüyü kapat" : accessibilityLabel}
      onPress={() => setOpen(!open)}
      icon={<Animated.View style={{ transform: [{ rotate }] }}>{open ? <XIcon size={ICON} color={ink} /> : iconNode(icon, ink)}</Animated.View>}
    />
  );

  return (
    <View pointerEvents="box-none" style={[floating ? cornerStyle(placement, offset, insets) : null, { alignItems: placement.endsWith("right") ? "flex-end" : "flex-start", gap: 12 }, style]}>
      <GroupContext.Provider value={{ shape, labelSide: placement.endsWith("right") ? "left" : "right", menu: true, onItemPress: () => setOpen(false) }}>
        {upward ? list : null}
        {/* Ana düğme grup bağlamı dışında: kendi şekli ve etiketsiz. */}
        <GroupContext.Provider value={null}>{main}</GroupContext.Provider>
        {upward ? null : list}
      </GroupContext.Provider>
    </View>
  );
}

/**
 * Birden çok yüzen düğme. `trigger` yoksa alt alta hep görünür; `trigger="click"` ana düğme menüyü (speed dial) açar —
 * öğeler etiketleriyle (`tooltip`) sırayla çıkar, öğeye dokununca kapanır.
 */
export function FloatButtonGroup(props: FloatButtonGroupProps) {
  const insets = useCornerInsets();
  if (props.trigger === "click") return <MenuGroup {...props} insets={insets} />;
  const { children, shape = "circle", placement = "bottom-right", floating = true, offset = 16, style } = props;
  const square = shape === "square";
  return (
    <View
      style={[
        floating ? cornerStyle(placement, offset, insets) : { alignSelf: "flex-start" },
        { gap: square ? 8 : 12 },
        style,
      ]}
    >
      <GroupContext.Provider value={{ shape, labelSide: "left", menu: false }}>{children}</GroupContext.Provider>
    </View>
  );
}

export interface BackTopProps extends Omit<FloatButtonProps, "onPress" | "label" | "description"> {
  /** Sayfanın dikey kaydırma değeri (`useAppBarScroll` ya da kendi `Animated.Value`ınız). */
  scrollY: Animated.Value;
  /** Bu kadar kaydırılınca görünür (pt). Varsayılan: 400. */
  visibilityHeight?: number;
  /** Başa dönme işi sizde: `listRef.current?.scrollToOffset({ offset: 0, animated: true })`. */
  onPress: () => void;
}

/** Uzun sayfada başa dön düğmesi: `visibilityHeight` kadar kaydırılınca belirir. */
export function BackTop({ scrollY, visibilityHeight = 400, onPress, accessibilityLabel = "Başa dön", ...rest }: Readonly<BackTopProps>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => setVisible((v) => (v === value >= visibilityHeight ? v : value >= visibilityHeight)));
    return () => scrollY.removeListener(id);
  }, [scrollY, visibilityHeight]);
  const opacity = scrollY.interpolate({ inputRange: [visibilityHeight - 80, visibilityHeight], outputRange: [0, 1], extrapolate: "clamp" });
  return (
    <Animated.View pointerEvents={visible ? "box-none" : "none"} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity }} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? "auto" : "no-hide-descendants"}>
      <FloatButton {...rest} accessibilityLabel={accessibilityLabel} onPress={onPress} />
    </Animated.View>
  );
}
