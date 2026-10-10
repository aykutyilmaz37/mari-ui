import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal as RNModal, PanResponder, Platform, Pressable, StatusBar, ScrollView, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeSidebarSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useSafeInsets } from "../theme/insets";
import { Badge } from "../Badge";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../lib/icons";
import { overlaySurface, scrimColor } from "../lib/overlay";
import { SkeletonBox, SkeletonText, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { backLabel, containsKey, findActiveKey, isBranch, levelItems } from "./sidebarUtils";

export interface SidebarIconState {
  active: boolean;
  /** O anki ikon rengi (RN'de `currentColor` yok). */
  color: string;
  size: number;
}

/** Web `MenuItemType` ile aynı şekil (`promoTiles`, `target` yok — native'de anlamsız). */
export interface SidebarItem {
  key: string;
  title: string;
  description?: string;
  icon?: React.ReactNode | ((state: SidebarIconState) => React.ReactNode);
  route?: string;
  children?: SidebarItem[];
  /** Etkileşimsiz bölüm başlığı; gruplama dizide ondan sonra gelen kardeşlerle. */
  heading?: boolean;
  disabled?: boolean;
  /** Sayı rozeti; `true` nokta. */
  badge?: number | boolean;
}

/**
 * Açılış animasyonu. `slide`: yandan kayar (kenara kaydırarak kapatma yalnız
 * bunda). `fade`: yerinde belirir, hafif yukarı süzülür. `scale`: hafif
 * büyüyerek belirir. `slideUp` / `slideDown`: alttan / üstten tam boy gelir.
 */
export type SidebarAnimation = "slide" | "fade" | "scale" | "slideUp" | "slideDown";

export interface SidebarHeaderInk {
  /** Başlık bandındaki metin rengi (`emphasizedHeader`da rol renginin karşıtı). */
  color: string;
  muted: string;
}

export interface SidebarProps extends SkeletonableProps {
  data: SidebarItem[];
  open: boolean;
  /** Kapatma isteği: karartma, kapatma düğmesi, kenara kaydırma, Android geri, öğe seçimi. */
  onOpenChange: (open: boolean) => void;
  /** Aktif öğeyi bulmak için mevcut yol (React Navigation'da rota adı / yolu). */
  currentPath?: string;
  /** Aktif öğe anahtarı — `currentPath`'i ezer. */
  activeKey?: string;
  /** Yol taşıyan yaprak seçilince (kapanmadan önce). Yönlendiriciye burada gidin. */
  onNavigate?: (route: string, item: SidebarItem) => void;
  /** Herhangi bir yaprak seçilince (yolu olmasa da). */
  onSelect?: (item: SidebarItem) => void;
  /** Panelin üstü (ör. Avatar + "Merhaba, Deniz"). Fonksiyon verilirse bant renklerini alır. */
  header?: React.ReactNode | ((ink: SidebarHeaderInk) => React.ReactNode);
  /** Başlık bandı rol renginde dolgulu (Amazon çekmecesi). */
  emphasizedHeader?: boolean;
  /** Panelin altında sabit bölüm (ör. Çıkış yap). */
  footer?: React.ReactNode;
  /** Varsayılan: `left`. */
  position?: "left" | "right";
  /** Açılış / kapanış animasyonu. Varsayılan: `slide`. */
  animation?: SidebarAnimation;
  /** Aktif öğe rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Kök seviyesine dönen satırın etiketi. Varsayılan: "Ana Menü". */
  rootLabel?: string;
  /** Üst seviyenin yolu varsa başlığın yanındaki bağlantı. Varsayılan: "Tümünü gör". */
  seeAllLabel?: string;
  /** Gezinme bölgesinin erişilebilir adı. Varsayılan: "Ana menü". */
  accessibilityLabel?: string;
  /**
   * Üst / alt güvenli alan payı. Varsayılan: `ThemeProvider insets`; o da yoksa
   * platform tahmini (iOS üst 54 / alt 28, Android durum çubuğu). Çekmece tam
   * ekran Modal'dır — uygulamanın SafeAreaView'u içine işlemez.
   */
  topInset?: number;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
}

const OPEN_MS = 260;
const FALLBACK_TOP = Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24);
const FALLBACK_BOTTOM = Platform.OS === "ios" ? 28 : 0;
const SWIPE_CLOSE_RATIO = 0.33;

/**
 * Açılma ilerlemesi 0 → 1 (yerel sürücü: transform + opaklık).
 * HER AÇILIŞTA TAZE değer — BottomSheet'teki iOS hatası: Modal sökülünce
 * Animated değeri grafikten kopar, aynı değerle ikinci açılış görünmez kalır.
 */
function useDrawerMotion(open: boolean) {
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
function useSwipeToClose(motion: ReturnType<typeof useDrawerMotion>, width: number, side: "left" | "right", onClose: () => void, enabled: boolean) {
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

/** İlerlemeden (0 kapalı → 1 açık) panelin dönüşümü / opaklığı — hepsi yerel sürücüde. */
function panelMotion(animation: SidebarAnimation, progress: Animated.Value, slideX: number, screenHeight: number) {
  const lerp = (from: number, to: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  // Opaklık kapanırken yarı yolda biter — panel karartmadan önce kaybolsun.
  const fadeIn = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] });
  switch (animation) {
    case "fade":
      return { opacity: fadeIn, transform: [{ translateY: lerp(16, 0) }] };
    case "scale":
      return { opacity: fadeIn, transform: [{ scale: lerp(0.94, 1) }] };
    case "slideUp":
      return { transform: [{ translateY: lerp(screenHeight, 0) }] };
    case "slideDown":
      return { transform: [{ translateY: lerp(-screenHeight, 0) }] };
    default:
      return { transform: [{ translateX: lerp(slideX, 0) }] };
  }
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

function Level(props: LevelProps) {
  const { items, activeKey, color, skeleton, onDrill, onLeaf, m, theme } = props;
  const enter = useLevelEnter();
  // Seviyede ikonlu bir kardeş varsa ikonsuz satırlar da aynı yeri ayırır — başlıklar tek hizada.
  const reserveIcon = items.some((i) => i.icon && !i.heading);
  return (
    <Animated.View style={[{ paddingBottom: 16 }, enter]}>
      <LevelHeader {...props} />
      {items.map((item, index) =>
        item.heading ? (
          <Heading key={item.key} title={item.title} first={index === 0} m={m} theme={theme} />
        ) : (
          <Row key={item.key} item={item} active={containsKey(item, activeKey)} reserveIcon={reserveIcon} color={color} skeleton={skeleton} m={m} theme={theme} onPress={() => (isBranch(item) ? onDrill(item) : onLeaf(item))} />
        )
      )}
    </Animated.View>
  );
}

function HeaderBand({ header, emphasized, color, topInset, onClose, skeleton, theme }: { header: SidebarProps["header"]; emphasized: boolean; color: ColorRole; topInset: number; onClose: () => void; skeleton: boolean; theme: Theme }) {
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

/**
 * Kenardan kayan gezinme çekmecesi (Material 3 Navigation Drawer, Amazon
 * menüsü): başlık bandı, bölüm başlıkları, aktif öğe, alt seviyelere inen
 * (drill-down) satırlar. Tetikleyiciyi (menü düğmesi) tüketici koyar.
 */
export function Sidebar({
  data,
  open,
  onOpenChange,
  currentPath,
  activeKey,
  onNavigate,
  onSelect,
  header,
  emphasizedHeader = false,
  footer,
  position = "left",
  animation = "slide",
  color = "primary",
  rootLabel = "Ana Menü",
  seeAllLabel = "Tümünü gör",
  accessibilityLabel = "Ana menü",
  topInset: topInsetProp,
  bottomInset: bottomInsetProp,
  skeleton = false,
  style,
}: SidebarProps) {
  const safe = useSafeInsets();
  const topInset = topInsetProp ?? safe?.top ?? FALLBACK_TOP;
  const bottomInset = bottomInsetProp ?? safe?.bottom ?? FALLBACK_BOTTOM;
  const theme = useTheme();
  const m = useNativeConfig().sidebar;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const width = Math.min(screenWidth * m.widthRatio, m.maxWidth);
  // Ekranı kaplıyorsa kenar çizgisi gereksiz.
  const edgeBorder = width < screenWidth ? 1 : 0;
  const [trail, setTrail] = useState<SidebarItem[]>([]);
  const motion = useDrawerMotion(open);
  const close = () => onOpenChange(false);
  const pan = useSwipeToClose(motion, width, position, close, animation === "slide");
  const active = activeKey ?? findActiveKey(data, currentPath);

  // Her açılış kökten başlar.
  useEffect(() => {
    if (open) setTrail([]);
  }, [open]);

  const back = () => setTrail((t) => t.slice(0, -1));
  // Android geri / VoiceOver "geri": önce bir seviye yukarı, kökte kapat.
  const requestBack = () => (trail.length > 0 ? back() : close());
  const leaf = (item: SidebarItem) => {
    if (item.route) onNavigate?.(item.route, item);
    onSelect?.(item);
    close();
  };

  const c = theme.color.canvas;
  const motionStyle = panelMotion(animation, motion.progress, position === "left" ? -width : width, screenHeight);
  const items = levelItems(data, trail);
  const levelKey = trail.map((t) => t.key).join("/") || "root";

  return (
    <RNModal transparent visible={motion.mounted} animationType="none" statusBarTranslucent onRequestClose={requestBack}>
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: scrimColor(theme), opacity: motion.progress }}>
        <Pressable accessibilityLabel="Menüyü kapat" style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        onAccessibilityEscape={requestBack}
        style={[
          overlaySurface(theme),
          { position: "absolute", top: 0, bottom: 0, width, borderWidth: 0 },
          motionStyle,
          position === "left" ? { left: 0, borderRightWidth: edgeBorder, borderRightColor: c.border } : { right: 0, borderLeftWidth: edgeBorder, borderLeftColor: c.border },
          style,
        ]}
      >
        <HeaderBand header={header} emphasized={emphasizedHeader} color={color} topInset={topInset} onClose={close} skeleton={skeleton} theme={theme} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={footer == null ? { paddingBottom: bottomInset } : undefined}>
          <Level key={levelKey} items={items} trail={trail} activeKey={active} color={color} rootLabel={rootLabel} seeAllLabel={seeAllLabel} skeleton={skeleton} onDrill={(item) => setTrail((t) => [...t, item])} onBack={back} onLeaf={leaf} m={m} theme={theme} />
        </ScrollView>
        {footer == null ? null : <View style={{ borderTopWidth: 1, borderTopColor: c.border, paddingBottom: bottomInset }}>{footer}</View>}
      </Animated.View>
    </RNModal>
  );
}
