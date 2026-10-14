import React from "react";
import { Animated, Modal as RNModal, Pressable } from "react-native";
import { useTheme } from "../theme/useTheme";
import { overlaySurface, scrimColor } from "../lib/overlay";
import { DrawerBody, useDrawerMotion, useDrawerWidth, useSidebarInsets, useSidebarState, useSwipeToClose } from "./SidebarBody";
import type { SidebarAnimation, SidebarProps } from "./types";

export type { SidebarAnimation, SidebarBaseProps, SidebarHeaderInk, SidebarIconState, SidebarItem, SidebarLayoutAnimation, SidebarLayoutProps, SidebarProps } from "./types";

/** İlerlemeden (0 kapalı → 1 açık) panelin dönüşümü / opaklığı — yerel sürücüde. */
function panelMotion(animation: SidebarAnimation, progress: Animated.Value, slideX: number) {
  if (animation === "fade") return { opacity: progress };
  return { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [slideX, 0] }) }] };
}

/**
 * Kenardan açılan gezinme çekmecesi (Material 3 Navigation Drawer, Amazon
 * menüsü): başlık bandı, bölüm başlıkları, aktif öğe, alt seviyelere inen
 * satırlar. Ekranın üstünde tam ekran katman (Modal). Arkadaki ekranı da
 * hareket ettiren açılışlar (push / reveal / scaleDown) için `SidebarLayout`.
 */
export function Sidebar(props: Readonly<SidebarProps>) {
  const { open, position = "left", animation = "slide", accessibilityLabel = "Ana menü", style } = props;
  const theme = useTheme();
  const { width, screenWidth } = useDrawerWidth();
  const state = useSidebarState(props);
  const insets = useSidebarInsets(props);
  const motion = useDrawerMotion(open);
  const pan = useSwipeToClose(motion, width, position, state.close, animation === "slide");
  const c = theme.color.canvas;
  // Ekranı kaplıyorsa kenar çizgisi gereksiz.
  const edge = width < screenWidth ? 1 : 0;

  return (
    <RNModal transparent visible={motion.mounted} animationType="none" statusBarTranslucent onRequestClose={state.requestBack}>
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: scrimColor(theme), opacity: motion.progress }}>
        <Pressable accessibilityLabel="Menüyü kapat" style={{ flex: 1 }} onPress={state.close} />
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        onAccessibilityEscape={state.requestBack}
        style={[
          overlaySurface(theme),
          { position: "absolute", top: 0, bottom: 0, width, borderWidth: 0 },
          panelMotion(animation, motion.progress, position === "left" ? -width : width),
          position === "left" ? { left: 0, borderRightWidth: edge, borderRightColor: c.border } : { right: 0, borderLeftWidth: edge, borderLeftColor: c.border },
          style,
        ]}
      >
        <DrawerBody props={props} state={state} insets={insets} />
      </Animated.View>
    </RNModal>
  );
}
