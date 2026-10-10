import React, { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Platform, Pressable, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "../lib/icons";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { skeletonColor } from "../theme/skeletonColor";
import { toPx } from "../theme/toPx";
import { useTheme } from "../theme/useTheme";
import { canLoop, cloneCount, computeSnaps, loopTarget, releaseSnap, responsiveSlides, slidesInView, stepSnap, wrap, type CarouselAlign, type ResponsiveItem } from "./utils";

export type DotPosition = "bottom" | "top" | "left" | "right";
export type ArrowsPlacement = "sides" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type DotsPlacement = "overlay" | "outside";
export type { ResponsiveItem, CarouselAlign };

export interface CarouselControls {
  selectedIndex: number;
  /** Her durağın başlangıç konumu (slayt birimi). */
  scrollSnaps: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

export interface CarouselProps extends SkeletonableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Her slaydın kutusu (slaytlar arası boşluk için `paddingHorizontal`). */
  itemStyle?: StyleProp<ViewStyle>;
  /** Görünen alan (köşe, yükseklik). */
  viewportStyle?: StyleProp<ViewStyle>;
  /** Ok ve nokta göstergelerinin aktif rengi. Varsayılan: `neutral`. */
  color?: ColorRole;
  /** Erişilebilir ad (ör. "Kampanyalar"). Varsayılan: `"Slayt gösterisi"`. */
  label?: string;
  /** Kesintisiz döngü: sondan ileri ilk slayt yandan gelir. Varsayılan: `true`. */
  loop?: boolean;
  /** Parmakla yana kaydırarak gezinme. Varsayılan: `true`. */
  draggable?: boolean;
  /** Geçiş hızı (web ile aynı ölçek; ≈ `speed × 16` ms). Varsayılan: `20`. */
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  align?: CarouselAlign;
  containScroll?: "trimSnaps" | "keepSnaps";
  /** Otomatik ilerleme. Dokununca duraklar, durdur/başlat düğmesi gösterilir; "Hareketi azalt" açıksa başlamaz. */
  autoplay?: boolean;
  autoplayDelay?: number;
  /** Kullanıcı kaydırırsa otomatik oynatma kalıcı olarak durur. Varsayılan: `true`. */
  autoplayStopOnInteraction?: boolean;
  /** Önceki/sonraki okları. Native'de varsayılan `false` (kaydırma + noktalar). */
  arrows?: boolean;
  /** Web'de üzerine gelince beliren oklar; dokunmatikte hover yok — yok sayılır. */
  arrowsVisibility?: "always" | "hover";
  arrowsPlacement?: ArrowsPlacement;
  dots?: boolean;
  dotPosition?: DotPosition;
  dotsPlacement?: DotsPlacement;
  controlsRef?: React.MutableRefObject<CarouselControls | null>;
  /** Pencere genişliğine göre `slidesToShow`/`slidesToScroll` (web ile aynı kural). */
  responsive?: ResponsiveItem[];
  /** Seçili durak değişirken: `(önceki, yeni)`. */
  beforeChange?: (current: number, next: number) => void;
  /** Geçiş yeni durakta bittiğinde. */
  afterChange?: (current: number) => void;
  onStateChange?: (state: CarouselControls) => void;
}

const DRAG_SLOP = 8;
const HIDDEN = { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };

interface Geometry {
  count: number;
  show: number;
  snaps: number[];
  looping: boolean;
  slideWidth: number;
}

/**
 * Konum (slayt birimi) + geçiş. Konum `Animated.Value`; son değeri dinleyiciyle
 * izlenir (sürükleme ortada bir geçişi kesebilir).
 */
function useCarouselMotion(geo: Geometry, speed: number, callbacks: { beforeChange?: CarouselProps["beforeChange"]; afterChange?: CarouselProps["afterChange"] }) {
  const reduce = useReduceMotion();
  const pos = useRef(new Animated.Value(0)).current;
  const posNow = useRef(0);
  const [index, setIndexState] = useState(0);
  const indexNow = useRef(0);
  const latest = useRef({ geo, speed, reduce, callbacks });
  latest.current = { geo, speed, reduce, callbacks };

  useEffect(() => {
    const id = pos.addListener(({ value }) => (posNow.current = value));
    return () => pos.removeListener(id);
  }, [pos]);

  const goTo = (target: number, animated = true) => {
    const { geo: g, speed: s, reduce: r, callbacks: cb } = latest.current;
    const snap = g.snaps[target];
    if (snap === undefined) return;
    const from = indexNow.current;
    if (target !== from) cb.beforeChange?.(from, target);
    indexNow.current = target;
    setIndexState(target);
    const to = g.looping ? loopTarget(posNow.current, snap, g.count) : snap;
    const settle = () => {
      // Döngüde kopya slayttan aslına sessizce atla (aynı görünür).
      const wrapped = g.looping ? wrap(to, g.count) : to;
      pos.setValue(wrapped);
      posNow.current = wrapped;
      if (target !== from) cb.afterChange?.(target);
    };
    if (!animated || r) {
      settle();
      return;
    }
    Animated.timing(pos, { toValue: to, duration: s * 16, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => finished && settle());
  };

  return { pos, posNow, index, indexNow, goTo };
}

type Motion = ReturnType<typeof useCarouselMotion>;

/** Yalnız YATAY sürükleme yakalanır — dikey kaydırma sayfaya kalır, dokunuşlar slayt içeriğine. */
function useCarouselPan(motion: Motion, geo: Geometry, enabled: boolean, onInteract: (phase: "start" | "end") => void) {
  const latest = useRef({ geo, enabled, onInteract });
  latest.current = { geo, enabled, onInteract };
  return useMemo(() => {
    let start = 0;
    let startIndex = 0;
    const horizontal = (dx: number, dy: number) => latest.current.enabled && Math.abs(dx) > DRAG_SLOP && Math.abs(dx) > Math.abs(dy) * 1.2;
    const position = (dx: number) => {
      const g = latest.current.geo;
      const p = start - dx / Math.max(1, g.slideWidth);
      if (g.looping) return p;
      // Uçta lastik: sınırı aşan kısım üçte bir gider.
      const min = g.snaps[0] ?? 0;
      const max = g.snaps[g.snaps.length - 1] ?? 0;
      if (p < min) return min - (min - p) * 0.3;
      if (p > max) return max + (p - max) * 0.3;
      return p;
    };
    const release = (dx: number, vx: number) => {
      const g = latest.current.geo;
      const target = releaseSnap({ snaps: g.snaps, start: startIndex, pos: position(dx), dx, vx, slideWidth: g.slideWidth, loop: g.looping, count: g.count });
      motion.goTo(target);
      latest.current.onInteract("end");
    };
    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gs) => horizontal(gs.dx, gs.dy),
      onMoveShouldSetPanResponder: (_, gs) => horizontal(gs.dx, gs.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        motion.pos.stopAnimation();
        const g = latest.current.geo;
        start = g.looping ? wrap(motion.posNow.current, g.count) : motion.posNow.current;
        motion.pos.setValue(start);
        startIndex = motion.indexNow.current;
        latest.current.onInteract("start");
      },
      onPanResponderMove: (_, gs) => motion.pos.setValue(position(gs.dx)),
      onPanResponderRelease: (_, gs) => release(gs.dx, gs.vx),
      onPanResponderTerminate: (_, gs) => release(gs.dx, gs.vx),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Otomatik ilerleme: dokunuşta duraklar; `stopOnInteraction`da kalıcı durur; hareket azaltmada başlamaz. */
function useAutoplay(enabled: boolean, delay: number, stopOnInteraction: boolean, index: number, onTick: () => void) {
  const reduce = useReduceMotion();
  const [playing, setPlaying] = useState(enabled);
  const [held, setHeld] = useState(false);
  const tick = useRef(onTick);
  tick.current = onTick;

  useEffect(() => setPlaying(enabled && !reduce), [enabled, reduce]);
  useEffect(() => {
    if (!playing || held) return;
    const id = setTimeout(() => tick.current(), delay);
    return () => clearTimeout(id);
  }, [playing, held, delay, index]);

  const interact = (phase: "start" | "end") => {
    setHeld(phase === "start");
    if (phase === "start" && stopOnInteraction) setPlaying(false);
  };
  return { playing, toggle: () => setPlaying((p) => !p), interact };
}

/**
 * Web `Carousel`ın native karşılığı — Embla yerine kendi izimiz (Animated +
 * PanResponder, ek paket yok). Kesintisiz döngü uçlara kopya slayt ekleyerek;
 * görünmeyen slaytlar ve kopyalar ekran okuyucudan gizli.
 */
export function Carousel({
  children,
  style,
  itemStyle,
  viewportStyle,
  color = "neutral",
  label = "Slayt gösterisi",
  skeleton = false,
  loop = true,
  draggable = true,
  speed = 20,
  slidesToShow: baseShow = 1,
  slidesToScroll: baseScroll,
  align = "start",
  containScroll = "trimSnaps",
  autoplay = false,
  autoplayDelay = 3000,
  autoplayStopOnInteraction = true,
  arrows = false,
  arrowsPlacement = "sides",
  dots = true,
  dotPosition = "bottom",
  dotsPlacement = "overlay",
  controlsRef,
  responsive,
  beforeChange,
  afterChange,
  onStateChange,
}: CarouselProps) {
  const items = Children.toArray(children);
  const count = items.length;
  const window = useWindowDimensions();
  const { slidesToShow: show, slidesToScroll: scroll } = responsiveSlides(baseShow, baseScroll, responsive, window.width);
  const looping = canLoop(loop, count, show);
  const snaps = useMemo(() => computeSnaps({ count, show, scroll, loop: looping, align, containScroll }), [count, show, scroll, looping, align, containScroll]);
  const [width, setWidth] = useState(0);
  const geo: Geometry = { count, show, snaps, looping, slideWidth: width / show };
  const motion = useCarouselMotion(geo, speed, { beforeChange, afterChange });
  const n = snaps.length;
  const index = Math.min(motion.index, Math.max(0, n - 1));

  const live = !skeleton && n > 1;
  const step = (dir: 1 | -1) => motion.goTo(stepSnap(motion.indexNow.current, dir, n, looping));
  const auto = useAutoplay(autoplay && live, autoplayDelay, autoplayStopOnInteraction, index, () => step(1));
  const pan = useCarouselPan(motion, geo, draggable && live, auto.interact);

  // Durak sayısı değişince (responsive) geçerli durağa anında yerleş.
  useEffect(() => {
    motion.goTo(Math.min(motion.indexNow.current, Math.max(0, n - 1)), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, show, looping]);

  const canPrev = looping || index > 0;
  const canNext = looping || index < n - 1;
  useControlsMirror({ selectedIndex: index, scrollSnaps: snaps, canScrollPrev: canPrev, canScrollNext: canNext, scrollPrev: () => step(-1), scrollNext: () => step(1), scrollTo: (i) => motion.goTo(i) }, controlsRef, onStateChange);

  const ind = indicators({ dots, n, index, color, skeleton, dotsPlacement, dotPosition, onSelect: (i) => motion.goTo(i), play: autoplay && live ? <PlayToggle playing={auto.playing} onPress={auto.toggle} /> : null });

  return (
    <View style={style} aria-label={label} accessibilityLabel={label} accessibilityState={{ busy: skeleton }} aria-busy={skeleton}>
      <View style={[{ overflow: "hidden" }, viewportStyle]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} {...pan.panHandlers}>
        <Track items={items} clones={looping && width > 0 ? cloneCount(show, scroll, count) : 0} show={show} pos={motion.pos} slideWidth={geo.slideWidth} inView={slidesInView(snaps[index] ?? 0, show, count, looping)} skeleton={skeleton} itemStyle={itemStyle} />
        {arrows && !skeleton && count > show ? <Arrows placement={arrowsPlacement} canPrev={canPrev} canNext={canNext} onPrev={() => step(-1)} onNext={() => step(1)} /> : null}
        {ind.overlay}
        {ind.corner}
      </View>
      {ind.outside}
    </View>
  );
}

/** Noktalar (üstte ya da altta) + durdur/başlat düğmesi (noktaların başında; dikey noktada/noktasızda sağ altta). */
function indicators({ dots, n, index, color, skeleton, dotsPlacement, dotPosition, onSelect, play }: { dots: boolean; n: number; index: number; color: ColorRole; skeleton: boolean; dotsPlacement: DotsPlacement; dotPosition: DotPosition; onSelect: (i: number) => void; play: React.ReactNode }) {
  const vertical = dotsPlacement === "overlay" && (dotPosition === "left" || dotPosition === "right");
  const show = dots && n > 1;
  const node = show ? <Dots count={n} index={index} color={color} skeleton={skeleton} placement={dotsPlacement} position={dotPosition} onSelect={onSelect} lead={vertical ? null : play} /> : null;
  return {
    overlay: dotsPlacement === "overlay" ? node : null,
    outside: dotsPlacement === "outside" ? node : null,
    corner: (vertical || !show) && play ? <View style={{ position: "absolute", right: 8, bottom: 8 }}>{play}</View> : null,
  };
}

/** Durum dışarıya: `controlsRef` + `onStateChange` (yalnız durum değişince). */
function useControlsMirror(state: CarouselControls, ref: CarouselProps["controlsRef"], onChange: CarouselProps["onStateChange"]) {
  useEffect(() => {
    if (ref) ref.current = state;
    onChange?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedIndex, state.scrollSnaps, state.canScrollPrev, state.canScrollNext]);
}

/**
 * Slayt izi; döngüde iki uçta kopyalar (her zaman ekran okuyucudan gizli).
 * Kopyalar yalnız genişlik ölçülünce eklenir: öncesinde iz ilk slaytla başlar
 * (öteleme 0) — ölçüm gecikse de carousel görünür ve doğru slaytta kalır.
 */
function Track({ items, clones, show, pos, slideWidth, inView, skeleton, itemStyle }: { items: React.ReactNode[]; clones: number; show: number; pos: Animated.Value; slideWidth: number; inView: Set<number>; skeleton: boolean; itemStyle?: StyleProp<ViewStyle> }) {
  const count = items.length;
  const translateX = Animated.multiply(Animated.add(pos, clones), -slideWidth);
  const slides: React.ReactNode[] = [];
  for (let i = -clones; i < count + clones; i++) {
    const real = wrap(i, count);
    const item = items[real];
    const hidden = i < 0 || i >= count || !inView.has(real);
    const key = isValidElement(item) && item.key != null ? `${String(item.key)}~${i}` : `slide~${i}`;
    slides.push(
      <View key={key} style={[{ width: `${100 / show}%`, flexShrink: 0 }, itemStyle]} {...(hidden ? HIDDEN : null)}>
        <SlideContent skeleton={skeleton}>{item}</SlideContent>
      </View>
    );
  }
  return <Animated.View style={{ flexDirection: "row", transform: [{ translateX }] }}>{slides}</Animated.View>;
}

/** İskelette içerik görünmez yerinde kalır (yükseklik aynı), üstünde kendi kutusunda nabız. */
function SlideContent({ skeleton, children }: { skeleton: boolean; children: React.ReactNode }) {
  const theme = useTheme();
  if (!skeleton) return <>{children}</>;
  return (
    <View>
      <View style={{ opacity: 0 }} {...HIDDEN}>
        {children}
      </View>
      <SkeletonBox style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: toPx(theme.radius.lg) }} />
    </View>
  );
}

/**
 * Rastgele slayt içeriği üzerinde okunabilirlik için ikon gölgesi (web
 * `drop-shadow`). iOS'ta zeminsiz kutunun gölgesi içeriğin şeklini izler;
 * web'de (react-native-web) kutu gölgesi olur — orada yok.
 */
const ICON_SHADOW: ViewStyle = Platform.OS === "web" ? {} : { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } };

const arrowOpacity = (disabled: boolean, pressed: boolean) => {
  if (disabled) return 0.4;
  return pressed ? 0.6 : 1;
};

function ArrowButton({ dir, size, disabled, onPress }: { dir: "prev" | "next"; size: number; disabled: boolean; onPress: () => void }) {
  const theme = useTheme();
  const Icon = dir === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={dir === "prev" ? "Önceki slayt" : "Sonraki slayt"}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      style={({ pressed }) => ({
        width: 44,
        opacity: arrowOpacity(disabled, pressed),
        height: 44,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <View style={ICON_SHADOW}>
        <Icon size={size} color={theme.color.canvas.foreground} />
      </View>
    </Pressable>
  );
}

/** Oklar çıplak ikon (web gibi daire yok); `sides` dikeyde ortalı, köşelerde ikisi yan yana. */
function Arrows({ placement, canPrev, canNext, onPrev, onNext }: { placement: ArrowsPlacement; canPrev: boolean; canNext: boolean; onPrev: () => void; onNext: () => void }) {
  const size = placement === "sides" ? 28 : 24;
  const prev = <ArrowButton dir="prev" size={size} disabled={!canPrev} onPress={onPrev} />;
  const next = <ArrowButton dir="next" size={size} disabled={!canNext} onPress={onNext} />;
  if (placement === "sides") {
    return (
      <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: 8, right: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {prev}
        {next}
      </View>
    );
  }
  const [v, h] = placement.split("-") as ["top" | "bottom", "left" | "right"];
  return (
    <View style={{ position: "absolute", [v]: 8, [h]: 8, flexDirection: "row" }}>
      {prev}
      {next}
    </View>
  );
}

const DOT_OVERLAY: Record<DotPosition, ViewStyle> = {
  bottom: { bottom: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  top: { top: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  left: { left: 8, top: 0, bottom: 0, flexDirection: "column", justifyContent: "center" },
  right: { right: 8, top: 0, bottom: 0, flexDirection: "column", justifyContent: "center" },
};

/** İnce çubuklar (web/ant gibi): pasif 16, aktif 24 genişlik, 4 yükseklik; dokunma hedefi hitSlop ile 24+. */
function Dots({ count, index, color, skeleton, placement, position, onSelect, lead }: { count: number; index: number; color: ColorRole; skeleton: boolean; placement: DotsPlacement; position: DotPosition; onSelect: (i: number) => void; lead: React.ReactNode }) {
  const theme = useTheme();
  const wrapper: ViewStyle = placement === "overlay" ? { position: "absolute", alignItems: "center", gap: 8, ...DOT_OVERLAY[position] } : { marginTop: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 };
  return (
    <View pointerEvents="box-none" style={wrapper} {...(skeleton ? HIDDEN : null)}>
      {lead}
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        const bar = { height: 4, borderRadius: 2, width: active && !skeleton ? 24 : 16 };
        if (skeleton) return <View key={i} style={[bar, { backgroundColor: skeletonColor(theme) }]} />;
        return (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}. slayta git`}
            accessibilityState={{ selected: active }}
            aria-selected={active}
            hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
            style={[bar, { backgroundColor: active ? theme.color[color].solid : theme.color.canvas.border }]}
          />
        );
      })}
    </View>
  );
}

function PlayToggle({ playing, onPress }: { playing: boolean; onPress: () => void }) {
  const theme = useTheme();
  const Icon = playing ? PauseIcon : PlayIcon;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={playing ? "Otomatik oynatmayı durdur" : "Otomatik oynatmayı başlat"} hitSlop={10} style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
      <Icon size={16} color={theme.color.canvas.foreground} />
    </Pressable>
  );
}
