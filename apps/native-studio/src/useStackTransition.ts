import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, BackHandler, Easing, PanResponder, useWindowDimensions } from "react-native";

/** Sol kenardan bu kadar içeride başlayan sağa çekiş geri dönüş sayılır (iOS kenar hareketi). */
const EDGE = 32;

/**
 * Tek seviyeli yığın geçişi: detay ekranı sağdan kayarak gelir, alttaki liste
 * hafifçe sola kayar; sol kenardan sağa çekince parmağı takip eder, yeterince
 * çekilince (genişliğin %35'i ya da hızlı fırlatma) geri döner, yoksa yerine
 * yaylanır. Android geri tuşu da aynı animasyonla döner. Hareket azaltma
 * açıksa geçiş anlıktır.
 */
export function useStackTransition<T>() {
  const { width } = useWindowDimensions();
  const [item, setItem] = useState<T | null>(null);
  const x = useRef(new Animated.Value(width)).current; // 0 = detay görünür, width = gizli
  const reduceMotion = useRef(false);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduceMotion.current = v)).catch(() => undefined);
  }, []);

  const animateTo = (to: number, done?: () => void, velocity = 0) => {
    if (reduceMotion.current) {
      x.setValue(to);
      done?.();
      return;
    }
    const anim = velocity
      ? Animated.spring(x, { toValue: to, velocity, overshootClamping: true, useNativeDriver: true })
      : Animated.timing(x, { toValue: to, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start(({ finished }) => finished && done?.());
  };

  const push = (next: T) => {
    x.setValue(widthRef.current);
    setItem(next);
    requestAnimationFrame(() => animateTo(0));
  };

  const pop = (velocity = 0) => animateTo(widthRef.current, () => setItem(null), velocity);

  const popRef = useRef(pop);
  popRef.current = pop;
  const openRef = useRef(false);
  openRef.current = item !== null;

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!openRef.current) return false;
      popRef.current();
      return true;
    });
    return () => sub.remove();
  }, []);

  const panHandlers = useMemo(() => {
    const isEdgeSwipe = (x0: number, dx: number, dy: number) => x0 < EDGE && dx > 8 && Math.abs(dy) < dx;
    return PanResponder.create({
      // Capture: içerideki ScrollView dikey kaydırmayı alsa da kenardan yatay çekiş bizim.
      onMoveShouldSetPanResponderCapture: (_, g) => isEdgeSwipe(g.x0, g.dx, g.dy),
      onPanResponderMove: (_, g) => x.setValue(Math.max(0, g.dx)),
      onPanResponderRelease: (_, g) => {
        if (g.dx > widthRef.current * 0.35 || g.vx > 0.5) popRef.current(g.vx);
        else animateTo(0);
      },
      onPanResponderTerminate: () => animateTo(0),
    }).panHandlers;
  }, []);

  /** Alttaki ekranın paralaks kayması (iOS: %30) ve hafif kararma. */
  const underStyle = {
    transform: [{ translateX: x.interpolate({ inputRange: [0, width], outputRange: [-width * 0.3, 0], extrapolate: "clamp" }) }],
  };
  const topStyle = { transform: [{ translateX: x }] };
  const scrimOpacity = x.interpolate({ inputRange: [0, width], outputRange: [0.12, 0], extrapolate: "clamp" });

  return { item, push, pop: () => pop(), panHandlers, underStyle, topStyle, scrimOpacity };
}
