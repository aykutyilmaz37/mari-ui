import React, { useState } from "react";
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeStepsSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Button } from "../Button";
import { CheckIcon, XIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { dotColor, getStepNumber, indicatorColors, railColor, resolveLayout, resolveStepStatus, defaultStatusLabels, titleStyle, type StepStatus, type StepsLayout, type StepsVariant } from "./utils";

export type { StepStatus, StepsVariant };
export type StepsSize = "sm" | "md";
export type StepsLabelPlacement = "horizontal" | "vertical";

export interface StepItem {
  title: React.ReactNode;
  /** Başlığın yanında soluk ikincil metin (süre, tarih). */
  subTitle?: React.ReactNode;
  description?: React.ReactNode;
  /** Numara yerine dairede ikon (ör. lucide-react-native) — `size` ve `color` alır. */
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  /** 1 tabanlı kimlik; `currentStep` bununla karşılaştırılır. Varsayılan: sırası. */
  step?: number;
  status?: StepStatus;
  /** Dokunulabilir Steps'te bu adıma gidilemez. */
  disabled?: boolean;
}

export type StepData = StepItem[];

/** Steps'in yerleşik metinleri — varsayılanlar Türkçe; başka dilde hepsini verin. */
export interface StepsLabels {
  /** Ekran okuyucu durum eki. */
  status: Record<StepStatus, string>;
  /** Ekran okuyucu yüzde eki: `%40` gibi. */
  percent: (percent: number) => string;
  /** Kompakt başlık: "Adım 2/4". */
  stepOf: (current: number, total: number) => string;
  back: string;
  next: string;
  complete: string;
}

export const defaultStepsLabels: StepsLabels = {
  status: defaultStatusLabels,
  percent: (p) => `%${p}`,
  stepOf: (current, total) => `Adım ${current}/${total}`,
  back: "Geri",
  next: "İleri",
  complete: "Tamamla",
};

export interface StepsProps extends SkeletonableProps {
  data: StepData;
  /** Geçerli adım (1 tabanlı). */
  currentStep: number;
  /** Geçerli adımın durumu (`"error"`: ödeme reddedildi). Varsayılan: `"process"`. */
  status?: Exclude<StepStatus, "wait">;
  /** Verilirse adımlar dokunulabilir ve altta Geri/İleri çubuğu. */
  onChange?: (step: number) => void;
  /** Son adımda "Tamamla". Verilmezse "Tamamla" devre dışı. */
  onComplete?: () => void;
  /** Varsayılan: `onChange` verildiyse `true`. */
  showActions?: boolean;
  color?: ColorRole;
  variant?: StepsVariant;
  /** `"md"` 32 · `"sm"` 24 gösterge. */
  size?: StepsSize;
  vertical?: boolean;
  /** Yatayda başlık göstergenin yanında ya da altında ortalı. `dot` iken hep altında. */
  labelPlacement?: StepsLabelPlacement;
  /** Numara/ikon yerine küçük nokta — sade zaman çizelgesi. */
  dot?: boolean;
  /** Geçerli adımın göstergesinin etrafında ilerleme halkası (0–100). */
  percent?: number;
  /** Kapsayıcı bu genişliğin (pt) altındaysa dar düzene geçer; `false` kapatır. Varsayılan: `520`. */
  responsive?: number | false;
  /** Dar düzen: `"vertical"` dikey liste, `"compact"` yalnız göstergeler + "Adım 2/4 · Başlık". */
  responsiveLayout?: "vertical" | "compact";
  /** Adımların altında, eylem çubuğunun üstünde (bkz. `StepsContent`). */
  content?: React.ReactNode;
  /** Yerleşik metinler (durum, "Adım 2/4", Geri/İleri/Tamamla); verilmeyen Türkçe varsayılanı kullanır. */
  labels?: Partial<StepsLabels>;
  /** Varsayılan: "İlerleme adımları". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const plain = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "");

/** İskelette metin kendi kutusunda dolgu, harfler görünmez — gerçek genişlik/satır korunur. */
function SkText({ skeleton, children }: Readonly<{ skeleton: boolean; children: React.ReactNode }>) {
  if (!skeleton) return <>{children}</>;
  return <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start" }}>{children}</SkeletonBox>;
}

interface Ctx {
  item: StepItem;
  index: number;
  step: number;
  status: StepStatus;
  isCurrent: boolean;
  isLast: boolean;
  rail: string;
}

interface IndicatorProps {
  ctx: Ctx;
  m: NativeStepsSize;
  theme: Theme;
  color: ColorRole;
  variant: StepsVariant;
  dot: boolean;
  /** stacked yerleşimde nokta kutusu tam genişlik. */
  wide: boolean;
  percent?: number;
  skeleton: boolean;
}

/** Halka 5pt taşar — komşu çizgi/başlıkla çakışmasın diye yatay pay. */
function ProgressRing({ m, theme, color, percent }: Readonly<{ m: NativeStepsSize; theme: Theme; color: ColorRole; percent: number }>) {
  const ring = m.indicator + 10;
  const r = ring / 2 - 1;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <Svg width={ring} height={ring} style={{ position: "absolute", left: -6, top: -6, transform: [{ rotate: "-90deg" }] }}>
      <Circle cx={ring / 2} cy={ring / 2} r={r} fill="none" strokeWidth={2} stroke={theme.color.canvas.border} />
      <Circle cx={ring / 2} cy={ring / 2} r={r} fill="none" strokeWidth={2} strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={circumference * (1 - clamped / 100)} stroke={theme.color[color].solid} />
    </Svg>
  );
}

/** Dairenin içi: hata → ×, ikon, tamamlandı → ✓, yoksa numara. */
function Glyph({ ctx, m, fg, font }: Readonly<{ ctx: Ctx; m: NativeStepsSize; fg: string; font?: string }>) {
  const Icon = ctx.item.icon;
  if (ctx.status === "error") return <XIcon size={m.iconSize} color={fg} />;
  if (Icon) return <Icon size={m.iconSize} color={fg} />;
  if (ctx.status === "finish") return <CheckIcon size={m.iconSize} color={fg} strokeWidth={2.5} />;
  return <Text style={{ fontFamily: font, fontSize: m.numberFontSize, fontWeight: "600", color: fg, fontVariant: ["tabular-nums"] }}>{getStepNumber(ctx.item, ctx.index)}</Text>;
}

function StepIndicator({ ctx, m, theme, color, variant, dot, wide, percent, skeleton }: Readonly<IndicatorProps>) {
  if (dot) {
    const big = ctx.status === "process" || ctx.status === "error";
    const d = big ? 10 : 8;
    return (
      <View style={{ width: wide ? undefined : 12, height: m.indicator, alignItems: "center", justifyContent: "center" }}>
        {skeleton ? <SkeletonBox style={{ width: 10, height: 10, borderRadius: 5 }} /> : <View style={{ width: d, height: d, borderRadius: 5, backgroundColor: dotColor(theme, ctx.status, color) }} />}
      </View>
    );
  }
  const box: ViewStyle = { width: m.indicator, height: m.indicator, borderRadius: m.indicator / 2, alignItems: "center", justifyContent: "center", borderWidth: 1 };
  const hasRing = ctx.status === "process" && percent !== undefined;
  // İskelette halka çizilmez ama payı korunur — yüklenince kaymasın.
  const ringPad = hasRing ? { marginHorizontal: 4 } : null;
  if (skeleton) return <SkeletonBox style={[box, ringPad]} />;
  const colors = indicatorColors(theme, ctx.status, color, variant);
  return (
    <View style={[box, { backgroundColor: colors.background, borderColor: colors.border }, ringPad]}>
      <Glyph ctx={ctx} m={m} fg={colors.foreground} font={nativeFontFamily(theme.fontFamily.sans)} />
      {hasRing ? <ProgressRing m={m} theme={theme} color={color} percent={percent} /> : null}
    </View>
  );
}

export function Steps({
  data,
  currentStep,
  status: currentStatus = "process",
  onChange,
  onComplete,
  showActions,
  color = "primary",
  variant = "filled",
  size = "md",
  vertical = false,
  labelPlacement = "horizontal",
  dot = false,
  percent,
  responsive = 520,
  responsiveLayout = "vertical",
  content,
  labels: labelsProp,
  accessibilityLabel = "İlerleme adımları",
  skeleton = false,
  style,
}: Readonly<StepsProps>) {
  const theme = useTheme();
  const m = useNativeConfig().steps[size];
  const font = nativeFontFamily(theme.fontFamily.sans);
  const c = theme.color.canvas;
  const labels: StepsLabels = { ...defaultStepsLabels, ...labelsProp, status: { ...defaultStatusLabels, ...labelsProp?.status } };
  const [width, setWidth] = useState<number>();
  const [itemWidth, setItemWidth] = useState(0);
  const isNarrow = !vertical && responsive !== false && width !== undefined && width < responsive;
  const layout: StepsLayout = resolveLayout(vertical, isNarrow, responsiveLayout, dot, labelPlacement);

  const interactive = Boolean(onChange);
  const actionsVisible = showActions ?? interactive;
  const stepNumbers = data.map(getStepNumber);
  const isLastStep = currentStep === stepNumbers[stepNumbers.length - 1];
  const isFirstStep = currentStep === stepNumbers[0];

  const titleText: TextStyle = { fontFamily: font, fontSize: m.titleFontSize, lineHeight: m.titleLineHeight };
  const descText: TextStyle = { fontFamily: font, fontSize: m.descriptionFontSize, lineHeight: m.descriptionLineHeight, color: c.muted };
  const railStyle = (ctx: Ctx): ViewStyle => ({ backgroundColor: skeleton ? c.border : ctx.rail, borderRadius: 1 });

  const indicator = (ctx: Ctx) => <StepIndicator ctx={ctx} m={m} theme={theme} color={color} variant={variant} dot={dot} wide={layout === "stacked"} percent={percent} skeleton={skeleton} />;

  const texts = (ctx: Ctx, withRail: boolean) => {
    const stacked = layout === "stacked";
    const t = titleStyle(theme, ctx.status);
    const align: TextStyle = { textAlign: stacked ? "center" : "left" };
    return (
      <View style={[{ minWidth: 0, gap: 2 }, stacked ? { alignItems: "center" } : { flex: 1 }]}>
        {/* Altta ortalı düzende dar adımda alt başlık alt satıra iner (komşuyla çakışmasın). */}
        <View style={[{ flexDirection: "row", alignItems: "center", columnGap: 8, minWidth: 0 }, stacked ? { flexWrap: "wrap", justifyContent: "center" } : { minHeight: m.indicator }]}>
          <SkText skeleton={skeleton}>
            <Text numberOfLines={layout === "inline" ? 1 : undefined} style={[titleText, align, { color: t.color, fontWeight: t.fontWeight }]}>{ctx.item.title}</Text>
          </SkText>
          {ctx.item.subTitle != null ? (
            <SkText skeleton={skeleton}>
              <Text numberOfLines={1} style={descText}>{ctx.item.subTitle}</Text>
            </SkText>
          ) : null}
          {withRail && !ctx.isLast ? <View style={[railStyle(ctx), { flex: 1, minWidth: 24, height: 1, marginLeft: 4, marginRight: 12 }]} /> : null}
        </View>
        {ctx.item.description != null ? (
          <SkText skeleton={skeleton}>
            <Text style={[descText, align]}>{ctx.item.description}</Text>
          </SkText>
        ) : null}
      </View>
    );
  };

  /** Adım kabuğu: dokunulabilirse düğme (doğrudan atlama), değilse tek parça okunan öğe; durum adında. */
  const wrap = (ctx: Ctx, inner: React.ReactNode, wrapStyle: StyleProp<ViewStyle>) => {
    const { item, step, status, isCurrent } = ctx;
    const extra = status === "process" && percent !== undefined ? `, ${labels.percent(Math.round(percent))}` : "";
    const label = plain(item.title) ? `${plain(item.title)} (${labels.status[status]}${extra})` : undefined;
    if (!interactive) {
      return (
        <View accessible={!skeleton} accessibilityLabel={label} aria-label={label} aria-current={isCurrent ? "step" : undefined} style={wrapStyle}>
          {inner}
        </View>
      );
    }
    const disabled = Boolean(item.disabled) || skeleton;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isCurrent, disabled }}
        aria-label={label}
        aria-current={isCurrent ? "step" : undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={() => step !== currentStep && onChange?.(step)}
        style={({ pressed }) => [wrapStyle, { opacity: (item.disabled ? 0.5 : 1) * (pressed ? 0.6 : 1) }]}
      >
        {inner}
      </Pressable>
    );
  };

  const renderers: Record<StepsLayout, (ctx: Ctx) => React.ReactNode> = {
    compact: (ctx) => (
      <View key={ctx.step} role="listitem" style={{ flexDirection: "row", alignItems: "center", flex: ctx.isLast ? undefined : 1, minWidth: 0 }}>
        {/* Dokunma hedefi: göstergenin etrafında 6pt pay (32 → 44). */}
        {wrap(ctx, indicator(ctx), { padding: 6, margin: -6, borderRadius: 999 })}
        {ctx.isLast ? null : <View style={[railStyle(ctx), { flex: 1, minWidth: 12, height: 1, marginHorizontal: 12 }]} />}
      </View>
    ),
    vertical: (ctx) => {
      const gapBelow = size === "sm" ? 16 : 24;
      return (
        <View key={ctx.step} role="listitem">
          {wrap(
            ctx,
            <>
              <View style={{ alignItems: "center" }}>
                {indicator(ctx)}
                {ctx.isLast ? null : <View style={[railStyle(ctx), { flex: 1, width: dot ? 2 : 1, minHeight: 24, marginVertical: 6 }]} />}
              </View>
              <View style={{ flex: 1, minWidth: 0, paddingBottom: ctx.isLast ? 0 : gapBelow }}>{texts(ctx, false)}</View>
            </>,
            { flexDirection: "row", gap: 12 }
          )}
        </View>
      );
    },
    stacked: (ctx) => {
      const half = dot ? 5 : m.indicator / 2;
      const gap = dot ? 12 : 8;
      // Çizgi bu öğenin merkezinden sonrakinin merkezine (öğeler eşit genişlikte; ilki ölçülür).
      const rail = !ctx.isLast && itemWidth > 0 ? (
        <View style={[railStyle(ctx), { position: "absolute", height: dot ? 2 : 1, top: m.indicator / 2 - (dot ? 1 : 0.5), left: itemWidth / 2 + half + gap, width: Math.max(0, itemWidth - 2 * (half + gap)) }]} />
      ) : null;
      return (
        <View key={ctx.step} role="listitem" style={{ flex: 1, minWidth: 0 }} onLayout={ctx.index === 0 ? (e) => setItemWidth(e.nativeEvent.layout.width) : undefined}>
          {rail}
          {wrap(ctx, <>{indicator(ctx)}{texts(ctx, false)}</>, { alignItems: "center", gap: 8, paddingHorizontal: 8 })}
        </View>
      );
    },
    inline: (ctx) => (
      <View key={ctx.step} role="listitem" style={{ flexDirection: "row", minWidth: 0, flex: ctx.isLast ? undefined : 1 }}>
        {wrap(ctx, <>{indicator(ctx)}{texts(ctx, true)}</>, { flexDirection: "row", flex: 1, minWidth: 0, alignItems: "flex-start", gap: 12 })}
      </View>
    ),
  };

  const contexts: Ctx[] = data.map((item, index) => {
    const status = resolveStepStatus(item, index, currentStep, currentStatus);
    const step = getStepNumber(item, index);
    return { item, index, step, status, isCurrent: step === currentStep, isLast: index === data.length - 1, rail: railColor(theme, status, color) };
  });

  /** Kompakt modda geçerli adımın görsel özeti; ekran okuyucu aynı bilgiyi göstergelerden alır. */
  const caption = () => {
    const ctx = contexts.find((x) => x.isCurrent);
    if (!ctx) return null;
    const t = titleStyle(theme, ctx.status);
    return (
      <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ marginTop: -12, gap: 2 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 8 }}>
          <SkText skeleton={skeleton}>
            <Text style={descText}>{labels.stepOf(ctx.index + 1, data.length)}</Text>
          </SkText>
          <SkText skeleton={skeleton}>
            <Text style={[titleText, { color: t.color, fontWeight: t.fontWeight }]}>{ctx.item.title}</Text>
          </SkText>
          {ctx.item.subTitle != null ? (
            <SkText skeleton={skeleton}>
              <Text style={descText}>{ctx.item.subTitle}</Text>
            </SkText>
          ) : null}
        </View>
        {ctx.item.description != null ? (
          <SkText skeleton={skeleton}>
            <Text style={descText}>{ctx.item.description}</Text>
          </SkText>
        ) : null}
      </View>
    );
  };

  const actions = onChange && actionsVisible ? (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 24 }}>
      <Button skeleton={skeleton} color="neutral" variant="outline" disabled={isFirstStep} onPress={() => onChange(currentStep - 1)}>
        {labels.back}
      </Button>
      {isLastStep ? (
        <Button skeleton={skeleton} color={color} disabled={!onComplete} onPress={onComplete}>
          {labels.complete}
        </Button>
      ) : (
        <Button skeleton={skeleton} color={color} onPress={() => onChange(currentStep + 1)}>
          {labels.next}
        </Button>
      )}
    </View>
  ) : null;

  return (
    <View style={[{ alignSelf: "stretch", gap: 24 }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View
        accessibilityRole="list"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        {...(skeleton ? { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const } : null)}
        style={{ flexDirection: layout === "vertical" ? "column" : "row", alignItems: layout === "vertical" ? "stretch" : "flex-start" }}
      >
        {contexts.map(renderers[layout])}
      </View>
      {layout === "compact" ? caption() : null}
      {content}
      {actions}
    </View>
  );
}

export interface StepsContentProps {
  value: number;
  currentSteps: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Yalnız geçerli adımın içeriği; görsel kutu dayatmaz (web ile aynı). */
export function StepsContent({ value, currentSteps, children, style }: StepsContentProps) {
  return currentSteps === value ? <View style={[{ alignSelf: "stretch" }, style]}>{children}</View> : null;
}
