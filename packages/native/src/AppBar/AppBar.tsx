import React, { useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from "react-native";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeAppBarSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useSafeInsets } from "../theme/insets";
import { Badge } from "../Badge";
import { ChevronLeftIcon } from "../lib/icons";
import { SkeletonBox, SkeletonText, type SkeletonableProps } from "../lib/Skeleton";

/** `small`: tek sıra. `large`: altta büyük başlık; `scrollY` verilirse kaydırınca küçük başlığa geçer. */
export type AppBarSize = "small" | "large";

export interface AppBarProps extends SkeletonableProps {
  title?: React.ReactNode;
  /** Başlığın altında küçük satır (yalnız üst sırada; `large`'da küçük başlık görününce). */
  subtitle?: React.ReactNode;
  size?: AppBarSize;
  /** Başlık hizası. Varsayılan: iOS'ta `center`, diğerlerinde `start` (platform alışkanlığı). */
  titleAlign?: "start" | "center";
  /** Verilirse solda geri düğmesi çizilir. `leading` verilmişse o kazanır. */
  onBack?: () => void;
  /** Geri düğmesinin erişilebilir adı. Varsayılan: "Geri". */
  backAccessibilityLabel?: string;
  /** Sol uç (ör. menü düğmesi, logo). */
  leading?: React.ReactNode;
  /** Sağ uç — genelde `AppBarAction`'lar. */
  actions?: React.ReactNode;
  /** Üst güvenli alan payı (çentik / durum çubuğu). Varsayılan: `ThemeProvider insets`in `top`ı, yoksa 0. */
  topInset?: number;
  /** Sayfanın dikey kaydırma değeri (`useAppBarScroll`). `large` daralır, alt çizgi kaydırınca belirir. */
  scrollY?: Animated.Value;
  /** Alt ayırıcı çizgi. Varsayılan: `scrollY` varsa kaydırınca belirir, yoksa yok. */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface AppBarActionState {
  color: string;
}

export interface AppBarActionProps {
  /** Fonksiyon verilirse ikon rengini alır (RN'de `currentColor` yok). */
  icon: React.ReactNode | ((state: AppBarActionState) => React.ReactNode);
  /** Zorunlu — ikon tek başına ekran okuyucuya bir şey söylemez. */
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Sayı rozeti; `true` nokta. */
  badge?: number | boolean;
}

const AppBarContext = React.createContext<{ skeleton: boolean; m: NativeAppBarSize; theme: Theme } | null>(null);

/**
 * Sayfa kaydırmasını AppBar'a bağlar:
 * `const { scrollY, onScroll } = useAppBarScroll();` → `<AppBar scrollY={scrollY} />` +
 * `<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>`.
 */
export function useAppBarScroll() {
  const scrollY = useRef(new Animated.Value(0)).current;
  // Yükseklik canlandırılıyor → yerel sürücü kullanılamaz.
  const onScroll = useMemo(() => Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }), [scrollY]);
  return { scrollY, onScroll, scrollEventThrottle: 16 };
}

export function AppBarAction({ icon, accessibilityLabel, onPress, disabled = false, badge }: Readonly<AppBarActionProps>) {
  const ctx = React.useContext(AppBarContext);
  const fallbackTheme = useTheme();
  const fallbackM = useNativeConfig().appBar;
  const theme = ctx?.theme ?? fallbackTheme;
  const m = ctx?.m ?? fallbackM;
  const skeleton = ctx?.skeleton ?? false;
  const color = theme.color.canvas.foreground;
  let node = typeof icon === "function" ? icon({ color }) : icon;
  if (badge !== undefined && badge !== false && !skeleton) {
    node = badge === true ? <Badge dot>{node}</Badge> : <Badge count={badge}>{node}</Badge>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled || skeleton}
      onPress={onPress}
      style={({ pressed }) => ({ width: m.actionSize, height: m.actionSize, alignItems: "center", justifyContent: "center", borderRadius: m.actionSize / 2, opacity: (disabled ? 0.4 : 1) * (pressed ? 0.5 : 1) })}
    >
      {skeleton ? <SkeletonBox style={{ width: m.iconSize, height: m.iconSize, borderRadius: m.iconSize / 2 }} /> : node}
    </Pressable>
  );
}

function titleText(node: React.ReactNode, style: object, lines = 1, header = false) {
  if (typeof node !== "string" && typeof node !== "number") return node;
  return (
    <Text numberOfLines={lines} accessibilityRole={header ? "header" : undefined} style={style}>
      {node}
    </Text>
  );
}

/** İskelette metin kendi genişliğinde, satırın ortasında ince çubuk (başlık + alt başlık birbirine yapışmasın). */
function sk(skeleton: boolean, node: React.ReactNode, fontSize: number, align: "flex-start" | "center" = "flex-start") {
  if (!skeleton || node == null) return node;
  return (
    <SkeletonText fontSize={fontSize} align={align}>
      {node}
    </SkeletonText>
  );
}

type Animatable = number | Animated.AnimatedInterpolation<number>;

/** `scrollY`'den türeyen değerler: büyük başlık alanı kısalır/solar, küçük başlık ve alt çizgi belirir. */
function useCollapse(scrollY: Animated.Value | undefined, H: number, large: boolean) {
  return useMemo(() => {
    if (!scrollY) return null;
    const clamp = { extrapolate: "clamp" as const };
    return {
      areaHeight: scrollY.interpolate({ inputRange: [0, H], outputRange: [H, 0], ...clamp }),
      largeOpacity: scrollY.interpolate({ inputRange: [0, H * 0.6], outputRange: [1, 0], ...clamp }),
      smallOpacity: scrollY.interpolate({ inputRange: [H * 0.6, H], outputRange: [0, 1], ...clamp }),
      border: scrollY.interpolate({ inputRange: large ? [H - 4, H] : [0, 4], outputRange: [0, 1], ...clamp }),
    };
  }, [scrollY, H, large]);
}

interface TitleBlockProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  centered: boolean;
  /** Ortalıda iki uçtan içeri çekme payı. */
  inset: number;
  hasLeading: boolean;
  opacity: Animatable;
  /** large'da küçük başlık görünmezken ekran okuyucu başlığı iki kez okumasın. */
  hidden: boolean;
  header: boolean;
  skeleton: boolean;
  m: NativeAppBarSize;
  theme: Theme;
}

function TitleBlock({ title, subtitle, centered, inset, hasLeading, opacity, hidden, header, skeleton, m, theme }: Readonly<TitleBlockProps>) {
  if (title == null && subtitle == null) return null;
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const textAlign = centered ? ("center" as const) : ("left" as const);
  const align = centered ? "center" : "flex-start";
  const frame: ViewStyle = centered ? { position: "absolute", left: inset, right: inset, top: 0, bottom: 0, alignItems: "center" } : { flex: 1, minWidth: 0, paddingLeft: hasLeading ? 4 : 12 };
  return (
    <Animated.View
      // Ortalıda başlık iki ucun üstüne yerleşir; uçlara dokunuşlar geçsin.
      pointerEvents="none"
      style={[frame, { justifyContent: "center", opacity }]}
      {...(hidden ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const } : null)}
    >
      {sk(skeleton, titleText(title, { fontFamily: font, fontSize: m.titleFontSize, lineHeight: m.titleLineHeight, fontWeight: "600", color: c.foreground, textAlign }, 1, header), m.titleFontSize, align)}
      {subtitle == null ? null : sk(skeleton, titleText(subtitle, { fontFamily: font, fontSize: m.subtitleFontSize, lineHeight: m.subtitleLineHeight, color: c.muted, textAlign }), m.subtitleFontSize, align)}
    </Animated.View>
  );
}

function LargeTitle({ title, height, opacity, skeleton, m, theme }: Readonly<{ title: React.ReactNode; height: Animatable; opacity: Animatable; skeleton: boolean; m: NativeAppBarSize; theme: Theme }>) {
  const style = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.largeTitleFontSize, lineHeight: m.largeTitleLineHeight, fontWeight: "700", color: theme.color.canvas.foreground };
  return (
    <Animated.View style={{ height, overflow: "hidden", justifyContent: "flex-end", paddingHorizontal: 16 }}>
      <Animated.View style={{ opacity, paddingBottom: 8 }}>{sk(skeleton, titleText(title, style, 1, true), m.largeTitleFontSize)}</Animated.View>
    </Animated.View>
  );
}

/** large'da küçük başlık yalnız daralınca görünür (scrollY yoksa hiç). */
function smallTitleOpacity(large: boolean, anim: ReturnType<typeof useCollapse>): Animatable {
  if (!large) return 1;
  return anim ? anim.smallOpacity : 0;
}

export function AppBar({
  title,
  subtitle,
  size = "small",
  titleAlign = Platform.OS === "ios" ? "center" : "start",
  onBack,
  backAccessibilityLabel = "Geri",
  leading,
  actions,
  topInset,
  scrollY,
  bordered,
  skeleton = false,
  style,
}: Readonly<AppBarProps>) {
  const theme = useTheme();
  const m = useNativeConfig().appBar;
  const safe = useSafeInsets();
  const c = theme.color.canvas;
  const large = size === "large";
  const centered = titleAlign === "center";
  // Ortalı başlık iki ucun genişini kadar içeri çekilir → gerçekten ortada kalır, uçlarla çakışmaz.
  const [sides, setSides] = useState({ left: 0, right: 0 });
  // Genişlik güncelleyiciden ÖNCE okunur: iOS olay nesnesini hemen boşaltır (güncelleyici sonra çalışır).
  const measure = (side: "left" | "right", width: number) =>
    setSides((s) => {
      if (s[side] === width) return s;
      return { ...s, [side]: width };
    });
  const anim = useCollapse(scrollY, m.largeAreaHeight, large);

  const leadNode = leading !== undefined || !onBack ? leading : <AppBarAction icon={({ color }) => <ChevronLeftIcon size={m.iconSize + 4} color={color} />} accessibilityLabel={backAccessibilityLabel} onPress={onBack} />;
  const titleBlock = (
    <TitleBlock
      title={title}
      subtitle={subtitle}
      centered={centered}
      // Mutlak konum satırın iç dolgusunu (4) saymaz.
      inset={Math.max(sides.left, sides.right) + 4}
      hasLeading={leadNode != null}
      opacity={smallTitleOpacity(large, anim)}
      hidden={large && !anim}
      header={!large}
      skeleton={skeleton}
      m={m}
      theme={theme}
    />
  );
  const sideStyle: ViewStyle = { flexDirection: "row", alignItems: "center", minWidth: centered ? m.actionSize : 0 };
  const showBorder = bordered ?? anim != null;
  const borderOpacity: Animatable = bordered === undefined && anim ? anim.border : 1;

  return (
    <AppBarContext.Provider value={{ skeleton, m, theme }}>
      <View style={[{ alignSelf: "stretch", backgroundColor: c.surface, paddingTop: topInset ?? safe?.top ?? 0 }, style]}>
        <View style={{ height: m.height, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
          {centered ? titleBlock : null}
          <View onLayout={(e) => measure("left", e.nativeEvent.layout.width)} style={sideStyle}>
            {leadNode}
          </View>
          {centered ? <View style={{ flex: 1 }} /> : titleBlock}
          <View onLayout={(e) => measure("right", e.nativeEvent.layout.width)} style={[sideStyle, { justifyContent: "flex-end" }]}>
            {actions}
          </View>
        </View>
        {large ? <LargeTitle title={title} height={anim ? anim.areaHeight : m.largeAreaHeight} opacity={anim ? anim.largeOpacity : 1} skeleton={skeleton} m={m} theme={theme} /> : null}
        {showBorder ? <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, backgroundColor: c.border, opacity: borderOpacity }} /> : null}
      </View>
    </AppBarContext.Provider>
  );
}
