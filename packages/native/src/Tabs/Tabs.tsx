import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View, type LayoutRectangle, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeTabsSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { shadowStyle } from "../theme/effects";
import { useMotionScale, useTheme } from "../theme/useTheme";
import { InertView } from "../lib/InertView";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";

/** `line`: alt çizgili (varsayılan). `card`: kart sekmeler. `pills`: kayan zeminli segmented. */
export type TabsVariant = "line" | "card" | "pills";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabsProps extends SkeletonableProps {
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (value: string) => void;
  /** Aktif sekme göstergesinin rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  variant?: TabsVariant;
  /** Sekme yüksekliği sm 36 · md 44 · lg 48. */
  size?: Size;
  /** `vertical`: sekmeler solda, içerik sağda. */
  orientation?: TabsOrientation;
  /** Dikey Tabs bu genişliğin (pt) altında yataya döner. `false` kapatır. Varsayılan: `640`. */
  responsive?: number | false;
  /** Sekmeler tüm genişliğe eşit dağılır. */
  fill?: boolean;
  align?: "start" | "center";
  /** Pasif paneller çizili kalır (gizli) — içlerindeki form durumu kaybolmaz. */
  keepMounted?: boolean;
  /** Web'de klavye etkinleştirme kipi; native'de ok tuşu yok — yok sayılır. */
  activationMode?: "automatic" | "manual";
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export interface TabsListProps {
  children: React.ReactNode;
  /** Sekme çubuğunun sonunda ek içerik (ör. düğme). */
  extra?: React.ReactNode;
  /** Sekme grubunun erişilebilir adı. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export interface TabsTriggerState {
  active: boolean;
  /** O anki etiket rengi — ikonu boyamak için. */
  color: string;
}

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  /** Etiketin önündeki ikon; fonksiyon verilirse etiket rengini alır (RN'de `currentColor` yok). */
  icon?: React.ReactNode | ((state: TabsTriggerState) => React.ReactNode);
  /** Etiketin yanında sayı rozeti. */
  count?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  /** Pasifken de çizili kalsın (`keepMounted`'ı panel bazında açar). */
  forceMount?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface TabsContextValue {
  active: string | undefined;
  select: (value: string) => void;
  color: ColorRole;
  variant: TabsVariant;
  orientation: TabsOrientation;
  fill: boolean;
  align: "start" | "center";
  keepMounted: boolean;
  skeleton: boolean;
  m: NativeTabsSize;
  theme: Theme;
  layouts: Record<string, LayoutRectangle>;
  report: (value: string, rect: LayoutRectangle) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsList / TabsTrigger / TabsContent bir <Tabs> içinde kullanılmalı.");
  return ctx;
}

const HIDDEN_A11Y = { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };

export function Tabs({
  defaultActiveTab,
  activeTab,
  onChange,
  color = "primary",
  variant = "line",
  size = "md",
  orientation = "horizontal",
  responsive = 640,
  fill = false,
  align = "start",
  keepMounted = false,
  skeleton = false,
  style,
  children,
}: TabsProps) {
  const theme = useTheme();
  const m = useNativeConfig().tabs[size];
  const [active, setActive] = useControllable<string | undefined>(activeTab, defaultActiveTab);
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const [width, setWidth] = useState<number>();
  // Dar kapsayıcıda dikey Tabs yataya döner (sol sütun içeriği ezmesin) — telefonda hep.
  const narrow = responsive !== false && width !== undefined && width < responsive;
  const effective: TabsOrientation = orientation === "vertical" && !narrow ? "vertical" : "horizontal";

  const value = useMemo<TabsContextValue>(
    () => ({
      active,
      select: (v) => {
        if (skeleton || v === active) return;
        setActive(v);
        onChange?.(v);
      },
      color,
      variant,
      orientation: effective,
      fill,
      align,
      keepMounted,
      skeleton,
      m,
      theme,
      layouts,
      report: (v, rect) =>
        setLayouts((prev) => {
          const p = prev[v];
          return p && p.x === rect.x && p.y === rect.y && p.width === rect.width && p.height === rect.height ? prev : { ...prev, [v]: rect };
        }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, color, variant, effective, fill, align, keepMounted, skeleton, m, theme, layouts, onChange]
  );

  return (
    <TabsContext.Provider value={value}>
      <View
        onLayout={orientation === "vertical" ? (e) => setWidth(e.nativeEvent.layout.width) : undefined}
        style={[{ alignSelf: "stretch" }, effective === "vertical" ? { flexDirection: "row", gap: 24 } : { gap: 16 }, style]}
      >
        {children}
      </View>
    </TabsContext.Provider>
  );
}

/** Aktif sekmenin altında kayan gösterge (çizgi) ya da zemin (pills); ilk yerleşim ve hareket azaltmada anlık. */
function useIndicator(rect: LayoutRectangle | undefined, vertical: boolean) {
  const motion = useMotionScale();
  const reduce = useReduceMotion();
  const pos = useRef(new Animated.Value(0)).current;
  const len = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  useEffect(() => {
    if (!rect) return;
    const to = vertical ? { p: rect.y, l: rect.height } : { p: rect.x, l: rect.width };
    if (!placed.current || reduce) {
      pos.setValue(to.p);
      len.setValue(to.l);
      placed.current = true;
      return;
    }
    const timing = (v: Animated.Value, toValue: number) => Animated.timing(v, { toValue, duration: Math.round(220 * motion), easing: Easing.out(Easing.cubic), useNativeDriver: false });
    Animated.parallel([timing(pos, to.p), timing(len, to.l)]).start();
  }, [rect, vertical, reduce, pos, len, motion]);
  return { pos, len };
}

/** Sekmeler arası boşluk: line yatayda geniş (göstergeler ayrışsın), pills/card dar, fill'de yok. */
function listGap(variant: TabsVariant, vertical: boolean, fill: boolean, m: NativeTabsSize): number {
  if (variant === "pills") return 4;
  if (fill && !vertical) return 0;
  if (variant === "line") return vertical ? 4 : m.paddingHorizontal + 8;
  return 2;
}

/** Sekme dizisinin ekseni: dikeyde sütun (tam genişlik), yatayda satır (ortalı). */
function axisStyle(vertical: boolean): ViewStyle {
  return vertical ? { flexDirection: "column", alignItems: "stretch" } : { flexDirection: "row", alignItems: "center" };
}

/** Taban çizgisi (line/card): göstergenin altında kalan 1pt hat; pills'te yok. */
function barStyle(variant: TabsVariant, vertical: boolean, border: string): ViewStyle | null {
  if (variant === "pills") return null;
  return vertical ? { borderRightWidth: 1, borderRightColor: border } : { borderBottomWidth: 1, borderBottomColor: border };
}

/** Aktif sekmenin göstergesi: line'da 2pt çizgi, pills'te kayan yüzey; card'da yok (sekme kendisi yüzey). */
function Indicator({ rect, vertical, variant, color, theme }: { rect: LayoutRectangle | undefined; vertical: boolean; variant: TabsVariant; color: ColorRole; theme: Theme }) {
  const { pos, len } = useIndicator(rect, vertical);
  if (!rect || variant === "card") return null;
  const c = theme.color.canvas;
  if (variant === "pills") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", borderRadius: toPx(theme.radius.md), backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, ...shadowStyle(theme, { opacity: 0.08, radius: 3, offsetY: 1, elevation: 1 }) },
          vertical ? { left: rect.x, width: rect.width, top: pos, height: len } : { top: rect.y, height: rect.height, left: pos, width: len },
        ]}
      />
    );
  }
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", backgroundColor: theme.color[color].solid, borderRadius: 1 }, vertical ? { right: 0, width: 2, top: pos, height: len } : { bottom: 0, height: 2, left: pos, width: len }]} />;
}

/** Kayan şeritte aktif sekmeyi görünür alana getirir (yalnız şerit, sayfa değil). */
function useStripScroll(rect: LayoutRectangle | undefined, enabled: boolean) {
  // Yalnız scrollTo gerekiyor; RN sürümleri arasında ScrollView ref tipi değiştiği için en küçük arayüz.
  const scroller = useRef<{ scrollTo: (options: { x: number; animated?: boolean }) => void } | null>(null);
  const [viewport, setViewport] = useState(0);
  const scrollX = useRef(0);
  useEffect(() => {
    if (!enabled || !rect || viewport === 0) return;
    const pad = 24;
    if (rect.x - pad < scrollX.current) scroller.current?.scrollTo({ x: Math.max(0, rect.x - pad), animated: true });
    else if (rect.x + rect.width + pad > scrollX.current + viewport) scroller.current?.scrollTo({ x: rect.x + rect.width + pad - viewport, animated: true });
  }, [rect, enabled, viewport]);
  return { scroller, setViewport, onScroll: (x: number) => (scrollX.current = x) };
}

export function TabsList({ children, extra, accessibilityLabel, style }: TabsListProps) {
  const { active, variant, orientation, fill, align, skeleton, m, theme, layouts, color } = useTabs();
  const vertical = orientation === "vertical";
  const c = theme.color.canvas;
  const rect = active ? layouts[active] : undefined;
  const scrolls = !vertical && !fill;
  const strip = useStripScroll(rect, scrolls);
  const centered = align === "center" && !vertical;

  const axis = axisStyle(vertical);
  const row: ViewStyle = { ...axis, gap: listGap(variant, vertical, fill, m), justifyContent: centered ? "center" : "flex-start", ...(fill && !vertical ? { flex: 1 } : null) };
  const track: ViewStyle | null = variant === "pills" ? { padding: 4, borderRadius: toPx(theme.radius.lg), backgroundColor: c.surfaceAlt } : null;

  const content = (
    <View style={[row, track]}>
      {skeleton ? null : <Indicator rect={rect} vertical={vertical} variant={variant} color={color} theme={theme} />}
      {children}
    </View>
  );

  return (
    <InertView hidden={skeleton} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} aria-label={accessibilityLabel} style={[axis, barStyle(variant, vertical, c.border), vertical ? { alignSelf: "flex-start" } : null, style]}>
      {scrolls ? (
        <ScrollView
          ref={strip.scroller as never}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => strip.setViewport(e.nativeEvent.layout.width)}
          onScroll={(e) => strip.onScroll(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={32}
          style={{ flex: 1 }}
          contentContainerStyle={centered ? { flexGrow: 1, justifyContent: "center" } : undefined}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {extra == null ? null : <View style={{ paddingLeft: 12 }}>{extra}</View>}
    </InertView>
  );
}

/** Kart sekme: üst (dikeyde sol) köşeler yuvarlak; aktif olan içerik yüzeyiyle birleşir. */
function cardFrame(vertical: boolean, active: boolean, m: NativeTabsSize, theme: Theme): ViewStyle {
  const c = theme.color.canvas;
  const radius = toPx(theme.radius.lg);
  const join = active ? -1 : 0;
  const shape: ViewStyle = vertical
    ? { borderRightWidth: 0, borderTopLeftRadius: radius, borderBottomLeftRadius: radius, marginRight: join }
    : { borderBottomWidth: 0, borderTopLeftRadius: radius, borderTopRightRadius: radius, marginBottom: join, paddingBottom: -join };
  return { paddingHorizontal: m.paddingHorizontal, borderWidth: 1, borderColor: c.border, backgroundColor: active ? c.surface : c.surfaceAlt, ...shape };
}

function triggerFrame(variant: TabsVariant, vertical: boolean, active: boolean, m: NativeTabsSize, theme: Theme, fill: boolean): ViewStyle {
  const base: ViewStyle = { minHeight: m.height, flexDirection: "row", alignItems: "center", gap: 8, justifyContent: vertical ? "flex-start" : "center", ...(fill && !vertical ? { flex: 1 } : null) };
  if (variant === "card") return { ...base, ...cardFrame(vertical, active, m, theme) };
  if (variant === "pills") return { ...base, minHeight: m.height - 8, paddingHorizontal: m.paddingHorizontal - 4, borderRadius: toPx(theme.radius.md) };
  return { ...base, paddingHorizontal: vertical ? m.paddingHorizontal : 4 };
}

export function TabsTrigger({ children, value, icon, count, disabled = false, style }: TabsTriggerProps) {
  const { active, select, color, variant, orientation, fill, skeleton, m, theme, report } = useTabs();
  const on = active === value;
  const vertical = orientation === "vertical";
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  // pills'te aktif metin ön plan; line/card'da rol rengi.
  let ink = c.muted;
  if (on) ink = variant === "pills" ? c.foreground : theme.color[color].text;
  const label = typeof children === "string" || typeof children === "number" ? (
    <Text numberOfLines={1} style={{ fontFamily: font, fontSize: m.fontSize, fontWeight: on ? "600" : "500", color: ink }}>{children}</Text>
  ) : (
    children
  );
  const iconNode = typeof icon === "function" ? icon({ active: on, color: ink }) : icon;
  const countBox = count !== undefined ? (
    <View style={{ minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? theme.color[color].subtle : theme.color.neutral.subtle }}>
      <Text style={{ fontFamily: font, fontSize: 12, fontWeight: "500", color: on ? theme.color[color].subtleContrast : c.muted, fontVariant: ["tabular-nums"] }}>{count}</Text>
    </View>
  ) : null;
  const sk = (node: React.ReactNode) => (skeleton && node != null ? <SkeletonBox style={{ borderRadius: 4 }}>{node}</SkeletonBox> : node);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: on, disabled }}
      aria-selected={on}
      aria-disabled={disabled || undefined}
      disabled={disabled || skeleton}
      onLayout={(e) => report(value, e.nativeEvent.layout)}
      onPress={() => select(value)}
      style={({ pressed }) => [triggerFrame(variant, vertical, on, m, theme, fill), { opacity: (disabled ? 0.4 : 1) * (pressed && !on ? 0.6 : 1) }, style]}
    >
      {sk(iconNode)}
      {sk(label)}
      {sk(countBox)}
    </Pressable>
  );
}

/** Aktif sekmenin paneli. Pasif paneller kaldırılır (`keepMounted` / `forceMount`: gizli tutulur). */
export function TabsContent({ children, value, forceMount = false, style }: TabsContentProps) {
  const { active, keepMounted, skeleton, theme } = useTabs();
  const on = active === value;
  const [visited, setVisited] = useState(on);
  useEffect(() => {
    if (on) setVisited(true);
  }, [on]);
  const keep = forceMount || keepMounted;
  if (!on && !(keep && (visited || forceMount))) return null;
  const body = typeof children === "string" || typeof children === "number" ? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 15, lineHeight: 20, color: theme.color.canvas.foreground }}>{children}</Text> : children;
  return (
    <View accessibilityRole="none" style={[{ flex: 1, minWidth: 0 }, on ? null : { display: "none" }, style]} {...(on && !skeleton ? null : HIDDEN_A11Y)}>
      {skeleton ? <SkeletonBox style={{ borderRadius: 4 }}>{body}</SkeletonBox> : body}
    </View>
  );
}
