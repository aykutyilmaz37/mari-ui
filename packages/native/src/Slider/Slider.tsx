import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Text, View, type AccessibilityActionEvent, type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeSliderSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { Input } from "../Input";
import { fillSpan, nearestThumb, snap, stepValue, thumbBounds, toArray, toRatio, valueFromOffset, type SliderValue } from "./utils";

export type { SliderValue };
export type SliderIconItem = { icon: React.ReactNode; value: number };
export type SliderIconPosition = "top" | "bottom";

export interface SliderProps extends SkeletonableProps {
  value?: SliderValue;
  /** Kontrolsüz başlangıç. Aralık için `[20, 80]`. Varsayılan: `0`. */
  defaultValue?: SliderValue;
  /** Tutamaç sm 20 · md 28 (iOS) · lg 32. Varsayılan: `md`. */
  size?: Size;
  min?: number;
  max?: number;
  /** Adım; ondalıklı olabilir (`0.5`). Varsayılan: `1`. */
  step?: number;
  vertical?: boolean;
  disabled?: boolean;
  /** Dolu kısım ve tutamaç kenarı. Varsayılan: `primary`. */
  color?: ColorRole;
  /** `false`: değer baloncuğunu hiç gösterme. */
  tooltipVisible?: boolean;
  /** Baloncuk sürüklemeyi beklemeden hep görünsün. */
  tooltipAlwaysVisible?: boolean;
  /** Baloncuktaki ve ekran okuyucudaki değer, ör. `(v) => \`${v} ₺\``. */
  formatValue?: (value: number) => React.ReactNode;
  /** Rayın altında (dikeyde yanında) etiketli işaretler: `{ 0: "0 ₺", 5000: "5.000 ₺" }`. */
  marks?: Record<number, React.ReactNode>;
  iconList?: SliderIconItem[];
  /** Yatayda ikonların yeri. Varsayılan: `bottom`. Dikeyde ikonlar solda. */
  iconPosition?: SliderIconPosition;
  /** Senkron sayı girişi (aralıkta iki giriş, altta). */
  showInput?: boolean;
  /** Sürüklerken her değişimde. */
  onChange?: (value: SliderValue) => void;
  /** Etkileşim bitince (parmak kalktı, giriş onaylandı) — ör. filtrede yalnız bırakınca istek atmak için. */
  onChangeEnd?: (value: SliderValue) => void;
  /** Ekran okuyucu adı. Aralıkta tutamaçlar "… en az" / "… en çok". */
  accessibilityLabel?: string;
  /** Aralık tutamaçlarının adları. */
  thumbLabels?: [string, string];
  style?: StyleProp<ViewStyle>;
}

const MIN_TOUCH = 44;
const MARK_LINE = 18;
const HIDDEN_A11Y = { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };

function formatText(format: SliderProps["formatValue"], value: number): string {
  const out = format?.(value);
  if (typeof out === "string" || typeof out === "number") return String(out);
  return value.toLocaleString("tr-TR");
}

function resolveThumbLabels(thumbLabels: [string, string] | undefined, label: string | undefined): [string | undefined, string | undefined] {
  if (thumbLabels) return thumbLabels;
  return label ? [`${label} en az`, `${label} en çok`] : [label, label];
}

interface MarkerItem {
  key: string;
  value: number;
  node: React.ReactNode;
  /** Dolu kısmın dışında kalan ikon soluk. */
  dim?: boolean;
}

type Box = { width: number; height: number };

/** Ölçülmeden görünmez (yanlış yerde bir kare çizilmesin); dolu kısım dışındaki ikon soluk. */
function markerOpacity(measured: Box | undefined, dim: boolean | undefined): number {
  if (!measured) return 0;
  return dim ? 0.4 : 1;
}

/**
 * Ray boyunca konumlanan işaret/ikon dizisi. Her öğe ölçülür ve merkezi
 * tutamaç merkeziyle hizalanır; uçtakiler kenardan taşmaz (içeri kayar).
 */
function Markers({ items, length, thumb, min, max, vertical, textStyle }: Readonly<{ items: MarkerItem[]; length: number; thumb: number; min: number; max: number; vertical: boolean; textStyle: TextStyle }>) {
  const [sizes, setSizes] = useState<Record<string, Box>>({});
  const usable = Math.max(0, length - thumb);
  const along = (s: Box) => (vertical ? s.height : s.width);
  const across = (s: Box) => (vertical ? s.width : s.height);
  const crossSize = Math.max(MARK_LINE, ...Object.values(sizes).map(across));
  return (
    <View style={vertical ? { width: crossSize, height: length } : { height: crossSize, alignSelf: "stretch" }}>
      {items.map((item) => {
        const measured = sizes[item.key];
        const ratio = toRatio(item.value, min, max);
        const center = thumb / 2 + (vertical ? 1 - ratio : ratio) * usable;
        const extent = measured ? along(measured) : 0;
        const start = Math.min(Math.max(0, center - extent / 2), Math.max(0, length - extent));
        return (
          <View
            key={item.key}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setSizes((prev) => (prev[item.key]?.width === width && prev[item.key]?.height === height ? prev : { ...prev, [item.key]: { width, height } }));
            }}
            style={[{ position: "absolute", opacity: markerOpacity(measured, item.dim) }, vertical ? { top: start, left: 0 } : { left: start, top: 0 }]}
          >
            {typeof item.node === "string" || typeof item.node === "number" ? <Text numberOfLines={1} style={textStyle}>{item.node}</Text> : item.node}
          </View>
        );
      })}
    </View>
  );
}

/** Sayı girişi: yazarken serbest, onaylanınca (Enter/odak kaybı) adıma oturur. */
function SliderInput({ value, bounds, step, min, max, disabled, skeleton, accessibilityLabel, onCommit }: Readonly<{ value: number; bounds: [number, number]; step: number; min: number; max: number; disabled: boolean; skeleton: boolean; accessibilityLabel?: string; onCommit: (v: number) => void }>) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (!Number.isFinite(parsed)) return setText(String(value));
    const next = snap(Math.min(bounds[1], Math.max(bounds[0], parsed)), min, max, step);
    setText(String(next));
    onCommit(next);
  };
  return <Input type="number" size="sm" value={text} onChangeText={setText} onPressEnter={commit} onBlur={commit} returnKeyType="done" disabled={disabled} skeleton={skeleton} accessibilityLabel={accessibilityLabel} style={{ width: 80 }} />;
}

interface DragState {
  values: number[];
  length: number;
  interactive: boolean;
  vertical: boolean;
  thumb: number;
  min: number;
  max: number;
  move: (vals: number[], index: number, raw: number) => number[] | null;
  emit: (vals: number[]) => void;
  end: (vals: number[]) => void;
}

/**
 * Sürükleme: responder bir kez yaratılır, güncel değerleri ref'ten okur.
 * Dokunulan yere en yakın tutamaç gelir; olaylar yeniden çizimden hızlı
 * gelebileceği için sürüklenen değerler `drag`de tutulur.
 */
function useSliderDrag(state: DragState) {
  const [active, setActive] = useState<number | null>(null);
  const live = useRef(state);
  live.current = state;
  const drag = useRef({ origin: 0, index: 0, values: [] as number[] });

  const responder = useMemo(() => {
    const rawAt = (page: number) => {
      const s = live.current;
      return valueFromOffset(page - drag.current.origin, s.length, s.thumb, s.min, s.max, s.vertical);
    };
    const apply = (page: number) => {
      const next = live.current.move(drag.current.values, drag.current.index, rawAt(page));
      if (!next) return;
      drag.current.values = next;
      live.current.emit(next);
    };
    const pageOf = (e: GestureResponderEvent) => (live.current.vertical ? e.nativeEvent.pageY : e.nativeEvent.pageX);
    const end = () => {
      setActive(null);
      live.current.end(drag.current.values);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => live.current.interactive,
      onMoveShouldSetPanResponder: () => live.current.interactive,
      // Kaydırılan ScrollView sürüklemeyi çalmasın.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const s = live.current;
        // Görsel katman pointerEvents="none" → hedef her zaman kapsayıcı; location ona göre.
        const location = s.vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX;
        drag.current = { origin: pageOf(e) - location, index: 0, values: s.values };
        drag.current.index = nearestThumb(s.values, rawAt(pageOf(e)));
        setActive(drag.current.index);
        apply(pageOf(e));
      },
      onPanResponderMove: (e) => apply(pageOf(e)),
      onPanResponderRelease: end,
      onPanResponderTerminate: end,
    });
  }, []);
  return { responder, active };
}

interface ThumbProps {
  value: number;
  bounds: [number, number];
  text: string;
  label?: string;
  vertical: boolean;
  disabled: boolean;
  active: boolean;
  m: NativeSliderSize;
  tint: string;
  theme: Theme;
  position: ViewStyle;
  onStep: (direction: 1 | -1) => void;
}

/** Tek tutamaç: ekran okuyucuda `adjustable` (yukarı/aşağı kaydırma bir adım). */
function Thumb({ value, bounds, text, label, vertical, disabled, active, m, tint, theme, position, onStep }: Readonly<ThumbProps>) {
  const [lo, hi] = bounds;
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityValue={{ min: lo, max: hi, now: value, text }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e: AccessibilityActionEvent) => onStep(e.nativeEvent.actionName === "increment" ? 1 : -1)}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-valuenow={value}
      aria-valuetext={text}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      aria-disabled={disabled || undefined}
      style={[
        {
          position: "absolute",
          width: m.thumb,
          height: m.thumb,
          borderRadius: m.thumb / 2,
          backgroundColor: theme.color.canvas.surface,
          borderWidth: 2,
          borderColor: tint,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          transform: [{ scale: active ? 1.08 : 1 }],
        },
        position,
      ]}
    />
  );
}

const BUBBLE_SPAN = 160;

/**
 * Değer baloncuğu — tutamacın İÇİNDE değil, rayın üst katmanında kardeş öğe:
 * yuvarlatılmış tutamacın içinde Android taşan çocuğu kırpabiliyordu
 * (cihazda kesik görünüyordu). Geniş, sabit genişlikli bir kutuda ortalanır;
 * metin tek satıra zorlanmaz (`numberOfLines` iOS'ta tabular rakamı dar
 * ölçüp "…" ile kesebiliyor) — kutu geniş olduğu için zaten sarmaz.
 */
function Bubble({ visible, text, offset, vertical, cross, m, theme }: Readonly<{ visible: boolean; text: string; offset: number; vertical: boolean; cross: number; m: NativeSliderSize; theme: Theme }>) {
  if (!visible) return null;
  const box: ViewStyle = vertical
    ? { position: "absolute", left: (cross + m.thumb) / 2 + 8, top: offset, height: m.thumb, width: BUBBLE_SPAN, justifyContent: "center", alignItems: "flex-start" }
    : { position: "absolute", left: offset + m.thumb / 2 - BUBBLE_SPAN / 2, width: BUBBLE_SPAN, bottom: cross - (cross - m.thumb) / 2 + 6, alignItems: "center" };
  return (
    <View pointerEvents="none" accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={box}>
      <View style={{ backgroundColor: theme.color.neutral.solid, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 40, alignItems: "center" }}>
        <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 13, lineHeight: 18, fontWeight: "600", color: theme.color.neutral.solidContrast, fontVariant: ["tabular-nums"] }}>{text}</Text>
      </View>
    </View>
  );
}

export function Slider({
  value,
  defaultValue = 0,
  size = "md",
  min = 0,
  max = 100,
  step = 1,
  vertical = false,
  disabled = false,
  color = "primary",
  tooltipVisible,
  tooltipAlwaysVisible = false,
  formatValue,
  marks,
  iconList = [],
  iconPosition = "bottom",
  showInput = false,
  onChange,
  onChangeEnd,
  accessibilityLabel,
  thumbLabels,
  skeleton = false,
  style,
}: Readonly<SliderProps>) {
  const theme = useTheme();
  const m = useNativeConfig().slider[size];
  const [current, setCurrent] = useControllable<SliderValue>(value, defaultValue);
  const values = toArray(current).map((v) => snap(v, min, max, step));
  const isRange = values.length === 2;
  const [length, setLength] = useState(vertical ? m.verticalLength : 0);
  const cross = Math.max(m.thumb, MIN_TOUCH);
  const interactive = !disabled && !skeleton;
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const labels = resolveThumbLabels(thumbLabels, accessibilityLabel);
  const labelOf = (i: number) => (isRange ? labels[i] : accessibilityLabel);

  const toOut = (vals: number[]): SliderValue => (isRange ? [vals[0] ?? min, vals[1] ?? max] : vals[0] ?? min);
  const emit = (vals: number[]) => {
    const out = toOut(vals);
    setCurrent(out);
    onChange?.(out);
  };
  /** Tutamacı ham değere taşır (kendi aralığında, adıma oturmuş); değişmediyse `null`. */
  const move = (vals: number[], index: number, raw: number): number[] | null => {
    const [lo, hi] = thumbBounds(vals, index, min, max);
    const next = snap(Math.min(hi, Math.max(lo, raw)), min, max, step);
    if (next === vals[index]) return null;
    const copy = [...vals];
    copy[index] = next;
    return copy;
  };
  /** Tek seferlik değişim (ekran okuyucu adımı, sayı girişi): değişim + bitiş. */
  const commitThumb = (index: number, raw: number) => {
    const next = move(values, index, raw);
    if (!next) return;
    emit(next);
    onChangeEnd?.(toOut(next));
  };

  const { responder, active } = useSliderDrag({ values, length, interactive, vertical, thumb: m.thumb, min, max, move, emit, end: (vals) => onChangeEnd?.(toOut(vals)) });

  const usable = Math.max(0, length - m.thumb);
  /** Tutamacın baş kenarı (yatayda soldan, dikeyde üstten). */
  const offsetOf = (v: number) => (vertical ? 1 - toRatio(v, min, max) : toRatio(v, min, max)) * usable;
  const tint = theme.color[color].solid;
  const onLayout = (e: { nativeEvent: { layout: Box } }) => setLength(vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width);

  const markItems: MarkerItem[] = Object.entries(marks ?? {}).map(([k, node]) => ({ key: `m${k}`, value: Number(k), node }));
  const [lowest, highest] = isRange ? [values[0] ?? min, values[1] ?? max] : [min, values[0] ?? min];
  const iconItems: MarkerItem[] = iconList.map((item, i) => ({ key: `i${i}`, value: item.value, node: item.icon, dim: item.value < lowest || item.value > highest }));
  const markText: TextStyle = { fontFamily: font, fontSize: 13, lineHeight: MARK_LINE, color: c.muted, fontVariant: ["tabular-nums"] };
  // İskelette işaretler görünmez ama yer kaplar (yüklenince kayma yok).
  const markers = (items: MarkerItem[]) =>
    items.length > 0 ? (
      <View style={skeleton ? { opacity: 0 } : null}>
        <Markers items={items} length={length} thumb={m.thumb} min={min} max={max} vertical={vertical} textStyle={markText} />
      </View>
    ) : null;

  const axisBox: ViewStyle = vertical ? { width: cross, height: m.verticalLength } : { height: cross, alignSelf: "stretch" };
  const trackStyle: ViewStyle = vertical
    ? { position: "absolute", top: 0, bottom: 0, left: (cross - m.track) / 2, width: m.track, borderRadius: m.track / 2 }
    : { position: "absolute", left: 0, right: 0, top: (cross - m.track) / 2, height: m.track, borderRadius: m.track / 2 };
  const thumbPos = (v: number): ViewStyle => (vertical ? { left: (cross - m.thumb) / 2, top: offsetOf(v) } : { top: (cross - m.thumb) / 2, left: offsetOf(v) });

  let axis: React.ReactNode;
  if (skeleton) {
    axis = (
      <View style={axisBox} onLayout={onLayout}>
        <SkeletonBox style={trackStyle} />
        <SkeletonBox style={[{ position: "absolute", width: m.thumb, height: m.thumb, borderRadius: m.thumb / 2 }, thumbPos(min + (max - min) * 0.4)]} />
      </View>
    );
  } else {
    const [fillStart, fillEnd] = fillSpan(values.map(offsetOf), m.thumb, length, vertical);
    const fillStyle: ViewStyle = vertical
      ? { ...trackStyle, top: fillStart, bottom: undefined, height: Math.max(0, fillEnd - fillStart), backgroundColor: tint }
      : { ...trackStyle, left: fillStart, right: undefined, width: Math.max(0, fillEnd - fillStart), backgroundColor: tint };
    axis = (
      <View {...responder.panHandlers} onLayout={onLayout} style={[axisBox, { opacity: disabled ? 0.5 : 1 }]}>
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <View style={[trackStyle, { backgroundColor: c.border }]} />
          <View style={fillStyle} />
          {length > 0
            ? values.map((v, i) => {
                const bounds = thumbBounds(values, i, min, max);
                return (
                  <Thumb
                    key={i}
                    value={v}
                    bounds={bounds}
                    text={formatText(formatValue, v)}
                    label={labelOf(i)}
                    vertical={vertical}
                    disabled={disabled}
                    active={active === i}
                    m={m}
                    tint={tint}
                    theme={theme}
                    position={thumbPos(v)}
                    onStep={(dir) => interactive && commitThumb(i, stepValue(v, dir, step, bounds[0], bounds[1]))}
                  />
                );
              })
            : null}
          {/* Baloncuklar tutamaçlardan sonra → üstte çizilir. */}
          {values.map((v, i) => (
            <Bubble key={`b${i}`} visible={length > 0 && tooltipVisible !== false && (tooltipAlwaysVisible || active === i)} text={formatText(formatValue, v)} offset={offsetOf(v)} vertical={vertical} cross={cross} m={m} theme={theme} />
          ))}
        </View>
      </View>
    );
  }

  const inputs = showInput
    ? values.map((v, i) => (
        <SliderInput key={i} value={v} bounds={thumbBounds(values, i, min, max)} step={step} min={min} max={max} disabled={disabled} skeleton={skeleton} accessibilityLabel={labelOf(i)} onCommit={(raw) => commitThumb(i, raw)} />
      ))
    : null;
  return (
    <SliderFrame vertical={vertical} skeleton={skeleton} style={style} axis={axis} inputs={inputs} icons={markers(iconItems)} marks={markers(markItems)} iconPosition={iconPosition} isRange={isRange} dash={<Text style={{ color: c.muted, fontFamily: font }}>–</Text>} />
  );
}

interface FrameProps {
  vertical: boolean;
  skeleton: boolean;
  style?: StyleProp<ViewStyle>;
  axis: React.ReactNode;
  inputs: React.ReactNode[] | null;
  icons: React.ReactNode;
  marks: React.ReactNode;
  iconPosition: SliderIconPosition;
  isRange: boolean;
  dash: React.ReactNode;
}

/** Ray, işaretler, ikonlar ve sayı girişlerinin yerleşimi. Dikeyde: ikonlar solda, işaretler sağda, giriş altta. */
function SliderFrame({ vertical, skeleton, style, axis, inputs, icons, marks, iconPosition, isRange, dash }: Readonly<FrameProps>) {
  const hidden = skeleton ? HIDDEN_A11Y : null;
  if (vertical) {
    return (
      <View style={[{ flexDirection: "row", gap: 8, alignSelf: "flex-start" }, style]} {...hidden}>
        {icons}
        <View style={{ gap: 8, alignItems: "center" }}>
          {axis}
          {inputs}
        </View>
        {marks}
      </View>
    );
  }
  const body = (
    <View style={{ flex: 1, gap: 4 }}>
      {iconPosition === "top" ? icons : null}
      {axis}
      {marks}
      {iconPosition === "bottom" ? icons : null}
    </View>
  );
  // Tekte giriş yanda; aralıkta iki giriş altta "–" ile.
  if (inputs && !isRange) {
    return (
      <View style={[{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 12 }, style]} {...hidden}>
        {body}
        {inputs}
      </View>
    );
  }
  return (
    <View style={[{ alignSelf: "stretch", gap: 8 }, style]} {...hidden}>
      {body}
      {inputs ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {inputs[0]}
          {dash}
          {inputs[1]}
        </View>
      ) : null}
    </View>
  );
}
