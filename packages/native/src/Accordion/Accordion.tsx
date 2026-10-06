import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeAccordionSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { useTheme } from "../theme/useTheme";
import { ChevronDownIcon, ChevronRightIcon } from "../lib/icons";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { toggleKey, toKeys } from "./utils";

/**
 * - `bordered` (varsayılan): dış çerçeve, tonlu başlıklar, gövde ayrı zeminde.
 * - `borderless`: çerçevesiz tonlu blok, yalnız bölümler arası çizgi.
 * - `ghost`: zemin ve çerçeve yok — bir kartın içine gömülür.
 * - `separated`: her bölüm ayrı, aralıklı bir kart (SSS).
 */
export type AccordionVariant = "bordered" | "borderless" | "ghost" | "separated";

export interface AccordionItem {
  key: string;
  /** Başlık (düğmenin erişilebilir adı). */
  label: React.ReactNode;
  children: React.ReactNode;
  /** Başlığın sağında ek alan; açma düğmesinin DIŞINDA — içine düğme koymak güvenli. */
  extra?: React.ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  /** İçerik ilk açılıştan önce de çizilsin. */
  forceRender?: boolean;
}

export interface AccordionProps extends SkeletonableProps {
  items: AccordionItem[];
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  /** Her zaman dizi (tekli modda 0 ya da 1 eleman). */
  onChange?: (activeKeys: string[]) => void;
  /** Aynı anda yalnız bir bölüm açık. */
  single?: boolean;
  variant?: AccordionVariant;
  /** Başlık dolgusu sm 10·12 / md 12·16 / lg 16·20; satır en az 44pt. */
  size?: Size;
  iconPlacement?: "start" | "end";
  expandIcon?: (open: boolean) => React.ReactNode;
  /** Web'de `<hN>` seviyesi; native'de başlıklar düğmedir (RN'de başlık seviyesi yok) — yok sayılır. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Kapanan bölümün içeriği kaldırılsın (varsayılan: ilk açılıştan sonra tutulur). */
  destroyOnHidden?: boolean;
  style?: StyleProp<ViewStyle>;
}

const MIN_ROW = 44;
const DURATION = 200;
const HIDDEN_A11Y = { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };

/**
 * Açılma: dış kutunun yüksekliği 0 → içeriğin doğal yüksekliği. İç kutu
 * yüksekliği sınırlanmadığı için `onLayout` doğal yüksekliği verir. Ölçülene
 * kadar açık bölüm `auto` (ilk çizimde boş görünmesin). Ok aynı değerle döner.
 */
function useExpand(open: boolean) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [height, setHeight] = useState<number>();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) {
      progress.setValue(open ? 1 : 0);
      return;
    }
    Animated.timing(progress, { toValue: open ? 1 : 0, duration: DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [open, reduce, progress]);
  let boxHeight: Animated.AnimatedInterpolation<number> | number | undefined = progress.interpolate({ inputRange: [0, 1], outputRange: [0, height ?? 0] });
  if (height === undefined) boxHeight = open ? undefined : 0;
  return { progress, boxHeight, onMeasure: (h: number) => setHeight((prev) => (prev === h ? prev : h)) };
}

/** İçerik ilk açılışta çizilir; `destroyOnHidden`da kapanış animasyonundan sonra kaldırılır. */
function useRendered(open: boolean, forceRender: boolean, destroyOnHidden: boolean): boolean {
  const [rendered, setRendered] = useState(open || forceRender);
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    if (!destroyOnHidden || forceRender) return;
    const timer = setTimeout(() => setRendered(false), DURATION);
    return () => clearTimeout(timer);
  }, [open, forceRender, destroyOnHidden]);
  return open || rendered;
}

interface PanelProps {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  variant: AccordionVariant;
  m: NativeAccordionSize;
  theme: Theme;
  iconPlacement: "start" | "end";
  expandIcon?: (open: boolean) => React.ReactNode;
  destroyOnHidden: boolean;
  skeleton: boolean;
  isLast: boolean;
}

function Arrow({ open, progress, placement, m, color, skeleton, custom }: { open: boolean; progress: Animated.Value; placement: "start" | "end"; m: NativeAccordionSize; color: string; skeleton: boolean; custom?: (open: boolean) => React.ReactNode }) {
  let content: React.ReactNode;
  if (skeleton) content = <SkeletonBox style={{ width: 14, height: 14, borderRadius: 3 }} />;
  else if (custom) content = custom(open);
  else {
    const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", placement === "end" ? "180deg" : "90deg"] });
    const Chevron = placement === "end" ? ChevronDownIcon : ChevronRightIcon;
    content = (
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Chevron size={m.iconSize} color={color} />
      </Animated.View>
    );
  }
  // İkon kutusu = başlığın satır yüksekliği → ok ilk satırla hizalı.
  return <View style={{ height: m.lineHeight, justifyContent: "center" }}>{content}</View>;
}

/** Metinse verilen stille Text, değilse düğümün kendisi (RN'de düz metin View içinde duramaz). */
function asText(node: React.ReactNode, style: TextStyle): React.ReactNode {
  return typeof node === "string" || typeof node === "number" ? <Text style={style}>{node}</Text> : node;
}

/** Görünüme göre bölüm kabuğu (ayırıcı / ayrı kart) ve gövde dolgusu. */
function panelChrome(variant: AccordionVariant, isLast: boolean, theme: Theme, m: NativeAccordionSize): { outer: ViewStyle | null; body: ViewStyle } {
  const c = theme.color.canvas;
  let outer: ViewStyle | null = null;
  if ((variant === "bordered" || variant === "borderless") && !isLast) outer = { borderBottomWidth: 1, borderBottomColor: c.border };
  if (variant === "separated") outer = { borderWidth: 1, borderColor: c.border, borderRadius: toPx(theme.radius.lg), backgroundColor: c.surface, overflow: "hidden" };
  // bordered: gövde ayrı zeminde (üst çizgili); diğerlerinde başlığın devamı.
  const body: ViewStyle =
    variant === "bordered"
      ? { paddingVertical: m.paddingVertical + 4, paddingHorizontal: m.paddingHorizontal, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface }
      : { paddingHorizontal: m.paddingHorizontal, paddingBottom: m.paddingVertical + 4 };
  return { outer, body };
}

interface HeaderProps {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  m: NativeAccordionSize;
  theme: Theme;
  iconPlacement: "start" | "end";
  arrow: React.ReactNode;
  skeleton: boolean;
}

/** Başlık satırı: satırın her yeri açar; `extra` düğmenin DIŞINDA (içine düğme koymak güvenli). */
function PanelHeader({ item, open, onToggle, m, theme, iconPlacement, arrow, skeleton }: HeaderProps) {
  const c = theme.color.canvas;
  const disabled = Boolean(item.disabled) || skeleton;
  const label = asText(item.label, { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.fontSize, lineHeight: m.lineHeight, fontWeight: "500", color: item.disabled ? c.muted : c.foreground });
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }} {...(skeleton ? HIDDEN_A11Y : null)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={onToggle}
        style={({ pressed }) => ({ flex: 1, minHeight: MIN_ROW, flexDirection: iconPlacement === "end" ? "row-reverse" : "row", alignItems: "flex-start", gap: 12, paddingVertical: m.paddingVertical, paddingHorizontal: m.paddingHorizontal, opacity: pressed ? 0.6 : 1 })}
      >
        {arrow}
        <View style={{ flex: 1, minWidth: 0 }}>{skeleton ? <SkeletonBox style={{ alignSelf: "flex-start", borderRadius: 4 }}>{label}</SkeletonBox> : label}</View>
      </Pressable>
      {item.extra == null ? null : <View style={{ paddingVertical: m.paddingVertical, paddingRight: m.paddingHorizontal, minHeight: MIN_ROW, justifyContent: "center", opacity: skeleton ? 0 : 1 }}>{item.extra}</View>}
    </View>
  );
}

function Panel({ item, open, onToggle, variant, m, theme, iconPlacement, expandIcon, destroyOnHidden, skeleton, isLast }: PanelProps) {
  const c = theme.color.canvas;
  const { progress, boxHeight, onMeasure } = useExpand(open);
  const rendered = useRendered(open, Boolean(item.forceRender), destroyOnHidden);
  const { outer, body: bodyPad } = panelChrome(variant, isLast, theme, m);
  // Metin gövde Subheadline 15/20.
  const body = asText(item.children, { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 15, lineHeight: 20, color: c.foreground });
  const arrow = item.showArrow === false ? null : <Arrow open={open} progress={progress} placement={iconPlacement} m={m} color={item.disabled ? c.disabled : c.muted} skeleton={skeleton} custom={expandIcon} />;

  return (
    <View style={outer}>
      <PanelHeader item={item} open={open} onToggle={onToggle} m={m} theme={theme} iconPlacement={iconPlacement} arrow={arrow} skeleton={skeleton} />
      {/* Kapalıyken ekran okuyucudan gizli. */}
      <Animated.View style={{ height: boxHeight, overflow: "hidden" }} {...(open && !skeleton ? null : HIDDEN_A11Y)}>
        {rendered ? (
          <View onLayout={(e) => onMeasure(e.nativeEvent.layout.height)} style={bodyPad}>
            {skeleton ? <SkeletonBox style={{ borderRadius: 4 }}>{body}</SkeletonBox> : body}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

/** Başlık + açılır içerik listesi (ant.design Collapse). Başlığın her yerine dokunmak açar. */
export function Accordion({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  single = false,
  variant = "bordered",
  size = "md",
  iconPlacement = "start",
  expandIcon,
  destroyOnHidden = false,
  skeleton = false,
  style,
}: AccordionProps) {
  const theme = useTheme();
  const m = useNativeConfig().accordion[size];
  const c = theme.color.canvas;
  const [active, setActive] = useControllable<string[]>(toKeys(activeKey), toKeys(defaultActiveKey) ?? []);
  const root: ViewStyle = {
    bordered: { borderWidth: 1, borderColor: c.border, borderRadius: toPx(theme.radius.lg), backgroundColor: c.surfaceAlt, overflow: "hidden" as const },
    borderless: { borderRadius: toPx(theme.radius.lg), backgroundColor: c.surfaceAlt, overflow: "hidden" as const },
    ghost: {},
    separated: { gap: 8 },
  }[variant];
  return (
    <View style={[{ alignSelf: "stretch" }, root, style]}>
      {items.map((item, i) => (
        <Panel
          key={item.key}
          item={item}
          open={active.includes(item.key)}
          onToggle={() => {
            const next = toggleKey(active, item.key, single);
            setActive(next);
            onChange?.(next);
          }}
          variant={variant}
          m={m}
          theme={theme}
          iconPlacement={iconPlacement}
          expandIcon={expandIcon}
          destroyOnHidden={destroyOnHidden}
          skeleton={skeleton}
          isLast={i === items.length - 1}
        />
      ))}
    </View>
  );
}
