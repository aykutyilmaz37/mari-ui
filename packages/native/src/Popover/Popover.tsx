import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal as RNModal, Pressable, ScrollView, Text, View, useWindowDimensions, type LayoutRectangle, type StyleProp, type ViewStyle } from "react-native";
import type { Placement } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { overlaySurface } from "../lib/overlay";
import { computePanelPosition, type Side } from "../lib/floating";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";

/** `click`: dokununca açılır (varsayılan). `longPress`: basılı tutunca — web'deki `hover`ın (bilgi balonu) dokunmatik karşılığı. */
export type PopoverTrigger = "click" | "longPress";

export interface PopoverProps extends SkeletonableProps {
  /** Panelin başlığı — erişilebilir ad da budur. */
  title?: React.ReactNode;
  /** Panel içeriği; etkileşimli olabilir. Fonksiyon verilirse `close` alır (ör. "Kopyala"dan sonra kapat). */
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Tetikleyici: TEK bir öğe (genelde Button) — `onPress` / `onLongPress`ı korunarak bağlanır. */
  children: React.ReactElement;
  /** Varsayılan: `click`. */
  trigger?: PopoverTrigger;
  /** Varsayılan: `"top"`; sığmazsa karşı yöne döner, ekrana kıstırılır. */
  placement?: Placement;
  /** Tetikleyiciyi gösteren ok. Varsayılan: `true`. */
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panelin en fazla genişliği (pt). Varsayılan: 300. */
  maxWidth?: number;
  /** Başlık yoksa panelin erişilebilir adı. */
  accessibilityLabel?: string;
  /** `alertdialog`: onay isteyen panel. Varsayılan: `dialog`. */
  role?: "dialog" | "alertdialog";
  style?: StyleProp<ViewStyle>;
}

const GAP = 8;
const ARROW = 8;
const EDGE = 12;
const OPEN_MS = 160;

type TriggerProps = { onPress?: (...a: unknown[]) => void; onLongPress?: (...a: unknown[]) => void };

/** Tetikleyiciye kendi `onPress`/`onLongPress`ını bozmadan açma işini bağlar. */
function bindTrigger(child: React.ReactElement, trigger: PopoverTrigger, open: () => void, expanded: boolean) {
  if (!isValidElement<TriggerProps & { accessibilityState?: object }>(child)) return child;
  const key = trigger === "longPress" ? "onLongPress" : "onPress";
  const own = child.props[key];
  return cloneElement(child, {
    [key]: (...args: unknown[]) => {
      own?.(...args);
      open();
    },
    accessibilityState: { ...child.props.accessibilityState, expanded },
  } as Partial<TriggerProps>);
}

/** Okun konumu (panel kenarında) ve yalnız dışa bakan iki kenarı — içe giren köşe yüzeyle birleşir. */
function arrowFrame(side: Side, offset: number, half: number): ViewStyle {
  const along = side === "top" || side === "bottom" ? { left: offset - half } : { top: offset - half };
  const frames: Record<Side, ViewStyle> = {
    top: { bottom: -half, borderRightWidth: 1, borderBottomWidth: 1 },
    bottom: { top: -half, borderLeftWidth: 1, borderTopWidth: 1 },
    left: { right: -half, borderTopWidth: 1, borderRightWidth: 1 },
    right: { left: -half, borderBottomWidth: 1, borderLeftWidth: 1 },
  };
  return { ...frames[side], ...along };
}

/** Açılışta panel tetikleyiciden 4pt uzaktan gelir. */
const ENTER_SHIFT: Record<Side, { axis: "translateX" | "translateY"; from: number }> = {
  top: { axis: "translateY", from: 4 },
  bottom: { axis: "translateY", from: -4 },
  left: { axis: "translateX", from: 4 },
  right: { axis: "translateX", from: -4 },
};

/** Ok: panelin tetikleyiciye bakan kenarında, 45° döndürülmüş kare (kenarlıklı yüzeyle aynı). */
function Arrow({ side, offset, theme }: { side: Side; offset: number; theme: Theme }) {
  const c = theme.color.canvas;
  const size = ARROW * Math.SQRT2;
  return <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, backgroundColor: c.surface, borderColor: c.border, transform: [{ rotate: "45deg" }] }, arrowFrame(side, offset, size / 2)]} />;
}

/** Aç/kapa: kısa solma + 4pt kayma (hareket azaltmada anlık). Kapanış bitince Modal sökülür. */
function usePopoverMotion(open: boolean) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(v, { toValue: open ? 1 : 0, duration: reduce ? 0 : OPEN_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, reduce, v]);
  return { v, mounted };
}

type Placed = ReturnType<typeof computePanelPosition> | null;

/** Tetikleyici + panel ölçüsünden konum (ikisi de ölçülmeden yok). Okta tetikleyiciden ok kadar uzak. */
function place(anchor: LayoutRectangle | null, panel: { width: number; height: number } | null, placement: Placement, viewport: { width: number; height: number }, arrow: boolean): Placed {
  if (!anchor || !panel) return null;
  const gap = arrow ? GAP + ARROW / 2 : GAP;
  // Ok her zaman tetikleyicinin ortasını gösterir: panel ekrana sığsın diye kaydırılınca
  // ortalı hizada ok panelin ortasında kalıyor, tetikleyiciden kopuyordu (kullanıcı bulgusu).
  const arrowOptions = arrow ? { inset: 20, pointAtCenter: true } : undefined;
  return computePanelPosition({ top: anchor.y, left: anchor.x, width: anchor.width, height: anchor.height }, panel, placement, viewport, gap, EDGE, arrowOptions);
}

/** Ölçüm bitene kadar görünmez; sonra yerine solarak ve 4pt kayarak gelir. */
function placedStyle(pos: Placed, v: Animated.Value) {
  if (!pos) return { top: 0, left: 0, opacity: 0 };
  const { axis, from } = ENTER_SHIFT[pos.side];
  const move = v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] });
  return { top: pos.top, left: pos.left, opacity: v, transform: axis === "translateX" ? [{ translateX: move }] : [{ translateY: move }] };
}

function PanelTitle({ title, theme }: { title: React.ReactNode; theme: Theme }) {
  if (title == null) return null;
  if (typeof title !== "string") return <>{title}</>;
  return <Text accessibilityRole="header" style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 15, lineHeight: 20, fontWeight: "600", color: theme.color.canvas.foreground }}>{title}</Text>;
}

/** Düz metin içerik soluk gövde metni olur; iskelette içerik kendi şeklinde. */
function PanelBody({ body, skeleton, theme }: { body: React.ReactNode; skeleton: boolean; theme: Theme }) {
  const node = typeof body === "string" ? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, lineHeight: 20, color: theme.color.canvas.muted }}>{body}</Text> : body;
  return skeleton ? <SkeletonBox style={{ borderRadius: 6 }}>{node}</SkeletonBox> : <>{node}</>;
}

/**
 * Bir öğeye bağlı yüzen panel: başlık + (etkileşimli olabilen) içerik + ok.
 * Tetikleyiciye dokununca (ya da basılı tutunca) açılır; dışarı dokunma, Android
 * geri ve VoiceOver "geri" kapatır. Yer yoksa karşı yöne döner, ekrana kıstırılır
 * ama tetikleyiciden kopmaz (web ile aynı `computePanelPosition`).
 */
export function Popover({ title, content, children, trigger = "click", placement = "top", arrow = true, open: openProp, defaultOpen = false, onOpenChange, maxWidth = 300, accessibilityLabel, role = "dialog", skeleton = false, style }: PopoverProps) {
  const theme = useTheme();
  const viewport = useWindowDimensions();
  const [open, setOpenState] = useControllable<boolean>(openProp, defaultOpen);
  const anchorRef = useRef<React.ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const [panel, setPanel] = useState<{ width: number; height: number } | null>(null);
  const motion = usePopoverMotion(open);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const close = () => setOpen(false);
  const show = () => {
    // Konum açılış anında ölçülür (sayfa kaymış olabilir); ölçü gelene kadar panel görünmez.
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };
  // Ölçü panel SÖKÜLÜNCE sıfırlanır, kapanırken değil: kapanış animasyonu bitmeden
  // yeniden açılırsa panel yerinde kalır, onLayout tekrar gelmez — ölçü silinmişse görünmez kalıyordu.
  useEffect(() => {
    if (!motion.mounted) setPanel(null);
  }, [motion.mounted]);
  useEffect(() => {
    if (open && typeof title === "string") AccessibilityInfo.announceForAccessibility(title);
  }, [open, title]);

  const pos = place(anchor, panel, placement, viewport, arrow);
  const body = typeof content === "function" ? content(close) : content;
  const label = typeof title === "string" ? title : accessibilityLabel;

  return (
    <>
      {/* Dış kutu ebeveynin hizasını izler (ortalı satırda ortada kalır); ölçülen iç kutu tetikleyici kadar. */}
      <View style={{ alignItems: "flex-start", maxWidth: "100%" }}>
        {/* Dokunulamayan tetikleyici (Avatar, ikon) de çalışsın: dış Pressable olayı yakalar.
            Dokunulabilir çocukta (Button) olay çocuğa gider — ona da bağlanır. */}
        <Pressable
          ref={anchorRef}
          collapsable={false}
          accessible={false}
          onPress={trigger === "click" ? show : undefined}
          onLongPress={trigger === "longPress" ? show : undefined}
        >
          {bindTrigger(children, trigger, show, open)}
        </Pressable>
      </View>
      <RNModal transparent visible={motion.mounted} animationType="none" statusBarTranslucent onRequestClose={close}>
        <Pressable accessibilityLabel="Kapat" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={close} />
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole={role === "alertdialog" ? "alert" : undefined}
          accessibilityLabel={label}
          onAccessibilityEscape={close}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPanel((p) => (p && p.width === width && p.height === height ? p : { width, height }));
          }}
          style={[
            overlaySurface(theme),
            { position: "absolute", maxWidth: Math.min(maxWidth, viewport.width - EDGE * 2), maxHeight: viewport.height * 0.6, borderRadius: toPx(theme.radius.lg), paddingHorizontal: 14, paddingVertical: 12, gap: 6, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
            placedStyle(pos, motion.v),
            style,
          ]}
        >
          {arrow && pos ? <Arrow side={pos.side} offset={pos.arrowOffset} theme={theme} /> : null}
          <PanelTitle title={title} theme={theme} />
          <ScrollView bounces={false} style={{ flexGrow: 0 }}>
            <PanelBody body={body} skeleton={skeleton} theme={theme} />
          </ScrollView>
        </Animated.View>
      </RNModal>
    </>
  );
}
