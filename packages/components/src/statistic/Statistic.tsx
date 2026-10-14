"use client";

import React, { useEffect, useRef, useState } from "react";
import { MinusIcon, PauseIcon, PlayIcon, RotateCcwIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { SkeletonBlock } from "../skeleton";
import type { ClockProps, CountdownProps, StatisticProps, StopwatchProps } from "./types";
import { decimalPlaces, formatCountdown, formatStopwatch, formatValue, spokenDuration, trendTone, type TrendTone } from "./utils";
import { AnimatedText, useAnimatedValue, type ValueAnimation } from "../lib/useAnimatedValue";

export type { StatisticProps, CountdownProps, ClockProps, StopwatchProps };

const VALUE_SIZE = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" } as const;
const TONE_CLASS: Record<TrendTone, string> = {
  good: "text-mari-success",
  bad: "text-mari-error",
  neutral: "text-mari-muted",
};
const TONE_WORD: Record<TrendTone, string> = { good: "olumlu", bad: "olumsuz", neutral: "değişmedi" };

interface ShellProps {
  title?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size: NonNullable<StatisticProps["size"]>;
  skeleton: boolean;
  className?: string;
  /** Değerin kendisi (metin). */
  children: React.ReactNode;
  /** Değer kutusuna ek öznitelikler (role="timer" vb.). */
  valueProps?: React.HTMLAttributes<HTMLElement> & { dateTime?: string };
  valueAs?: "p" | "time";
}

/** Ölçülecek içerik yoksa (yerleşimsiz ortam) genel yer tutucu: başlık, değer, alt satır. */
const PLACEHOLDER = (
  <div className="flex flex-col gap-2 py-0.5">
    <SkeletonBlock active width="40%" height="0.75rem" radius="sm" />
    <SkeletonBlock active width="60%" height="1.5rem" radius="sm" />
    <SkeletonBlock active width="50%" height="0.75rem" radius="sm" />
  </div>
);

/**
 * Ortak düzen: soluk başlık, büyük değer (önek/sonekle), altta trend ya da
 * açıklama. İskelet `ContentSkeleton` ile içeriğin KENDİ şeklinde: her metin
 * satırı ve ikon kendi genişliğinde blok, gerçek içerik görünmez olarak yerinde
 * (yükseklik zıplamaz). Eskiden bölgeleri tam genişlik çubuğa çevirip metni
 * saydam yapıyordu — kendi rengi olan önek/sonek (₺, %) ve trend (yeşil/kırmızı
 * metin, ikon) iskeletin üstünde görünür kalıyordu (kullanıcı bulgusu).
 */
function StatisticShell({ title, prefix, suffix, description, footer, size, skeleton, className, children, valueProps, valueAs = "p" }: Readonly<ShellProps>) {
  const Value = valueAs;
  return (
    <div className={cn("min-w-0", className)} aria-busy={skeleton || undefined}>
      <ContentSkeleton on={skeleton} fallback={PLACEHOLDER}>
        <div className="flex min-w-0 flex-col gap-1">
          {title && <p className="text-sm text-mari-muted">{title}</p>}
          <Value {...valueProps} className={cn("flex min-w-0 items-baseline gap-1 font-semibold tabular-nums tracking-tight text-mari-foreground", VALUE_SIZE[size])}>
            {prefix && <span className="text-[0.6em] font-medium text-mari-muted">{prefix}</span>}
            <span className="truncate">{children}</span>
            {suffix && <span className="text-[0.6em] font-medium text-mari-muted">{suffix}</span>}
          </Value>
          {/* Trend + açıklama bir CÜMLE gibi akar ("▲ %12 geçen aya göre"): dar kartta açıklama kelime
              kelime sarar. Eskiden flex öğeleriydi — 1px sığmayınca açıklamanın TAMAMI alt satıra atlıyordu. */}
          {(footer || description) && (
            <div className="text-sm leading-6">
              {footer}
              {footer && description && " "}
              {description && <span className="text-mari-muted">{description}</span>}
            </div>
          )}
        </div>
      </ContentSkeleton>
    </div>
  );
}

/** Trend oku yönünde kayarak gelir (yukarı ok aşağı-soldan, aşağı ok yukarı-soldan); yatay çizgi belirir. */
const TREND_ICON_ANIMATION = {
  up: "animate-[mari-trend-up_500ms_var(--mari-easing-decelerate)_both] motion-reduce:animate-none",
  down: "animate-[mari-trend-down_500ms_var(--mari-easing-decelerate)_both] motion-reduce:animate-none",
  flat: "animate-[mari-fade-in_400ms_ease-out_both] motion-reduce:animate-none",
} as const;

interface TrendProps {
  trend: NonNullable<StatisticProps["trend"]>;
  locale: string;
  animate: boolean;
  mode: ValueAnimation;
}

function Trend({ trend, locale, animate, mode }: Readonly<TrendProps>) {
  const tone = trendTone(trend.value, trend.goodWhen ?? "up");
  const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const withUnit = (n: string) => (trend.unit === "points" ? `${n} puan` : `%${n}`);
  const text = withUnit(nf.format(Math.abs(trend.value)));
  const fixed = new Intl.NumberFormat(locale, { minimumFractionDigits: Number.isInteger(trend.value) ? 0 : 1, maximumFractionDigits: 1 });
  const shown = useAnimatedValue({ text, number: Math.abs(trend.value), format: (v) => withUnit(fixed.format(v)), mode, enabled: animate });
  let Icon = MinusIcon;
  let verb = "değişmedi";
  let direction: keyof typeof TREND_ICON_ANIMATION = "flat";
  if (trend.value > 0) {
    Icon = TrendingUpIcon;
    verb = "artış";
    direction = "up";
  } else if (trend.value < 0) {
    Icon = TrendingDownIcon;
    verb = "düşüş";
    direction = "down";
  }
  return (
    <span className={cn("mr-0.5 inline-flex items-center gap-1 align-top font-medium", TONE_CLASS[tone])}>
      {/* key: yön değişince ok yeniden canlansın. */}
      <Icon key={direction} aria-hidden size={16} className={animate ? TREND_ICON_ANIMATION[direction] : undefined} />
      <AnimatedText text={text} shown={shown} />
      {/* Yön ve anlam ikon/renkte — ekran okuyucuya sözle. */}
      <span className="sr-only">
        {trend.value === 0 ? verb : `${verb}, ${TONE_WORD[tone]}`}
      </span>
    </span>
  );
}

/**
 * Faz 16.2 — sayısal KPI (ant.design Statistic): başlık, tr-TR biçimli değer,
 * önek/sonek, trend. Trendin rengi yönden değil ANLAMdan (`goodWhen`):
 * maliyetin düşmesi yeşil. Yön ve anlam ekran okuyucuya sözle de söylenir.
 */
export function Statistic({
  title,
  value,
  precision,
  prefix,
  suffix,
  trend,
  description,
  locale = "tr-TR",
  size = "md",
  className,
  skeleton = false,
  animated = true,
  valueAnimation = "count",
}: Readonly<StatisticProps>) {
  const text = formatValue(value, precision, locale);
  const animate = animated && !skeleton;
  // Sayarken ara değerler hedefin basamak sayısıyla — "1.284.500,5" sayarken 17 ondalık görünmesin.
  const decimals = typeof value === "number" ? (precision ?? decimalPlaces(value)) : 0;
  const shown = useAnimatedValue({
    text,
    number: typeof value === "number" ? value : undefined,
    format: (v) => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v),
    mode: valueAnimation,
    enabled: animate,
  });
  return (
    <StatisticShell
      title={title}
      prefix={prefix}
      suffix={suffix}
      description={description}
      footer={trend ? <Trend trend={trend} locale={locale} animate={animate} mode={valueAnimation} /> : undefined}
      size={size}
      skeleton={skeleton}
      className={className}
    >
      <AnimatedText text={text} shown={shown} />
    </StatisticShell>
  );
}

/**
 * Şimdiki zaman, `intervalMs`'de bir güncellenir. İlk render'da `null` —
 * sunucuda render edilen saat istemcidekiyle aynı olmaz (hidrasyon uyuşmazlığı),
 * bu yüzden değer ancak takıldıktan sonra çizilir.
 */
function useNow(intervalMs: number, enabled = true): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);
  return now;
}

/**
 * Geri sayım. Her saniye güncellenir ama duyurulmaz (`role="timer"` →
 * ekran okuyucu her saniye konuşmaz); kalan süre sözlü olarak
 * `aria-label`da, süre dolunca bir kez duyurulur.
 */
export function Countdown({ title, target, onFinish, showDays = true, finishedText = "Süre doldu", prefix, suffix, description, size = "md", className, skeleton = false }: Readonly<CountdownProps>) {
  const targetMs = typeof target === "number" ? target : target.getTime();
  const now = useNow(1000);
  const remaining = now === null ? null : Math.max(0, targetMs - now);
  const finished = remaining === 0;
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true;
      onFinishRef.current?.();
    }
    if (!finished) finishedRef.current = false;
  }, [finished]);

  let display: React.ReactNode = "--:--";
  if (remaining !== null) display = finished ? finishedText : formatCountdown(remaining, { showDays });

  return (
    <>
      <StatisticShell
        title={title}
        prefix={finished ? undefined : prefix}
        suffix={finished ? undefined : suffix}
        description={description}
        size={size}
        skeleton={skeleton}
        className={className}
        valueProps={{ role: "timer", "aria-label": remaining === null || finished ? undefined : `Kalan süre: ${spokenDuration(remaining)}` }}
      >
        {display}
      </StatisticShell>
      <span role="status" className="sr-only">
        {finished && typeof finishedText === "string" ? finishedText : ""}
      </span>
    </>
  );
}

/** Canlı saat (`<time>`); saniyesiz modda dakikada bir değişir ama saniyede bir kontrol edilir (dakika kaçmasın). */
export function Clock({ title, timeZone, showSeconds = false, locale = "tr-TR", prefix, suffix, description, size = "md", className, skeleton = false }: Readonly<ClockProps>) {
  const now = useNow(1000);
  const date = now === null ? null : new Date(now);
  const text = date ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: showSeconds ? "2-digit" : undefined, hour12: false, timeZone }).format(date) : "--:--";
  return (
    <StatisticShell
      title={title}
      prefix={prefix}
      suffix={suffix}
      description={description}
      size={size}
      skeleton={skeleton}
      className={className}
      valueAs="time"
      valueProps={{ role: "timer", dateTime: date?.toISOString() }}
    >
      {text}
    </StatisticShell>
  );
}

/**
 * Kronometre: Başlat / Duraklat / Sıfırla. Salise görünür ama duyurulmaz
 * (`role="timer"`); durdurulunca geçen süre sözlü olarak durum bölgesinde okunur.
 */
export function Stopwatch({ title, controls = true, autoStart = false, onStop, prefix, suffix, description, size = "md", className, skeleton = false }: Readonly<StopwatchProps>) {
  const [running, setRunning] = useState(autoStart);
  const [base, setBase] = useState(0);
  const startedAt = useRef<number | null>(autoStart ? Date.now() : null);
  const now = useNow(31, running);
  const elapsed = base + (running && startedAt.current !== null && now !== null ? now - startedAt.current : 0);
  const [announce, setAnnounce] = useState("");

  const start = () => {
    startedAt.current = Date.now();
    setRunning(true);
    setAnnounce("");
  };
  const pause = () => {
    const total = base + (startedAt.current === null ? 0 : Date.now() - startedAt.current);
    startedAt.current = null;
    setBase(total);
    setRunning(false);
    setAnnounce(`Durduruldu: ${spokenDuration(total)}`);
    onStop?.(total);
  };
  const reset = () => {
    if (running || base > 0) onStop?.(elapsed);
    startedAt.current = running ? Date.now() : null;
    setBase(0);
    setAnnounce("Sıfırlandı");
  };

  // Açıklama ("Hedef: 1 dakika") değerin altında KENDİ satırında, düğmeler onun altında —
  // KPI'daki gibi aynı satırda düğmelerin yanına düşmesin.
  const descriptionLine = description ? <span className="block text-mari-muted">{description}</span> : null;
  const footer = controls ? (
    <div className="mt-1 flex gap-2">
      {running ? (
        <Button size="sm" variant="outline" color="neutral" icon={<PauseIcon size={14} aria-hidden />} onClick={pause} disabled={skeleton}>
          Duraklat
        </Button>
      ) : (
        <Button size="sm" icon={<PlayIcon size={14} aria-hidden />} onClick={start} disabled={skeleton}>
          {base > 0 ? "Devam et" : "Başlat"}
        </Button>
      )}
      <Button size="sm" variant="ghost" color="neutral" icon={<RotateCcwIcon size={14} aria-hidden />} onClick={reset} disabled={skeleton || (!running && base === 0)}>
        Sıfırla
      </Button>
    </div>
  ) : undefined;

  return (
    <>
      <StatisticShell
        title={title}
        prefix={prefix}
        suffix={suffix}
        footer={
          descriptionLine || footer ? (
            <>
              {descriptionLine}
              {footer}
            </>
          ) : undefined
        }
        size={size}
        skeleton={skeleton}
        className={className}
        valueProps={{ role: "timer" }}
      >
        {formatStopwatch(elapsed)}
      </StatisticShell>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </>
  );
}
