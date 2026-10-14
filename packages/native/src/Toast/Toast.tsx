import React, { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, PanResponder, Pressable, Text, View } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useMotionScale, useTheme } from "../theme/useTheme";

import { toPx } from "../theme/toPx";
import { XIcon } from "../lib/icons";
import { ROLE_ICON } from "../lib/roleIcon";
import { overlaySurface } from "../lib/overlay";
import { SkeletonBox } from "../lib/Skeleton";
import type { ToastEdge } from "./utils";

export type ToastType = ColorRole | "none";

export interface ToastAction {
  label: string;
  /** Basılınca Toast kapanır. */
  onPress: () => void;
}

export interface ToastViewProps {
  title: string;
  description?: React.ReactNode;
  /** Varsayılan: `none` (ikonsuz). */
  type?: ToastType;
  /** Varsayılan: `true`. */
  closeIcon?: boolean;
  action?: ToastAction;
  /** ms; 0 = kendiliğinden kapanmaz. */
  duration: number;
  skeleton?: boolean;
  edge: ToastEdge;
  exiting?: boolean;
  /** Kullanıcı ya da süre kapattı. */
  onClose: () => void;
  /** Çıkış animasyonu bitti — listeden kaldır. */
  onRemoved: () => void;
}

const MIN_TOUCH = 44;
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 0.6;

/** Kalan süreyi tutar; parmak üstündeyken durur (web: üzerine gelince durur). */
function useAutoClose(duration: number, paused: boolean, onClose: () => void) {
  const remaining = useRef(duration);
  const started = useRef(0);
  const close = useRef(onClose);
  close.current = onClose;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stop = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = undefined;
    remaining.current -= Date.now() - started.current;
  };
  const start = () => {
    if (duration <= 0 || paused || timer.current) return;
    started.current = Date.now();
    timer.current = setTimeout(() => close.current(), Math.max(0, remaining.current));
  };

  useEffect(() => {
    remaining.current = duration;
  }, [duration]);
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, paused]);
  return { pause: stop, resume: start };
}

/** Giriş (kenardan kayarak) ve çıkış (soluklaşma); hareket azaltmada yalnız opaklık. */
function useEnterExit(edge: ToastEdge, exiting: boolean | undefined, onRemoved: () => void) {
  const motion = useMotionScale();
  const progress = useRef(new Animated.Value(0)).current;
  const removed = useRef(onRemoved);
  removed.current = onRemoved;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: Math.round(220 * motion), useNativeDriver: true }).start();
  }, [progress, motion]);
  useEffect(() => {
    if (exiting) Animated.timing(progress, { toValue: 0, duration: Math.round(180 * motion), useNativeDriver: true }).start(() => removed.current());
  }, [exiting, progress, motion]);
  const from = edge === "top" ? -16 : 16;
  return { opacity: progress, translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) };
}

/** Yana kaydırarak kapatma. */
function useSwipe(onClose: () => void, pause: () => void, resume: () => void) {
  const dx = useRef(new Animated.Value(0)).current;
  const close = useRef(onClose);
  close.current = onClose;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: pause,
        onPanResponderMove: (_, g) => dx.setValue(g.dx),
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > SWIPE_DISTANCE || Math.abs(g.vx) > SWIPE_VELOCITY) {
            Animated.timing(dx, { toValue: Math.sign(g.dx || g.vx) * 500, duration: 160, useNativeDriver: true }).start(() => close.current());
          } else {
            Animated.spring(dx, { toValue: 0, useNativeDriver: true }).start();
            resume();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(dx, { toValue: 0, useNativeDriver: true }).start();
          resume();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return { dx, pan };
}

/** İskelette görünmez (yer tutar), basılıyken soluk. */
const pressedOpacity = (pressed: boolean, hidden: boolean) => {
  if (hidden) return 0;
  return pressed ? 0.6 : 1;
};

function Line({ children, style, skeleton }: { children: React.ReactNode; style: object; skeleton: boolean }) {
  const text = <Text style={style}>{children}</Text>;
  return skeleton ? <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start", maxWidth: "100%" }}>{text}</SkeletonBox> : text;
}

/** Tek bildirim kartı. Uygulamada doğrudan değil, `useToast().showToast` ile kullanılır. */
export function ToastView({ title, description, type = "none", closeIcon = true, action, duration, skeleton = false, edge, exiting, onClose, onRemoved }: ToastViewProps) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const timer = useAutoClose(skeleton ? 0 : duration, Boolean(exiting), onClose);
  const motion = useEnterExit(edge, exiting, onRemoved);
  const swipe = useSwipe(onClose, timer.pause, timer.resume);
  const Icon = type === "none" ? null : ROLE_ICON[type];
  const live = type === "error" ? "assertive" : "polite";

  useEffect(() => {
    // iOS canlı bölge desteklemez — duyuruyu açıkça yap (iskelette değil, veri gelince).
    if (!skeleton) AccessibilityInfo.announceForAccessibility([title, typeof description === "string" ? description : ""].filter(Boolean).join(". "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skeleton]);

  return (
    <Animated.View
      {...swipe.pan.panHandlers}
      onTouchStart={timer.pause}
      onTouchEnd={timer.resume}
      accessibilityLiveRegion={skeleton ? "none" : live}
      aria-live={skeleton ? undefined : live}
      style={[
        overlaySurface(theme),
        { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: toPx(theme.radius.lg), width: "100%", maxWidth: 480, alignSelf: "center" },
        { opacity: motion.opacity, transform: [{ translateY: motion.translateY }, { translateX: swipe.dx }] },
      ]}
    >
      {Icon ? <View style={{ paddingTop: 0 }}>{skeleton ? <SkeletonBox style={{ width: 20, height: 20, borderRadius: 10 }} /> : <Icon size={20} color={theme.color[type as ColorRole].text} />}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Line skeleton={skeleton} style={{ fontFamily: font, fontSize: t.h6.fontSize, lineHeight: t.h6.lineHeight, fontWeight: "600", color: theme.color.canvas.foreground }}>{title}</Line>
        {description != null ? <Line skeleton={skeleton} style={{ fontFamily: font, fontSize: 13, lineHeight: 18, color: theme.color.canvas.muted }}>{description}</Line> : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          disabled={skeleton}
          hitSlop={8}
          onPress={() => {
            action.onPress();
            onClose();
          }}
          style={({ pressed }) => ({ minHeight: 20, opacity: pressedOpacity(pressed, skeleton) })}
        >
          <Text style={{ fontFamily: font, fontSize: t.h6.fontSize, lineHeight: t.h6.lineHeight, fontWeight: "600", color: theme.color.primary.text }}>{action.label}</Text>
        </Pressable>
      ) : null}
      {closeIcon ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Bildirimi kapat" hitSlop={(MIN_TOUCH - 20) / 2} onPress={onClose} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <XIcon size={18} color={theme.color.canvas.muted} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
