import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image as RNImage,
  Modal as RNModal,
  PanResponder,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type ImageSourcePropType,
  type NativeTouchEvent,
  type PanResponderGestureState,
} from "react-native";
import { Button } from "../Button";
import { ImageOffIcon, XIcon } from "../lib/icons";
import { Spinner } from "../lib/Spinner";
import { useReduceMotion } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { useMotionScale, useTheme } from "../theme/useTheme";

import { useSafeInsets } from "../theme/insets";
import type { ImageLoader, ImageSource } from "./types";
import { normalizeSource, resolveUri } from "./utils";
import {
  IDENTITY,
  clampPan,
  containSize,
  dragIntent,
  pinchView,
  shouldDismiss,
  swipeOutcome,
  toggleZoom,
  visibleSlides,
  type Size,
  type ViewState,
} from "./viewerUtils";

export interface ImageViewerItem {
  key: React.Key;
  /** Tam çözünürlüklü kaynak. */
  src: ImageSource;
  alt: string;
  /** Asıl görsel yüklenene kadar altta gösterilen küçük boy; alt şeritte de kullanılır. */
  thumbnail?: string;
  caption?: React.ReactNode;
}

export interface ImageViewerProps {
  items: ImageViewerItem[];
  open: boolean;
  onClose: () => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loader?: ImageLoader;
  /** Alt şerit. Varsayılan: birden fazla öğe varsa. */
  thumbnails?: boolean;
  /** Üst çubuğa ek eylemler (paylaş, sil…). */
  actions?: (item: ImageViewerItem, index: number) => React.ReactNode;
  accessibilityLabel?: string;
  /** Üst güvenli alan (durum çubuğu/çentik). Varsayılan: iOS 54, Android durum çubuğu yüksekliği. */
  topInset?: number;
  /** Alt güvenli alan (ev çubuğu). Varsayılan: iOS 28, Android 16. */
  bottomInset?: number;
}

const SLIDE_GAP = 24;
const DOUBLE_TAP_MS = 280;
const TAP_SLOP = 10;
const ENTER_MS = 220;
const SETTLE_MS = 220;
const STRIP_ITEM = 28;
const STRIP_CURRENT = 44;
const STRIP_GAP = 2;
const STRIP_MARGIN = 6;

const DEFAULT_TOP = Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24);
const DEFAULT_BOTTOM = Platform.OS === "ios" ? 28 : 16;

/** Görüntüleyicide istenecek genişlik: sahne × 2 (yakınlaştırmada keskin kalsın). */
function viewerSource(src: ImageSource, loader: ImageLoader | undefined, stageWidth: number): ImageSourcePropType | null {
  if (typeof src === "number") return src;
  const source = normalizeSource(src);
  if (!source) return null;
  const uri = resolveUri(source, { loader, layoutWidth: stageWidth * 2, pixelRatio: PixelRatio.get() });
  return uri ? { uri } : null;
}

/**
 * Tam ekran görüntüleyici — web `ImageViewer`ın native karşılığı (ek paket
 * yok; PanResponder + Animated). Yana kaydır = önceki/sonraki, aşağı çek =
 * kapat, çift dokun = yakınlaş/sıfırla, iki parmak = yakınlaş, yakınken
 * sürükle = gez, tek dokun = üst/alt çubukları gizle/göster.
 */
export function ImageViewer(props: ImageViewerProps) {
  const [mounted, setMounted] = useState(props.open);
  useEffect(() => {
    if (props.open) setMounted(true);
  }, [props.open]);

  return (
    <RNModal transparent visible={mounted && props.items.length > 0} animationType="none" statusBarTranslucent onRequestClose={props.onClose}>
      {mounted && props.items.length > 0 ? <ViewerContent {...props} onExited={() => setMounted(false)} /> : null}
    </RNModal>
  );
}

interface Gesture {
  kind: "swipe" | "dismiss" | "pan" | "pinch" | "done" | null;
  view: ViewState;
  baseDx: number;
  baseDy: number;
  distance: number;
  mid: { x: number; y: number };
  moved: boolean;
  startedAt: number;
}

function touchGeometry(touches: readonly NativeTouchEvent[], stage: Size) {
  const [a, b] = touches as [NativeTouchEvent, NativeTouchEvent];
  return {
    distance: Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY),
    mid: { x: (a.pageX + b.pageX) / 2 - stage.width / 2, y: (a.pageY + b.pageY) / 2 - stage.height / 2 },
  };
}

/**
 * Modal içeriği HER AÇILIŞTA yeniden kurulur → tüm Animated değerleri taze
 * (iOS'ta sökülen görünümün değeri grafikten çözülüyor, ikinci açılışta
 * kareler ulaşmıyordu — BottomSheet'te ölçülen sorun).
 */
function ViewerContent({ items, open, onClose, index, defaultIndex = 0, onIndexChange, loader, thumbnails, actions, accessibilityLabel, topInset: topInsetProp, bottomInset: bottomInsetProp, onExited }: ImageViewerProps & { onExited: () => void }) {
  const safe = useSafeInsets();
  const topInset = topInsetProp ?? (safe?.top === undefined ? DEFAULT_TOP : safe.top + 4);
  const bottomInset = bottomInsetProp ?? (safe?.bottom === undefined ? DEFAULT_BOTTOM : Math.max(safe.bottom, 16));
  const theme = useTheme();
  const window = useWindowDimensions();
  const stage = useMemo<Size>(() => ({ width: window.width, height: window.height }), [window.width, window.height]);
  const count = items.length;
  const [rawIndex, setRawIndex] = useControllable(index, defaultIndex);
  const current = Math.min(Math.max(0, rawIndex), count - 1);
  const item = items[current]!;
  const [naturals, setNaturals] = useState<Record<string, Size>>({});
  const [chrome, setChrome] = useState(true);
  const { anim, view, timing, applyView } = useViewerMotion();

  const setIndex = (next: number) => {
    setRawIndex(next);
    onIndexChange?.(next);
  };
  const toggleChrome = () => setChrome((visible) => !visible);
  const rememberNatural = (key: React.Key, size: Size) => setNaturals((prev) => (prev[String(key)] ? prev : { ...prev, [String(key)]: size }));

  // Açılış / kapanış.
  useEffect(() => {
    if (open) timing(anim.appear, 1, ENTER_MS).start();
    else timing(anim.appear, 0, ENTER_MS).start(onExited);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Dilim değişince: şerit yerine, yakınlaştırma sıfır.
  useLayoutEffect(() => {
    anim.track.setValue(0);
    applyView(IDENTITY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    timing(anim.chrome, chrome ? 1 : 0, 180).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chrome]);

  const natural = naturals[String(item.key)];
  const base = natural ? containSize(natural, stage) : stage;

  // Jest işleyicisi bir kez kurulur; güncel değerler/işlevler bu ref'ten okunur.
  const ctx = useRef<GestureContext>(null as unknown as GestureContext);
  ctx.current = { current, count, stage, base, anim, view, onClose, setIndex, applyView, timing, toggleChrome };
  const gestures = useMemo(() => createViewerGestures(ctx), []);
  useEffect(() => gestures.dispose, [gestures]);

  const dismissProgress = anim.dismiss.interpolate({ inputRange: [0, stage.height * 0.5], outputRange: [1, 0], extrapolate: "clamp" });
  const dismissScale = anim.dismiss.interpolate({ inputRange: [0, stage.height * 0.5], outputRange: [1, 0.75], extrapolate: "clamp" });
  const chromeOpacity = Animated.multiply(anim.chrome, Animated.multiply(anim.appear, dismissProgress));
  const chromePointer = chrome && open ? "box-none" : "none";
  const showStrip = (thumbnails ?? true) && count > 1;
  const multiple = count > 1;

  return (
    <View accessibilityViewIsModal aria-modal accessibilityLabel={accessibilityLabel} onAccessibilityEscape={onClose} style={{ flex: 1 }}>
      <Animated.View style={[FILL, { backgroundColor: theme.color.canvas.surface, opacity: Animated.multiply(anim.appear, dismissProgress) }]} />

      <Animated.View
        {...gestures.responder.panHandlers}
        accessible
        accessibilityRole={multiple ? "adjustable" : "image"}
        accessibilityLabel={item.alt}
        accessibilityValue={multiple ? { text: `${current + 1} / ${count}` } : undefined}
        accessibilityActions={multiple ? [{ name: "increment" }, { name: "decrement" }] : undefined}
        onAccessibilityAction={(event) => {
          const step = event.nativeEvent.actionName === "increment" ? 1 : -1;
          const next = current + step;
          if (next >= 0 && next < count) setIndex(next);
        }}
        style={{ flex: 1, overflow: "hidden", opacity: anim.appear, transform: [{ scale: anim.appear.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}
      >
        <Animated.View style={{ flex: 1, transform: [{ translateX: anim.track }] }}>
          {visibleSlides(current, count).map((i) => (
            <Animated.View
              key={items[i]!.key}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: stage.width,
                left: (i - current) * (stage.width + SLIDE_GAP),
                transform: i === current ? [{ translateX: anim.x }, { translateY: Animated.add(anim.y, anim.dismiss) }, { scale: Animated.multiply(anim.scale, dismissScale) }] : [],
              }}
            >
              <ViewerSlide item={items[i]!} loader={loader} stageWidth={stage.width} onNatural={rememberNatural} />
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>

      <Animated.View pointerEvents={chromePointer} style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: chromeOpacity }}>
        <ChromeBar style={{ paddingTop: topInset, paddingBottom: 8, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Button variant="ghost" color="neutral" shape="circle" icon={<XIcon />} accessibilityLabel="Kapat" onPress={onClose} />
          <ViewerText style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: "500", fontVariant: ["tabular-nums"] }} lines={1}>
            {multiple ? `${current + 1} / ${count}` : item.alt}
          </ViewerText>
          {actions ? actions(item, current) : <View style={{ width: 44 }} />}
        </ChromeBar>
      </Animated.View>

      {item.caption || showStrip ? (
        <Animated.View pointerEvents={chromePointer} style={{ position: "absolute", left: 0, right: 0, bottom: 0, opacity: chromeOpacity }}>
          <ChromeBar style={{ paddingTop: 8, paddingBottom: bottomInset, gap: 8 }}>
            <Caption caption={item.caption} />
            {showStrip ? <ThumbnailStrip items={items} current={current} loader={loader} width={stage.width} onSelect={setIndex} /> : null}
          </ChromeBar>
        </Animated.View>
      ) : null}
    </View>
  );
}

const FILL = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

/** Tüm canlandırılan değerler (bileşen her açılışta yeniden kurulduğu için taze). */
function useViewerMotion() {
  const motion = useMotionScale();
  const reduce = useReduceMotion();
  const anim = useRef<ViewerAnim>({
    appear: new Animated.Value(0),
    track: new Animated.Value(0),
    dismiss: new Animated.Value(0),
    scale: new Animated.Value(1),
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    chrome: new Animated.Value(1),
  }).current;
  const view = useRef<ViewState>(IDENTITY);
  const timing = (value: Animated.Value, toValue: number, ms = SETTLE_MS) =>
    Animated.timing(value, { toValue, duration: reduce ? 0 : Math.round(ms * motion), easing: Easing.out(Easing.cubic), useNativeDriver: false });
  const applyView = (next: ViewState, animated = false) => {
    view.current = next;
    if (animated) {
      Animated.parallel([timing(anim.scale, next.scale), timing(anim.x, next.x), timing(anim.y, next.y)]).start();
      return;
    }
    anim.scale.setValue(next.scale);
    anim.x.setValue(next.x);
    anim.y.setValue(next.y);
  };
  return { anim, view, timing, applyView };
}

/** Üst/alt çubuk: yarı saydam yüzey (web `bg-mari-surface/80`). */
function ChromeBar({ style, children }: { style: React.ComponentProps<typeof View>["style"]; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={style}>
      <View style={[FILL, { backgroundColor: theme.color.canvas.surface, opacity: 0.85 }]} />
      {children}
    </View>
  );
}

/** Görsel açıklaması; düz metin Text'e sarılır. */
function Caption({ caption }: { caption: React.ReactNode }) {
  if (!caption) return null;
  return <View style={{ paddingHorizontal: 16 }}>{typeof caption === "string" ? <ViewerText style={{ fontSize: 14, lineHeight: 20, textAlign: "center" }}>{caption}</ViewerText> : caption}</View>;
}

function ViewerText({ style, lines, children }: { style: React.ComponentProps<typeof Text>["style"]; lines?: number; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text numberOfLines={lines} style={[{ fontFamily: nativeFontFamily(theme.fontFamily.sans), color: theme.color.canvas.foreground }, style]}>
      {children}
    </Text>
  );
}

function ViewerSlide({ item, loader, stageWidth, onNatural }: { item: ImageViewerItem; loader?: ImageLoader; stageWidth: number; onNatural: (key: React.Key, size: Size) => void }) {
  const theme = useTheme();
  const source = viewerSource(item.src, loader, stageWidth);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {status !== "loaded" && item.thumbnail ? <RNImage source={{ uri: item.thumbnail }} resizeMode="contain" blurRadius={2} style={FILL} accessibilityIgnoresInvertColors /> : null}
      {status === "loading" && !item.thumbnail ? <Spinner size={32} color={theme.color.canvas.muted} /> : null}
      {source && status !== "error" ? (
        <RNImage
          source={source}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          onLoad={(e) => {
            const s = e.nativeEvent.source;
            if (s?.width && s.height) onNatural(item.key, { width: s.width, height: s.height });
            setStatus("loaded");
          }}
          onError={() => setStatus("error")}
          style={FILL}
        />
      ) : null}
      {status === "error" || !source ? (
        <View style={{ alignItems: "center", gap: 8 }}>
          <ImageOffIcon size={40} color={theme.color.canvas.muted} />
          <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, color: theme.color.canvas.muted }}>Görsel yüklenemedi</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Alt şerit: şimdiki öğe geniş ve ortada (web ile aynı: 44 / 28). */
function ThumbnailStrip({ items, current, loader, width, onSelect }: { items: ImageViewerItem[]; current: number; loader?: ImageLoader; width: number; onSelect: (index: number) => void }) {
  const theme = useTheme();
  const ref = useRef<{ scrollTo: (options: { x: number; animated?: boolean }) => void } | null>(null);
  const first = useRef(true);
  useEffect(() => {
    const x = current * (STRIP_ITEM + STRIP_GAP) + STRIP_MARGIN + STRIP_CURRENT / 2;
    ref.current?.scrollTo({ x, animated: !first.current });
    first.current = false;
  }, [current]);
  return (
    <ScrollView
      ref={ref as never}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Küçük resimler"
      contentContainerStyle={{ paddingHorizontal: width / 2, gap: STRIP_GAP, alignItems: "center" }}
    >
      {items.map((it, i) => {
        const active = i === current;
        const thumb = it.thumbnail ? { uri: it.thumbnail } : viewerSource(it.src, loader, 48);
        return (
          <Pressable
            key={it.key}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={it.alt || `Öğe ${i + 1}`}
            accessibilityState={{ selected: active }}
            aria-selected={active}
            hitSlop={{ top: 8, bottom: 8 }}
            style={{
              height: STRIP_CURRENT,
              width: active ? STRIP_CURRENT : STRIP_ITEM,
              marginHorizontal: active ? STRIP_MARGIN : 0,
              borderRadius: active ? toPx(theme.radius.sm) : 0,
              overflow: "hidden",
              backgroundColor: theme.color.canvas.surfaceAlt,
            }}
          >
            {thumb ? <RNImage source={thumb} resizeMode="cover" style={{ width: "100%", height: "100%" }} accessibilityIgnoresInvertColors /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

type ViewerAnim = Record<"appear" | "track" | "dismiss" | "scale" | "x" | "y" | "chrome", Animated.Value>;

interface GestureContext {
  current: number;
  count: number;
  stage: Size;
  base: Size;
  anim: ViewerAnim;
  view: React.MutableRefObject<ViewState>;
  onClose: () => void;
  setIndex: (index: number) => void;
  applyView: (next: ViewState, animated?: boolean) => void;
  timing: (value: Animated.Value, toValue: number, ms?: number) => Animated.CompositeAnimation;
  toggleChrome: () => void;
}

/**
 * Sahnenin jest makinesi: tek parmak → yön belirlenince kaydır / aşağı çek /
 * (yakınken) gez; iki parmak → yakınlaştır; kısa dokunuş → tek/çift dokunuş.
 */
function createViewerGestures(ref: React.MutableRefObject<GestureContext>) {
  const g: Gesture = { kind: null, view: IDENTITY, baseDx: 0, baseDy: 0, distance: 0, mid: { x: 0, y: 0 }, moved: false, startedAt: 0 };
  let lastTap: { t: number; x: number; y: number } | null = null;
  let tapTimer: ReturnType<typeof setTimeout> | undefined;

  const onTap = (x: number, y: number) => {
    const c = ref.current;
    const now = Date.now();
    clearTimeout(tapTimer);
    if (lastTap && now - lastTap.t < DOUBLE_TAP_MS && Math.hypot(lastTap.x - x, lastTap.y - y) < 40) {
      lastTap = null;
      c.applyView(toggleZoom(c.view.current, { x: x - c.stage.width / 2, y: y - c.stage.height / 2 }, c.base, c.stage), true);
      return;
    }
    lastTap = { t: now, x, y };
    // Tek dokunuş, çift dokunuş olmadığı anlaşılınca (çubukları gizle/göster).
    tapTimer = setTimeout(c.toggleChrome, DOUBLE_TAP_MS);
  };

  const settleSwipe = (c: GestureContext, dx: number, vx: number) => {
    const target = Math.min(c.count - 1, Math.max(0, c.current + swipeOutcome(dx, vx, c.stage.width)));
    if (target === c.current) {
      c.timing(c.anim.track, 0).start();
      return;
    }
    const from = c.current;
    c.timing(c.anim.track, -(target - from) * (c.stage.width + SLIDE_GAP)).start(() => c.setIndex(target));
  };

  const settleDismiss = (c: GestureContext, dy: number, vy: number) => {
    if (shouldDismiss(dy, vy, c.stage.height)) c.timing(c.anim.dismiss, c.stage.height, 200).start(c.onClose);
    else c.timing(c.anim.dismiss, 0).start();
  };

  const settle = (e: GestureResponderEvent, gs: PanResponderGestureState) => {
    const c = ref.current;
    if (!g.moved && Date.now() - g.startedAt < 300) {
      onTap(e.nativeEvent.pageX, e.nativeEvent.pageY);
      return;
    }
    if (g.kind === "swipe") settleSwipe(c, gs.dx - g.baseDx, gs.vx);
    else if (g.kind === "dismiss") settleDismiss(c, gs.dy - g.baseDy, gs.vy);
    else if (c.view.current.scale <= 1) c.applyView(IDENTITY, true);
  };

  const movePinch = (c: GestureContext, touches: readonly NativeTouchEvent[]) => {
    const geo = touchGeometry(touches, c.stage);
    if (g.kind !== "pinch") {
      // Kaydırma/çekme ortasında ikinci parmak: onları geri al, yakınlaştırmaya geç.
      if (g.kind === "swipe") c.timing(c.anim.track, 0).start();
      if (g.kind === "dismiss") c.timing(c.anim.dismiss, 0).start();
      Object.assign(g, { kind: "pinch", view: c.view.current, distance: geo.distance, mid: geo.mid, moved: true });
    }
    c.applyView(pinchView(g.view, g.distance, geo.distance, g.mid, geo.mid, c.base, c.stage));
  };

  const moveSingle = (c: GestureContext, dx: number, dy: number) => {
    if (Math.hypot(dx, dy) > TAP_SLOP) g.moved = true;
    if (g.kind === null) g.kind = c.view.current.scale > 1 ? "pan" : dragIntent(dx, dy);
    if (g.kind === "pan") c.applyView(clampPan({ scale: g.view.scale, x: g.view.x + dx, y: g.view.y + dy }, c.base, c.stage));
    else if (g.kind === "swipe") {
      // Uçta komşu yok: lastik gibi az gider.
      const edge = (dx > 0 && c.current === 0) || (dx < 0 && c.current === c.count - 1);
      c.anim.track.setValue(edge ? dx * 0.3 : dx);
    } else if (g.kind === "dismiss") c.anim.dismiss.setValue(Math.max(0, dy));
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      Object.assign(g, { kind: null, view: ref.current.view.current, baseDx: 0, baseDy: 0, moved: false, startedAt: Date.now() });
    },
    onPanResponderMove: (e, gs) => {
      const c = ref.current;
      const touches = e.nativeEvent.touches;
      if (touches.length >= 2) {
        movePinch(c, touches);
        return;
      }
      if (g.kind === "pinch") {
        // Bir parmak kalktı: kalan parmakla gezmeye devam (ölçek 1'deyse jest biter).
        Object.assign(g, { kind: c.view.current.scale > 1 ? "pan" : "done", view: c.view.current, baseDx: gs.dx, baseDy: gs.dy });
        return;
      }
      moveSingle(c, gs.dx - g.baseDx, gs.dy - g.baseDy);
    },
    onPanResponderRelease: settle,
    onPanResponderTerminate: settle,
  });

  return { responder, dispose: () => clearTimeout(tapTimer) };
}
