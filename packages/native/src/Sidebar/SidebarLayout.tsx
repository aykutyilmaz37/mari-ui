import React, { useEffect, useRef } from "react";
import { Animated, BackHandler, Platform, Pressable, View } from "react-native";
import { shadowStyle } from "../theme/effects";
import { useTheme } from "../theme/useTheme";
import { scrimColor } from "../lib/overlay";
import { DrawerBody, useDrawerMotion, useDrawerWidth, useSidebarInsets, useSidebarState, useSwipeToClose } from "./SidebarBody";
import type { SidebarLayoutAnimation, SidebarLayoutProps } from "./types";

/** scaleDown'da ekran kartının son boyu ve köşesi. */
const CARD_SCALE = 0.86;
const CARD_RADIUS = 28;

/** Android geri tuşu: açıkken önce bir seviye yukarı / kapat (Modal olmadığı için kendimiz dinleriz). */
function useHardwareBack(open: boolean, onBack: () => void) {
  const live = useRef(onBack);
  live.current = onBack;
  useEffect(() => {
    if (!open || Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      live.current();
      return true;
    });
    return () => sub.remove();
  }, [open]);
}

/**
 * Panelin ve ekranın hareketi (0 kapalı → 1 açık), yerel sürücüde.
 * `dir`: soldaki panelde ekran sağa (+1), sağdakinde sola (-1) gider.
 */
function layoutMotion(animation: SidebarLayoutAnimation, progress: Animated.Value, width: number, screenWidth: number, dir: 1 | -1) {
  const lerp = (from: number, to: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  if (animation === "reveal") {
    // Menü altta sabit (hafif paralaks), ekran kayarak açığa çıkarır.
    return { panel: { transform: [{ translateX: lerp(-dir * width * 0.3, 0) }] }, content: { transform: [{ translateX: lerp(0, dir * width) }] }, scrim: 0.25 };
  }
  if (animation === "scaleDown") {
    // Merkezden küçülen ekranın kenarı panelin hemen yanına gelsin.
    const shift = width - (screenWidth * (1 - CARD_SCALE)) / 2 + 16;
    return {
      panel: { opacity: progress, transform: [{ translateX: lerp(-dir * 32, 0) }] },
      content: { transform: [{ translateX: lerp(0, dir * shift) }, { scale: lerp(1, CARD_SCALE) }] },
      scrim: 0.15,
    };
  }
  // push: çekmece ekranı yanında iter.
  return { panel: { transform: [{ translateX: lerp(-dir * width, 0) }] }, content: { transform: [{ translateX: lerp(0, dir * width) }] }, scrim: 0.4 };
}

/**
 * Ekranı saran çekmece düzeni — açılırken arkadaki ekran da hareket eder:
 * `push` (çekmece ekranı iter), `reveal` (ekran kayarak alttaki menüyü açar),
 * `scaleDown` (ekran küçülüp yuvarlak köşeli karta dönüşerek çekilir).
 * Menü içeriği ve prop'lar `Sidebar` ile aynı; yalnız ekran `children` olarak verilir.
 */
export function SidebarLayout(props: SidebarLayoutProps) {
  const { open, position = "left", animation = "push", accessibilityLabel = "Ana menü", children, style } = props;
  const theme = useTheme();
  const c = theme.color.canvas;
  // reveal / scaleDown'da ekran kenarda görünür kalsın — panel en fazla %80.
  const { width, screenWidth } = useDrawerWidth(animation === "push" ? undefined : 0.8);
  const state = useSidebarState(props);
  const insets = useSidebarInsets(props);
  const motion = useDrawerMotion(open);
  const pan = useSwipeToClose(motion, width, position, state.close, open);
  useHardwareBack(open, state.requestBack);

  const dir = position === "left" ? 1 : -1;
  const m = layoutMotion(animation, motion.progress, width, screenWidth, dir);
  const panelOnTop = animation === "push";
  const card = animation === "scaleDown" && motion.mounted;

  const panel = motion.mounted ? (
    <Animated.View
      accessibilityViewIsModal
      accessibilityLabel={accessibilityLabel}
      onAccessibilityEscape={state.requestBack}
      style={[{ position: "absolute", top: 0, bottom: 0, width, backgroundColor: c.surface, zIndex: panelOnTop ? 2 : 0 }, position === "left" ? { left: 0 } : { right: 0 }, m.panel, style]}
    >
      <DrawerBody props={props} state={state} insets={insets} />
    </Animated.View>
  ) : null;

  return (
    <View {...pan.panHandlers} style={{ flex: 1, overflow: "hidden", backgroundColor: c.surface }}>
      {panelOnTop ? null : panel}
      <Animated.View
        // Açıkken ekran ekran okuyucudan gizli — odak menüde kalsın.
        importantForAccessibility={open ? "no-hide-descendants" : "auto"}
        accessibilityElementsHidden={open}
        style={[{ flex: 1, zIndex: 1 }, card ? shadowStyle(theme, { opacity: 0.18, radius: 24, offsetY: 8, elevation: 12 }) : null, m.content]}
      >
        <View style={[{ flex: 1, backgroundColor: c.surface }, card ? { borderRadius: CARD_RADIUS, overflow: "hidden" } : null]}>
          {children}
          {motion.mounted ? (
            <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: scrimColor(theme), opacity: motion.progress.interpolate({ inputRange: [0, 1], outputRange: [0, m.scrim] }) }}>
              <Pressable accessibilityLabel="Menüyü kapat" style={{ flex: 1 }} onPress={state.close} />
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
      {panelOnTop ? panel : null}
    </View>
  );
}
