import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, type GestureResponderHandlers, Platform, Pressable, StatusBar, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeSidebarSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useSafeInsets } from "../theme/insets";
import { Badge } from "../Badge";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../lib/icons";
import { SkeletonBox, SkeletonText, useReduceMotion } from "../lib/Skeleton";
import { backLabel, containsKey, findActiveKey, isBranch, levelItems } from "./sidebarUtils";
import type { SidebarBaseProps, SidebarHeaderInk, SidebarItem } from "./types";

/** Sidebar ve SidebarLayout'un ortak iç parçaları (paket dışına açılmaz). */

const OPEN_MS = 260;
const FALLBACK_TOP = Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24);
const FALLBACK_BOTTOM = Platform.OS === "ios" ? 28 : 0;
const SWIPE_CLOSE_RATIO = 0.33;
export const isWeb = Platform.OS === "web";

/**
 * Açılma ilerlemesi 0 → 1 (yerel sürücü: transform + opaklık).
 * HER AÇILIŞTA TAZE değer — BottomSheet'teki iOS hatası: Modal sökülünce
 * Animated değeri grafikten kopar, aynı değerle ikinci açılış görünmez kalır.
 */
export function useDrawerMotion(open: boolean) {
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  const fresh = useRef(progress);
  const [mounted, setMounted] = useState(open);
  const reduce = useReduceMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const animateTo = (target: Animated.Value, to: number, done?: () => void) => {
    if (reduceRef.current) {
      target.setValue(to);
      done?.();
      return;
    }
    Animated.timing(target, { toValue: to, duration: OPEN_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => finished && done?.());
  };

  useEffect(() => {
    if (open) {
      const next = new Animated.Value(0);
      fresh.current = next;
      setProgress(next);
      setMounted(true);
      return;
    }
    animateTo(progress, 0, () => setMounted(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Açılış animasyonu yalnız taze değer çizime girdikten SONRA (BottomSheet ile
  // aynı): görünüme bağlanmamış değerde başlatılan animasyon iOS'ta görünüme ulaşmıyordu.
  useEffect(() => {
    if (open && mounted && progress === fresh.current) animateTo(progress, 1);
  }, [open, mounted, progress]);

  return { progress, mounted, settleOpen: () => animateTo(progress, 1) };
}

/**
 * Paneli kapanma yönüne sürükleme. Responder BİR KEZ yaratılır, güncel
 * değerleri ref'ten okur (BottomSheet dersi: her çizimde yeniden yaratmak
 * sürüklemeyi ortasında koparıyordu). Yalnız yatay ve kapanma yönündeki
 * çekiş alınır — dikey kaydırma listeye kalır.
 */
export function useSwipeToClose(motion: ReturnType<typeof useDrawerMotion>, width: number, side: "left" | "right", onClose: () => void, enabled: boolean): { panHandlers: GestureResponderHandlers } {
  const live = useRef({ motion, width, side, onClose, enabled });
  live.current = { motion, width, side, onClose, enabled };
  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => {
          if (!live.current.enabled) return false;
          const dir = live.current.side === "left" ? -1 : 1;
          return Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.sign(g.dx) === dir;
        },
        onPanResponderMove: (_e, g) => {
          const { motion: m, width: w, side: s } = live.current;
          const pulled = s === "left" ? -g.dx : g.dx;
          m.progress.setValue(Math.max(0, Math.min(1, 1 - pulled / w)));
        },
        onPanResponderRelease: (_e, g) => {
          const { motion: m, width: w, side: s, onClose: close } = live.current;
          const pulled = s === "left" ? -g.dx : g.dx;
          const fling = (s === "left" ? -g.vx : g.vx) > 0.5;
          if (pulled > w * SWIPE_CLOSE_RATIO || fling) close();
          else m.settleOpen();
        },
        onPanResponderTerminate: () => live.current.motion.settleOpen(),
      }),
    []
  );
}

interface LevelProps {
  items: SidebarItem[];
  trail: SidebarItem[];
  activeKey: string | null;
  color: ColorRole;
  rootLabel: string;
  seeAllLabel: string;
  skeleton: boolean;
  onDrill: (item: SidebarItem) => void;
  onBack: () => void;
  onLeaf: (item: SidebarItem) => void;
  m: NativeSidebarSize;
  theme: Theme;
}

/** Seviye geçişi: yeni seviye hafifçe yandan kayarak gelir (web `starting:` ile aynı). */
function useLevelEnter() {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: reduce ? 0 : 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, reduce]);
  return { opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] };
}

function rowText(theme: Theme, m: NativeSidebarSize) {
  return { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.fontSize, lineHeight: m.lineHeight };
}

/** Serbest içerik (başlık bandı) kutu olarak; metin satırları ince çubuk — alt alta yapışmasın. */
const skBox = (on: boolean, node: React.ReactNode) => (on ? <SkeletonBox style={{ borderRadius: 4 }}>{node}</SkeletonBox> : node);
const skText = (on: boolean, fontSize: number, node: React.ReactNode) => (on ? <SkeletonText fontSize={fontSize}>{node}</SkeletonText> : node);

function LevelHeader({ trail, rootLabel, seeAllLabel, color, skeleton, onBack, onLeaf, m, theme }: Pick<LevelProps, "trail" | "rootLabel" | "seeAllLabel" | "color" | "skeleton" | "onBack" | "onLeaf" | "m" | "theme">) {
  const parent = trail[trail.length - 1];
  if (!parent) return null;
  const c = theme.color.canvas;
  const back = backLabel(trail, rootLabel);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Geri: ${back}`}
        disabled={skeleton}
        onPress={onBack}
        style={({ pressed }) => ({ minHeight: m.rowMinHeight, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: m.paddingHorizontal, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: pressed ? c.surfaceAlt : "transparent" })}
      >
        <ChevronLeftIcon size={18} color={c.muted} />
        {skText(skeleton, m.fontSize, <Text style={[rowText(theme, m), { color: c.muted, fontWeight: "500" }]}>{back}</Text>)}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: m.paddingHorizontal, paddingTop: 16, paddingBottom: 8 }}>
        {skText(skeleton, m.fontSize, <Text accessibilityRole="header" numberOfLines={2} style={[rowText(theme, m), { flexShrink: 1, fontWeight: "600", color: c.foreground }]}>{parent.title}</Text>)}
        {parent.route && !skeleton ? (
          <Pressable accessibilityRole="link" accessibilityLabel={`${seeAllLabel}: ${parent.title}`} onPress={() => onLeaf(parent)} hitSlop={12}>
            <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 15, fontWeight: "500", color: theme.color[color].text }}>{seeAllLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

function Heading({ title, first, m, theme }: { title: string; first: boolean; m: NativeSidebarSize; theme: Theme }) {
  const c = theme.color.canvas;
  // Amazon çekmecesi: her bölüm ayraçla ayrılır, başlığı kalın ve okunur (soluk küçük etiket değil).
  return (
    <View style={[{ paddingHorizontal: m.paddingHorizontal, paddingTop: first ? 12 : 16, paddingBottom: 4 }, first ? null : { marginTop: 8, borderTopWidth: 1, borderTopColor: c.border }]}>
      <Text accessibilityRole="header" style={[rowText(theme, m), { fontWeight: "600", color: c.foreground }]}>{title}</Text>
    </View>
  );
}

function rowIcon(item: SidebarItem, active: boolean, ink: string, reserve: boolean, skeleton: boolean, m: NativeSidebarSize) {
  if (!item.icon) return reserve ? <View style={{ width: m.iconSize }} /> : null;
  if (skeleton) return <SkeletonBox style={{ width: m.iconSize, height: m.iconSize, borderRadius: m.iconSize / 2 }} />;
  const node = typeof item.icon === "function" ? item.icon({ active, color: ink, size: m.iconSize }) : item.icon;
  return <View style={{ width: m.iconSize, alignItems: "center" }}>{node}</View>;
}

function rowBadge(badge: SidebarItem["badge"], skeleton: boolean) {
  if (badge === undefined || badge === false || skeleton) return null;
  return badge === true ? <Badge dot /> : <Badge count={badge} />;
}

function rowBackground(active: boolean, pressed: boolean, color: ColorRole, theme: Theme): string {
  if (active) return theme.color[color].subtle;
  return pressed ? theme.color.canvas.surfaceAlt : "transparent";
}

function Row({ item, active, reserveIcon, color, skeleton, onPress, m, theme }: { item: SidebarItem; active: boolean; reserveIcon: boolean; color: ColorRole; skeleton: boolean; onPress: () => void; m: NativeSidebarSize; theme: Theme }) {
  const c = theme.color.canvas;
  const branch = isBranch(item);
  const disabled = item.disabled ?? false;
  const ink = active ? theme.color[color].text : c.foreground;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={branch ? "Alt menüyü açar" : undefined}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled || skeleton}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: m.rowMinHeight,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: m.paddingHorizontal,
        paddingVertical: 8,
        opacity: disabled ? 0.45 : 1,
        backgroundColor: rowBackground(active, pressed, color, theme),
      })}
    >
      {rowIcon(item, active, active ? ink : c.muted, reserveIcon, skeleton, m)}
      <View style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
        {skText(skeleton, m.fontSize, <Text numberOfLines={1} style={[rowText(theme, m), { color: ink, fontWeight: active ? "600" : "400" }]}>{item.title}</Text>)}
        {item.description ? skText(skeleton, 13, <Text numberOfLines={1} style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 13, lineHeight: 18, color: c.muted }}>{item.description}</Text>) : null}
      </View>
      {rowBadge(item.badge, skeleton)}
      {branch ? <ChevronRightIcon size={18} color={c.muted} /> : null}
    </Pressable>
  );
}

const STAGGER_ROW_MS = 220;
const STAGGER_STEP_MS = 35;
/** Bu sıradan sonraki satırlar birlikte gelir — uzun listede son satır beklemesin. */
const STAGGER_MAX = 10;

/**
 * Satırların sırayla gelmesi: tek bir değer 0 → 1 akar, her satır kendi
 * aralığında belirip yandan kayar (yerel sürücü, satır başına zamanlayıcı yok).
 */
function useStagger(count: number, enabled: boolean) {
  const reduce = useReduceMotion();
  const on = enabled && !reduce;
  const v = useRef(new Animated.Value(on ? 0 : 1)).current;
  const total = STAGGER_ROW_MS + STAGGER_STEP_MS * Math.min(count, STAGGER_MAX);
  useEffect(() => {
    if (!on) return;
    Animated.timing(v, { toValue: 1, duration: total, easing: Easing.linear, useNativeDriver: true }).start();
    // Yalnız seviye ilk çizildiğinde (seviye anahtarla yeniden kurulur).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (index: number) => {
    if (!on) return null;
    const start = (Math.min(index, STAGGER_MAX) * STAGGER_STEP_MS) / total;
    const p = v.interpolate({ inputRange: [start, Math.min(1, start + STAGGER_ROW_MS / total)], outputRange: [0, 1], extrapolate: "clamp" });
    const ease = p.interpolate({ inputRange: [0, 1], outputRange: [0, 1], easing: Easing.out(Easing.cubic) });
    return { opacity: ease, transform: [{ translateX: ease.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] };
  };
}

function Level(props: LevelProps & { stagger: boolean }) {
  const { items, activeKey, color, skeleton, onDrill, onLeaf, m, theme, stagger } = props;
  const enter = useLevelEnter();
  const rowStyle = useStagger(items.length + 1, stagger);
  // Seviyede ikonlu bir kardeş varsa ikonsuz satırlar da aynı yeri ayırır — başlıklar tek hizada.
  const reserveIcon = items.some((i) => i.icon && !i.heading);
  return (
    // Sırayla gelişte seviye bütün olarak kaymaz — satırlar kendisi gelir.
    <Animated.View style={[{ paddingBottom: 16 }, stagger ? null : enter]}>
      <Animated.View style={rowStyle(0)}>
        <LevelHeader {...props} />
      </Animated.View>
      {items.map((item, index) => (
        <Animated.View key={item.key} style={rowStyle(index + 1)}>
          {item.heading ? (
            <Heading title={item.title} first={index === 0} m={m} theme={theme} />
          ) : (
            <Row item={item} active={containsKey(item, activeKey)} reserveIcon={reserveIcon} color={color} skeleton={skeleton} m={m} theme={theme} onPress={() => (isBranch(item) ? onDrill(item) : onLeaf(item))} />
          )}
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function HeaderBand({ header, emphasized, color, topInset, onClose, skeleton, theme }: { header: SidebarBaseProps["header"]; emphasized: boolean; color: ColorRole; topInset: number; onClose: () => void; skeleton: boolean; theme: Theme }) {
  const c = theme.color.canvas;
  const ink: SidebarHeaderInk = emphasized ? { color: theme.color[color].solidContrast, muted: theme.color[color].solidContrast } : { color: c.foreground, muted: c.muted };
  const content = typeof header === "function" ? header(ink) : header;
  return (
    <View style={[{ paddingTop: topInset, flexDirection: "row", alignItems: "center", minHeight: 56 + topInset, paddingLeft: 16, paddingRight: 4, gap: 8 }, emphasized ? { backgroundColor: theme.color[color].solid } : { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <View style={{ flex: 1, minWidth: 0, paddingVertical: 12 }}>{content == null ? null : skBox(skeleton, content)}</View>
      <Pressable accessibilityRole="button" accessibilityLabel="Menüyü kapat" onPress={onClose} hitSlop={4} style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.5 : 1 })}>
        <XIcon size={22} color={ink.color} />
      </Pressable>
    </View>
  );
}

/** Menü durumu: içine girilen yol, aktif öğe, geri / yaprak seçimi (her açılış kökten). */
export function useSidebarState(props: SidebarBaseProps) {
  const { data, open, onOpenChange, currentPath, activeKey, onNavigate, onSelect } = props;
  const [trail, setTrail] = useState<SidebarItem[]>([]);
  useEffect(() => {
    if (open) setTrail([]);
  }, [open]);
  const close = () => onOpenChange(false);
  const back = () => setTrail((t) => t.slice(0, -1));
  return {
    trail,
    close,
    back,
    drill: (item: SidebarItem) => setTrail((t) => [...t, item]),
    // Android geri / VoiceOver "geri": önce bir seviye yukarı, kökte kapat.
    requestBack: () => (trail.length > 0 ? back() : close()),
    leaf: (item: SidebarItem) => {
      if (item.route) onNavigate?.(item.route, item);
      onSelect?.(item);
      close();
    },
    active: activeKey ?? findActiveKey(data, currentPath),
  };
}

export type SidebarState = ReturnType<typeof useSidebarState>;

/** Güvenli alan: prop → ThemeProvider insets → platform tahmini. */
export function useSidebarInsets(props: SidebarBaseProps) {
  const safe = useSafeInsets();
  return { top: props.topInset ?? safe?.top ?? FALLBACK_TOP, bottom: props.bottomInset ?? safe?.bottom ?? FALLBACK_BOTTOM };
}

/** Panelin içi: başlık bandı + kayan seviye + alt bölüm. */
export function DrawerBody({ props, state, insets }: { props: SidebarBaseProps; state: SidebarState; insets: { top: number; bottom: number } }) {
  const theme = useTheme();
  const m = useNativeConfig().sidebar;
  const { color = "primary", skeleton = false, footer } = props;
  const c = theme.color.canvas;
  const levelKey = state.trail.map((t) => t.key).join("/") || "root";
  return (
    <>
      <HeaderBand header={props.header} emphasized={props.emphasizedHeader ?? false} color={color} topInset={insets.top} onClose={state.close} skeleton={skeleton} theme={theme} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={footer == null ? { paddingBottom: insets.bottom } : undefined}>
        <Level
          key={levelKey}
          items={levelItems(props.data, state.trail)}
          trail={state.trail}
          activeKey={state.active}
          color={color}
          rootLabel={props.rootLabel ?? "Ana Menü"}
          seeAllLabel={props.seeAllLabel ?? "Tümünü gör"}
          skeleton={skeleton}
          stagger={props.staggerItems ?? false}
          onDrill={state.drill}
          onBack={state.back}
          onLeaf={state.leaf}
          m={m}
          theme={theme}
        />
      </ScrollView>
      {footer == null ? null : <View style={{ borderTopWidth: 1, borderTopColor: c.border, paddingBottom: insets.bottom }}>{footer}</View>}
    </>
  );
}

/** Panel genişliği: ekran oranı, en fazla `maxWidth`. */
export function useDrawerWidth(cap?: number) {
  const m = useNativeConfig().sidebar;
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth * m.widthRatio, m.maxWidth, cap === undefined ? Infinity : screenWidth * cap);
  return { width, screenWidth };
}
