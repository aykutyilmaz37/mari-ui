import React, { useLayoutEffect, useRef, useState } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import { useReduceMotion } from "./Skeleton";

/**
 * Değer animasyonu — web `lib/useAnimatedValue`ın native karşılığı (Statistic).
 *
 * - `count`: sayı bir önceki değerden (ilkinde 0) hedefe sayar, sonda yavaşlar.
 * - `typewriter`: metin karakter karakter yazılır.
 *
 * "Hareketi azalt" açıksa çalışmaz → değer doğrudan son halinde.
 */
export type ValueAnimation = "count" | "typewriter";

const COUNT_MS = 1000;
const CHAR_MS = 45;
const MAX_TYPE_MS = 1200;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export interface AnimatedValueOptions {
  text: string;
  number?: number;
  format?: (value: number) => string;
  mode: ValueAnimation;
  enabled: boolean;
}

/** Animasyon sürerken ara metin; `null` → son değeri göster. */
export function useAnimatedValue({ text, number, format, mode, enabled }: AnimatedValueOptions): string | null {
  const reduce = useReduceMotion();
  const [shown, setShown] = useState<string | null>(null);
  const lastNumber = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useLayoutEffect(() => {
    const canCount = mode === "count" && number !== undefined && Number.isFinite(number);
    if (!enabled || reduce || (mode === "count" && !canCount)) {
      if (canCount) lastNumber.current = number!;
      setShown(null);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const from = lastNumber.current;
    const chars = Array.from(text);
    const charMs = Math.min(CHAR_MS, MAX_TYPE_MS / Math.max(chars.length, 1));
    const fmt = formatRef.current ?? String;
    setShown(canCount ? fmt(from) : "");

    const tick = (now: number) => {
      start ??= now;
      const elapsed = now - start;
      if (canCount) {
        const t = Math.min(1, elapsed / COUNT_MS);
        if (t >= 1) {
          lastNumber.current = number!;
          setShown(null);
          return;
        }
        setShown(fmt(from + (number! - from) * easeOutCubic(t)));
      } else {
        const n = Math.floor(elapsed / charMs) + 1;
        if (n >= chars.length) {
          setShown(null);
          return;
        }
        setShown(chars.slice(0, n).join(""));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (canCount) lastNumber.current = number!;
    };
  }, [text, number, mode, enabled, reduce]);

  return shown;
}

/**
 * Yer SON metne göre ayrılır (görünmez, ekran okuyucu onu okur), ara metin
 * üstüne çizilir (gizli) → genişlik zıplamaz, okuyucu ara sayıları duymaz.
 */
export function AnimatedText({ text, shown, style, numberOfLines, fit = false }: Readonly<{ text: string; shown: string | null; style?: StyleProp<TextStyle>; numberOfLines?: number; /** Sığmazsa yazıyı küçült (iOS/Android; web kısaltır). */ fit?: boolean }>) {
  const shrink = fit ? { adjustsFontSizeToFit: true, minimumFontScale: 0.6 } : null;
  if (shown === null) return <Text numberOfLines={numberOfLines} {...shrink} style={style}>{text}</Text>;
  return (
    <View style={{ flexShrink: 1 }}>
      <Text numberOfLines={numberOfLines} {...shrink} style={[style, { opacity: 0 }]}>{text}</Text>
      <Text accessibilityElementsHidden aria-hidden importantForAccessibility="no" numberOfLines={1} {...shrink} style={[style, { position: "absolute", left: 0, top: 0 }]}>
        {shown}
      </Text>
    </View>
  );
}
