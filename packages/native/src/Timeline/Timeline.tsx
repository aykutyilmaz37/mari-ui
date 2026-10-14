import React, { useState } from "react";
import { ScrollView, Text, View, type TextStyle } from "react-native";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { SkeletonBox, SkeletonText } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { buildItems, resolveSide } from "./timelineUtils";
import type { TimelineItem, TimelineProps } from "./types";

export type { TimelineItem, TimelineProps } from "./types";

const DOT = 12;
const RAIL = 24;
const LINE = 2;

interface Ctx {
  theme: Theme;
  variant: "outlined" | "filled";
  skeleton: boolean;
  title: TextStyle;
  content: TextStyle;
}

/** Nokta / ikon / dönen gösterge. */
function Marker({ item, ctx }: { item: TimelineItem; ctx: Ctx }) {
  const { theme, variant, skeleton } = ctx;
  const color = theme.color[item.color ?? "primary"].solid;
  if (skeleton) return <SkeletonBox style={{ width: DOT, height: DOT, borderRadius: DOT / 2 }} />;
  if (item.loading) return <Spinner size={14} color={theme.color.canvas.muted} />;
  if (item.icon != null) return <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>{typeof item.icon === "function" ? item.icon(color) : item.icon}</View>;
  return <View style={{ width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2, borderColor: color, backgroundColor: variant === "filled" ? color : theme.color.canvas.surface }} />;
}

/**
 * Ray parçası. Kesikli çizgi küçük parçalarla çizilir — iOS tek kenarlı
 * `borderStyle: "dashed"`i çizmiyor.
 */
function Line({ dashed, horizontal, color }: { dashed: boolean; horizontal: boolean; color: string }) {
  const along: object = horizontal ? { height: LINE, flex: 1 } : { width: LINE, flex: 1 };
  if (!dashed) return <View style={[along, { backgroundColor: color, borderRadius: 1 }]} />;
  return (
    // Parçalar mutlak katmanda: satırın yüksekliğini (genişliğini) uzatmasınlar, fazlası kırpılır.
    <View style={[along, { overflow: "hidden" }]}>
      <View style={{ position: "absolute", top: 0, left: 0, flexDirection: horizontal ? "row" : "column", gap: 4 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <View key={i} style={horizontal ? { width: 4, height: LINE, backgroundColor: color } : { width: LINE, height: 4, backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}

/** Metin düğümü: düz metinse stil + iskelette ince çubuk. */
function Txt({ node, style, ctx, align }: { node: React.ReactNode; style: TextStyle; ctx: Ctx; align?: "left" | "right" | "center" }) {
  if (node == null) return null;
  const textAlign = align ?? "left";
  const el = typeof node === "string" || typeof node === "number" ? <Text style={[style, { textAlign }]}>{node}</Text> : node;
  if (!ctx.skeleton) return <>{el}</>;
  return (
    <SkeletonText fontSize={style.fontSize ?? 15}>
      {el}
    </SkeletonText>
  );
}

interface RowProps {
  item: TimelineItem;
  last: boolean;
  /** Sıradaki öğe "sürüyor" → bu öğenin rayı kesikli. */
  nextLoading: boolean;
  side: "after" | "before";
  threeColumn: boolean;
  /** İki yan eşit genişlikte (alternate); değilse karşı sütun içeriği kadar. */
  balanced: boolean;
  opposite: boolean;
  ctx: Ctx;
}

/** Dikey satır: [karşı sütun] [ray: işaret + çizgi] [içerik]. */
function VerticalRow({ item, last, nextLoading, side, threeColumn, balanced, opposite, ctx }: RowProps) {
  const c = ctx.theme.color.canvas;
  const body = (align: "left" | "right") => (
    <View style={{ gap: 2, paddingBottom: last ? 0 : 20, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      {opposite ? null : <Txt node={item.title} style={ctx.title} ctx={ctx} align={align} />}
      <Txt node={item.content} style={ctx.content} ctx={ctx} align={align} />
    </View>
  );
  // Karşı sütun: opposite'te başlık; alternate'de içerik ya da boş.
  const otherSide = opposite ? <Txt node={item.title} style={ctx.title} ctx={ctx} align={side === "after" ? "right" : "left"} /> : null;
  const left = side === "after" ? otherSide : body("right");
  const right = side === "after" ? body("left") : otherSide;
  // Karşı sütun (opposite başlığı) içeriği kadar, en az 48; gövde sütunu esner.
  const sideCol = (node: React.ReactNode, isBody: boolean, align: "flex-start" | "flex-end") => <View style={[isBody || balanced ? { flex: 1, minWidth: 0 } : { minWidth: 48, maxWidth: "35%" }, { alignItems: align }]}>{node}</View>;
  return (
    <View role="listitem" style={{ flexDirection: "row", gap: 12 }}>
      {threeColumn || side === "before" ? sideCol(left, side === "before", "flex-end") : null}
      <View style={{ width: RAIL, alignItems: "center" }}>
        {/* İşaret ilk metin satırının ortasına hizalı. */}
        <View style={{ height: 20, justifyContent: "center", alignItems: "center" }}>
          <Marker item={item} ctx={ctx} />
        </View>
        {last ? null : <Line dashed={nextLoading} horizontal={false} color={c.border} />}
      </View>
      {threeColumn || side === "after" ? sideCol(right, side === "after", "flex-start") : null}
    </View>
  );
}

const H_ITEM = 168;

/** Yatay: üstte işaret + sağa ray, altında başlık ve içerik. */
function HorizontalItem({ item, last, nextLoading, ctx }: Omit<RowProps, "side" | "threeColumn" | "balanced" | "opposite">) {
  return (
    <View role="listitem" style={{ width: H_ITEM, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", height: 20, gap: 6 }}>
        <View style={{ width: 20, alignItems: "center" }}>
          <Marker item={item} ctx={ctx} />
        </View>
        {last ? null : <Line dashed={nextLoading} horizontal color={ctx.theme.color.canvas.border} />}
      </View>
      <View style={{ gap: 2, paddingRight: 16 }}>
        <Txt node={item.title} style={ctx.title} ctx={ctx} />
        <Txt node={item.content} style={ctx.content} ctx={ctx} />
      </View>
    </View>
  );
}

/**
 * Zaman sırasına dizilmiş olaylar (kargo takibi, hesap etkinliği, sürüm
 * geçmişi). Dikey (start / end / alternate, başlık içte ya da karşıda) ya da
 * yatay; ikonlu / dolu / boş nokta, süren adım (`pending`, `loading`). Mantık
 * web Timeline ile aynı (`timelineUtils`).
 */
export function Timeline({ items, mode = "start", orientation = "vertical", variant = "outlined", titlePlacement = "inline", reverse = false, pending, responsive = 480, accessibilityLabel, skeleton = false, style }: TimelineProps) {
  const theme = useTheme();
  const [width, setWidth] = useState<number>();
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const ctx: Ctx = {
    theme,
    variant,
    skeleton,
    title: { fontFamily: font, fontSize: 13, lineHeight: 20, color: c.muted, fontVariant: ["tabular-nums"] },
    content: { fontFamily: font, fontSize: 15, lineHeight: 20, color: c.foreground },
  };
  const all = buildItems(items, pending, reverse);
  // Dar kapsayıcıda alternate tek tarafa düşer (iki dar sütun okunmaz).
  const narrow = responsive !== false && width !== undefined && width < responsive;
  const effectiveMode = mode === "alternate" && narrow ? "start" : mode;
  const opposite = titlePlacement === "opposite";
  const threeColumn = effectiveMode === "alternate" || opposite;
  const a11y = { accessibilityRole: "list" as const, accessibilityLabel, accessibilityState: { busy: skeleton } };

  if (orientation === "horizontal") {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ alignSelf: "stretch" }, style]} {...a11y}>
        {all.map((item, i) => (
          <HorizontalItem key={item.key ?? i} item={item} last={i === all.length - 1} nextLoading={Boolean(all[i + 1]?.loading)} ctx={ctx} />
        ))}
      </ScrollView>
    );
  }
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ alignSelf: "stretch" }, style]} {...a11y}>
      {all.map((item, i) => (
        <VerticalRow key={item.key ?? i} item={item} last={i === all.length - 1} nextLoading={Boolean(all[i + 1]?.loading)} side={resolveSide(effectiveMode, i, item.placement)} threeColumn={threeColumn} balanced={effectiveMode === "alternate"} opposite={opposite} ctx={ctx} />
      ))}
    </View>
  );
}
