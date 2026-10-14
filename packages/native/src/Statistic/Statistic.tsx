import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Text, View, type AccessibilityRole, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Button } from "../Button";
import { MinusIcon, PauseIcon, PlayIcon, RotateCcwIcon, TrendingDownIcon, TrendingUpIcon } from "../lib/icons";
import { SkeletonBox, useReduceMotion, type SkeletonableProps } from "../lib/Skeleton";
import { AnimatedText, useAnimatedValue, type ValueAnimation } from "../lib/useAnimatedValue";
import { decimalPlaces, formatCountdown, formatStopwatch, formatValue, spokenDuration, trendTone, type TrendTone } from "./utils";

export type StatisticSize = "sm" | "md" | "lg";

interface StatisticBaseProps extends SkeletonableProps {
  /** Üstte soluk başlık ("Aylık gelir"). */
  title?: React.ReactNode;
  /** Değerin solunda ("₺") / sağında ("kişi", "%"). */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Altta soluk açıklama ("geçen aya göre"). */
  description?: React.ReactNode;
  /** Değer 22 / 28 / 34. Varsayılan: `md`. */
  size?: StatisticSize;
  style?: StyleProp<ViewStyle>;
}

export interface StatisticTrend {
  /** Değişim: `12.4` → "%12,4" artış, `-3` → "%3" düşüş. */
  value: number;
  /** Hangi yön İYİ: gelir `up`, maliyet/iade `down`. Varsayılan: `up`. */
  goodWhen?: "up" | "down";
  /** `%` yerine " puan". Varsayılan: yüzde. */
  unit?: "percent" | "points";
}

export interface StatisticProps extends StatisticBaseProps {
  /** Sayı yerel biçimde (1.234.567,8); metin olduğu gibi. */
  value: number | string;
  precision?: number;
  /** Değişim — renk yönden değil `goodWhen`den. */
  trend?: StatisticTrend;
  /** Varsayılan: `"tr-TR"`. */
  locale?: string;
  /** Giriş animasyonu (değer + trend); hareket azaltmada çalışmaz. Varsayılan: açık. */
  animated?: boolean;
  /** `"count"` sayar, `"typewriter"` yazar. Varsayılan: `"count"`. */
  valueAnimation?: ValueAnimation;
}

export interface CountdownProps extends StatisticBaseProps {
  target: Date | number;
  onFinish?: () => void;
  /** "2 gün 04:12:09"; `false`: saate kat ("52:12:09"). Varsayılan: `true`. */
  showDays?: boolean;
  /** Varsayılan: `"Süre doldu"`. */
  finishedText?: React.ReactNode;
}

export interface ClockProps extends StatisticBaseProps {
  /** IANA saat dilimi. Varsayılan: cihazınki. */
  timeZone?: string;
  showSeconds?: boolean;
  locale?: string;
}

export interface StopwatchProps extends StatisticBaseProps {
  /** Başlat / Duraklat / Sıfırla. Varsayılan: `true`. */
  controls?: boolean;
  autoStart?: boolean;
  /** Durdurulunca/sıfırlanınca geçen süre (ms). */
  onStop?: (elapsedMs: number) => void;
}

const TONE_WORD: Record<TrendTone, string> = { good: "olumlu", bad: "olumsuz", neutral: "değişmedi" };

const isText = (node: React.ReactNode): node is string | number => typeof node === "string" || typeof node === "number";
const plain = (node: React.ReactNode) => (isText(node) ? String(node) : "");

/** Metinse verilen stille Text, değilse düğümün kendisi; yoksa `null`. */
function asText(node: React.ReactNode, style: StyleProp<TextStyle>): React.ReactNode {
  if (node == null) return null;
  return isText(node) ? <Text style={style}>{node}</Text> : node;
}

interface ShellProps extends StatisticBaseProps {
  size: StatisticSize;
  skeleton: boolean;
  /** Değer metni (ya da düğüm). */
  children: React.ReactNode;
  /** Değerin altındaki satır (trend, düğmeler). */
  footer?: React.ReactNode;
  /** Açıklama trendle aynı satırda değil, kendi satırında (kronometre). */
  descriptionBlock?: boolean;
  valueRole?: AccessibilityRole;
  valueLabel?: string;
  /** Ekran okuyucu tek parça olarak okusun diye toplu ad (yalnız metin parçalardan). */
  groupLabel?: string;
}

/** İskelette her bölge kendi boyutunda kutu; içerik görünmez yerinde (yükseklik zıplamaz). */
function Region({ skeleton, children, style }: Readonly<{ skeleton: boolean; children: React.ReactNode; style?: StyleProp<ViewStyle> }>) {
  if (!skeleton) return <View style={style}>{children}</View>;
  // SkeletonBox çocukları kendi (görünmez) kutusuna sarar → satır düzeni o kutuda olmalı.
  return (
    <SkeletonBox style={{ alignSelf: "flex-start", borderRadius: 4 }}>
      <View style={style}>{children}</View>
    </SkeletonBox>
  );
}

function StatisticShell({ title, prefix, suffix, description, footer, descriptionBlock, size, skeleton, style, children, valueRole, valueLabel, groupLabel }: Readonly<ShellProps>) {
  const theme = useTheme();
  const m = useNativeConfig().statistic[size];
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const label = { fontFamily: font, fontSize: m.labelFontSize, lineHeight: m.labelLineHeight, color: c.muted };
  const affix = { fontFamily: font, fontSize: Math.round(m.valueFontSize * 0.6), fontWeight: "500" as const, color: c.muted };
  const descriptionNode = asText(description, [label, { flexShrink: 1 }]);
  const hidden = skeleton ? { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const } : null;
  const grouped = !skeleton && groupLabel ? { accessible: true, accessibilityLabel: groupLabel, "aria-label": groupLabel } : null;
  const valueText: TextStyle = { fontFamily: font, fontSize: m.valueFontSize, lineHeight: m.valueLineHeight, fontWeight: "600", color: c.foreground, fontVariant: ["tabular-nums"] };

  let bottom: React.ReactNode = null;
  if (descriptionBlock) {
    bottom = (
      <>
        {descriptionNode ? <Region skeleton={skeleton}>{descriptionNode}</Region> : null}
        {footer ? <Region skeleton={skeleton} style={{ marginTop: 4 }}>{footer}</Region> : null}
      </>
    );
  } else if (footer || descriptionNode) {
    // Trend + açıklama bir cümle gibi: dar kartta açıklama sarar.
    bottom = (
      <Region skeleton={skeleton} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 6 }}>
        {footer}
        {descriptionNode}
      </Region>
    );
  }

  return (
    <View style={[{ gap: 4, minWidth: 0 }, style]} {...hidden} {...grouped}>
      {title != null ? <Region skeleton={skeleton}>{asText(title, label)}</Region> : null}
      <Region skeleton={skeleton} style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        {asText(prefix, affix)}
        <View accessibilityRole={valueRole} accessibilityLabel={valueLabel} style={{ flexShrink: 1 }}>
          {isText(children) ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={valueText}>{children}</Text> : children}
        </View>
        {asText(suffix, affix)}
      </Region>
      {bottom}
    </View>
  );
}

/** Trend oku yönünde kayarak gelir (yukarı ok aşağı-soldan, aşağı ok yukarı-soldan). */
function useTrendEntrance(direction: "up" | "down" | "flat", enabled: boolean) {
  const reduce = useReduceMotion();
  const t = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!enabled || reduce) {
      t.setValue(1);
      return;
    }
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [direction, enabled, reduce, t]);
  const shift = direction === "flat" ? 0 : 6;
  return {
    opacity: t,
    transform: [
      { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-shift, 0] }) },
      { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [direction === "up" ? shift : -shift, 0] }) },
    ],
  };
}

/** Trendin metni, yönü, anlamı ve sözlü hali ("%12,4 artış, olumlu"). */
function describeTrend(trend: StatisticTrend, locale: string) {
  const tone = trendTone(trend.value, trend.goodWhen ?? "up");
  const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const withUnit = (n: string) => (trend.unit === "points" ? `${n} puan` : `%${n}`);
  const text = withUnit(nf.format(Math.abs(trend.value)));
  let direction: "up" | "down" | "flat" = "flat";
  if (trend.value > 0) direction = "up";
  else if (trend.value < 0) direction = "down";
  const verb = { up: "artış", down: "düşüş", flat: "değişmedi" }[direction];
  // Yön ve anlam ikon/renkte — ekran okuyucuya sözle.
  const spoken = trend.value === 0 ? verb : `${text} ${verb}, ${TONE_WORD[tone]}`;
  return { tone, text, direction, spoken, withUnit };
}

function Trend({ trend, locale, animate, mode, fontSize, lineHeight }: Readonly<{ trend: StatisticTrend; locale: string; animate: boolean; mode: ValueAnimation; fontSize: number; lineHeight: number }>) {
  const theme = useTheme();
  const { tone, text, direction, spoken, withUnit } = describeTrend(trend, locale);
  const fixed = new Intl.NumberFormat(locale, { minimumFractionDigits: Number.isInteger(trend.value) ? 0 : 1, maximumFractionDigits: 1 });
  const shown = useAnimatedValue({ text, number: Math.abs(trend.value), format: (v) => withUnit(fixed.format(v)), mode, enabled: animate });
  const entrance = useTrendEntrance(direction, animate);
  const color = { good: theme.color.success.text, bad: theme.color.error.text, neutral: theme.color.canvas.muted }[tone];
  return (
    <View accessible accessibilityLabel={spoken} aria-label={spoken} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Animated.View style={entrance}>
        {direction === "up" ? <TrendingUpIcon size={16} color={color} /> : null}
        {direction === "down" ? <TrendingDownIcon size={16} color={color} /> : null}
        {direction === "flat" ? <MinusIcon size={16} color={color} strokeWidth={2} /> : null}
      </Animated.View>
      <AnimatedText text={text} shown={shown} style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize, lineHeight, fontWeight: "500", color, fontVariant: ["tabular-nums"] }} />
    </View>
  );
}

/**
 * Sayısal KPI: başlık, yerel biçimli değer, önek/sonek, trend. Trendin rengi
 * yönden değil ANLAMdan (`goodWhen`): maliyetin düşmesi yeşil.
 */
export function Statistic({ title, value, precision, prefix, suffix, trend, description, locale = "tr-TR", size = "md", style, skeleton = false, animated = true, valueAnimation = "count" }: Readonly<StatisticProps>) {
  const theme = useTheme();
  const m = useNativeConfig().statistic[size];
  const text = formatValue(value, precision, locale);
  const animate = animated && !skeleton;
  const decimals = typeof value === "number" ? (precision ?? decimalPlaces(value)) : 0;
  const shown = useAnimatedValue({
    text,
    number: typeof value === "number" ? value : undefined,
    format: (v) => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v),
    mode: valueAnimation,
    enabled: animate,
  });
  const font = nativeFontFamily(theme.fontFamily.sans);
  // Tek parça okunsun: "Aylık gelir, ₺1.284.500, %12,4 artış, olumlu, geçen aya göre".
  const groupLabel = [plain(title), `${plain(prefix)}${text}${plain(suffix)}`, trend ? describeTrend(trend, locale).spoken : "", plain(description)].filter(Boolean).join(", ");
  return (
    <StatisticShell
      title={title}
      prefix={prefix}
      suffix={suffix}
      description={description}
      groupLabel={groupLabel}
      footer={trend ? <Trend trend={trend} locale={locale} animate={animate} mode={valueAnimation} fontSize={m.labelFontSize} lineHeight={m.labelLineHeight} /> : undefined}
      size={size}
      skeleton={skeleton}
      style={style}
    >
      <AnimatedText fit text={text} shown={shown} numberOfLines={1} style={{ fontFamily: font, fontSize: m.valueFontSize, lineHeight: m.valueLineHeight, fontWeight: "600", color: theme.color.canvas.foreground, fontVariant: ["tabular-nums"] }} />
    </StatisticShell>
  );
}

/** Şimdiki zaman, `intervalMs`'de bir (native'de SSR yok → ilk değer hemen). */
function useNow(intervalMs: number, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);
  return now;
}

/**
 * Geri sayım. Her saniye güncellenir ama duyurulmaz (`timer`); kalan süre
 * sözlü olarak erişilebilir adda, süre dolunca bir kez duyurulur.
 */
export function Countdown({ title, target, onFinish, showDays = true, finishedText = "Süre doldu", prefix, suffix, description, size = "md", style, skeleton = false }: Readonly<CountdownProps>) {
  const targetMs = typeof target === "number" ? target : target.getTime();
  const now = useNow(1000);
  const remaining = Math.max(0, targetMs - now);
  const finished = remaining === 0;
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true;
      onFinishRef.current?.();
      if (typeof finishedText === "string") AccessibilityInfo.announceForAccessibility(finishedText);
    }
    if (!finished) finishedRef.current = false;
  }, [finished, finishedText]);

  return (
    <StatisticShell
      title={title}
      prefix={finished ? undefined : prefix}
      suffix={finished ? undefined : suffix}
      description={description}
      size={size}
      skeleton={skeleton}
      style={style}
      valueRole="timer"
      valueLabel={finished ? plain(finishedText) || undefined : `Kalan süre: ${spokenDuration(remaining)}`}
    >
      {finished ? finishedText : formatCountdown(remaining, { showDays })}
    </StatisticShell>
  );
}

/** Canlı saat; saniyesizde dakikada bir değişir ama saniyede bir kontrol edilir. */
export function Clock({ title, timeZone, showSeconds = false, locale = "tr-TR", prefix, suffix, description, size = "md", style, skeleton = false }: Readonly<ClockProps>) {
  const now = useNow(1000);
  const text = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: showSeconds ? "2-digit" : undefined, hour12: false, timeZone }).format(new Date(now));
  return (
    <StatisticShell title={title} prefix={prefix} suffix={suffix} description={description} size={size} skeleton={skeleton} style={style} valueRole="timer" groupLabel={[plain(title), text, plain(description)].filter(Boolean).join(", ")}>
      {text}
    </StatisticShell>
  );
}

/**
 * Kronometre: Başlat / Duraklat / Sıfırla. Salise görünür ama duyurulmaz;
 * durdurulunca geçen süre sözlü olarak duyurulur.
 */
export function Stopwatch({ title, controls = true, autoStart = false, onStop, prefix, suffix, description, size = "md", style, skeleton = false }: Readonly<StopwatchProps>) {
  const theme = useTheme();
  const [running, setRunning] = useState(autoStart);
  const [base, setBase] = useState(0);
  const startedAt = useRef<number | null>(autoStart ? Date.now() : null);
  // ~30 fps yeterli (salise iki basamak).
  const now = useNow(33, running);
  const elapsed = base + (running && startedAt.current !== null ? Math.max(0, now - startedAt.current) : 0);

  const start = () => {
    startedAt.current = Date.now();
    setRunning(true);
  };
  const pause = () => {
    const total = base + (startedAt.current === null ? 0 : Date.now() - startedAt.current);
    startedAt.current = null;
    setBase(total);
    setRunning(false);
    AccessibilityInfo.announceForAccessibility(`Durduruldu: ${spokenDuration(total)}`);
    onStop?.(total);
  };
  const reset = () => {
    if (running || base > 0) onStop?.(elapsed);
    startedAt.current = running ? Date.now() : null;
    setBase(0);
    AccessibilityInfo.announceForAccessibility("Sıfırlandı");
  };

  const ink = theme.color.canvas.foreground;
  const footer = controls ? (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {running ? (
        <Button size="sm" variant="outline" color="neutral" icon={<PauseIcon size={14} color={ink} />} onPress={pause} disabled={skeleton}>
          Duraklat
        </Button>
      ) : (
        <Button size="sm" icon={<PlayIcon size={14} color={theme.color.primary.solidContrast} />} onPress={start} disabled={skeleton}>
          {base > 0 ? "Devam et" : "Başlat"}
        </Button>
      )}
      <Button size="sm" variant="ghost" color="neutral" icon={<RotateCcwIcon size={14} color={ink} />} onPress={reset} disabled={skeleton || (!running && base === 0)}>
        Sıfırla
      </Button>
    </View>
  ) : undefined;

  return (
    <StatisticShell title={title} prefix={prefix} suffix={suffix} description={description} descriptionBlock footer={footer} size={size} skeleton={skeleton} style={style} valueRole="timer" valueLabel={spokenDuration(elapsed)}>
      {formatStopwatch(elapsed)}
    </StatisticShell>
  );
}
