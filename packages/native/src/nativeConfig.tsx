import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ExtendedSize, Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";

export interface NativeControlSize {
  readonly height: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly paddingHorizontal: number;
  readonly gap: number;
  readonly iconSize: number;
  readonly radius: keyof Theme["radius"];
}

export interface NativeCardSize {
  readonly padding: number;
  readonly headerMinHeight: number;
  readonly headerPaddingVertical: number;
  readonly footerPaddingVertical: number;
  readonly actionPaddingVertical: number;
  readonly radius: keyof Theme["radius"];
}

export interface NativeListSize {
  readonly rowMinHeight: number;
  readonly rowPaddingVertical: number;
  readonly rowPaddingHorizontal: number;
  readonly contentGap: number;
  readonly metaGap: number;
  readonly actionGap: number;
  readonly titleFontSize: number;
  readonly titleLineHeight: number;
  readonly descriptionFontSize: number;
  readonly descriptionLineHeight: number;
}

/** Tipografi satırı (pt). Başlık seviyeleri `h1`–`h6`, gövde `body`. */
export interface NativeTextSize {
  readonly fontSize: number;
  readonly lineHeight: number;
}

export type NativeTextStyle = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body";

export interface NativeAvatarSize {
  readonly size: number;
  readonly fontSize: number;
  /** `shape="square"` köşesi (tema radius anahtarı). */
  readonly radius: keyof Theme["radius"];
  /** AvatarGroup içinde üst üste binme payı. */
  readonly overlap: number;
}

export interface NativeBadgeSize {
  readonly height: number;
  readonly fontSize: number;
  readonly paddingHorizontal: number;
  readonly dot: number;
}

export interface NativeSelectionSize {
  /** Checkbox/Radio kutusu (pt). */
  readonly box: number;
  readonly radius: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly descriptionFontSize: number;
  readonly descriptionLineHeight: number;
  readonly gap: number;
}

export interface NativeSwitchSize {
  readonly width: number;
  /** `switchTrueLabel`/`switchFalseLabel` varken iz genişliği. */
  readonly labelWidth: number;
  readonly height: number;
  readonly knob: number;
  readonly fontSize: number;
}

export interface NativeTagSize {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly paddingHorizontal: number;
  readonly paddingVertical: number;
  readonly gap: number;
  readonly iconSize: number;
  readonly radius: keyof Theme["radius"];
}

/** Native ölçüleri web ölçeğinden bağımsızdır; değerler dp/pt cinsindendir. */
export interface NativeConfig {
  readonly sizes: Readonly<Record<ExtendedSize, NativeControlSize>>;
  readonly card: Readonly<Record<Size, NativeCardSize>>;
  readonly list: Readonly<Record<Size, NativeListSize>>;
  readonly typography: Readonly<Record<NativeTextStyle, NativeTextSize>>;
  readonly avatar: Readonly<Record<Size, NativeAvatarSize>>;
  readonly badge: Readonly<Record<"sm" | "md", NativeBadgeSize>>;
  readonly tag: NativeTagSize;
  readonly selection: Readonly<Record<Size, NativeSelectionSize>>;
  readonly switch: Readonly<Record<Size, NativeSwitchSize>>;
}

/** Bileşenleri değiştirmeden uygulama düzeyinde geçersiz kılınabilen varsayılanlar. */
export const defaultNativeConfig: NativeConfig = {
  sizes: {
    xs: { height: 32, fontSize: 13, lineHeight: 18, paddingHorizontal: 12, gap: 6, iconSize: 14, radius: "md" },
    sm: { height: 36, fontSize: 14, lineHeight: 20, paddingHorizontal: 14, gap: 6, iconSize: 16, radius: "md" },
    md: { height: 44, fontSize: 16, lineHeight: 22, paddingHorizontal: 16, gap: 8, iconSize: 18, radius: "lg" },
    lg: { height: 50, fontSize: 17, lineHeight: 22, paddingHorizontal: 20, gap: 8, iconSize: 20, radius: "lg" },
    xl: { height: 56, fontSize: 18, lineHeight: 24, paddingHorizontal: 24, gap: 10, iconSize: 22, radius: "xl" },
  },
  card: {
    sm: { padding: 12, headerMinHeight: 44, headerPaddingVertical: 8, footerPaddingVertical: 10, actionPaddingVertical: 6, radius: "lg" },
    md: { padding: 16, headerMinHeight: 48, headerPaddingVertical: 12, footerPaddingVertical: 12, actionPaddingVertical: 8, radius: "xl" },
    lg: { padding: 20, headerMinHeight: 56, headerPaddingVertical: 16, footerPaddingVertical: 16, actionPaddingVertical: 10, radius: "xl" },
  },
  list: {
    sm: { rowMinHeight: 48, rowPaddingVertical: 8, rowPaddingHorizontal: 12, contentGap: 12, metaGap: 12, actionGap: 8, titleFontSize: 14, titleLineHeight: 20, descriptionFontSize: 13, descriptionLineHeight: 18 },
    md: { rowMinHeight: 48, rowPaddingVertical: 12, rowPaddingHorizontal: 16, contentGap: 16, metaGap: 12, actionGap: 8, titleFontSize: 16, titleLineHeight: 22, descriptionFontSize: 14, descriptionLineHeight: 20 },
    lg: { rowMinHeight: 48, rowPaddingVertical: 16, rowPaddingHorizontal: 20, contentGap: 20, metaGap: 16, actionGap: 12, titleFontSize: 17, titleLineHeight: 24, descriptionFontSize: 16, descriptionLineHeight: 22 },
  },
  // Apple HIG metin stilleri (Large Title, Title 1–3, Headline, Subheadline; gövde Body 17/22).
  typography: {
    h1: { fontSize: 34, lineHeight: 41 },
    h2: { fontSize: 28, lineHeight: 34 },
    h3: { fontSize: 22, lineHeight: 28 },
    h4: { fontSize: 20, lineHeight: 25 },
    h5: { fontSize: 17, lineHeight: 22 },
    h6: { fontSize: 15, lineHeight: 20 },
    body: { fontSize: 17, lineHeight: 22 },
  },
  // Avatar: 40 = iOS liste satırı / M3 avatar; 32 kompakt, 56 profil başlığı.
  avatar: {
    sm: { size: 32, fontSize: 13, radius: "md", overlap: 6 },
    md: { size: 40, fontSize: 16, radius: "lg", overlap: 8 },
    lg: { size: 56, fontSize: 22, radius: "xl", overlap: 12 },
  },
  // Badge: iOS bildirim rozeti ~20pt, 12 yarı kalın.
  badge: {
    sm: { height: 16, fontSize: 11, paddingHorizontal: 4, dot: 6 },
    md: { height: 20, fontSize: 12, paddingHorizontal: 6, dot: 8 },
  },
  // Tag: HIG Footnote 13/18 → 24pt yükseklik (statik etiket; kapatma düğmesi hitSlop ile 44).
  tag: { fontSize: 13, lineHeight: 18, paddingHorizontal: 8, paddingVertical: 3, gap: 4, iconSize: 14, radius: "sm" },
  // Checkbox/Radio: M3 kutusu 18dp (2dp kenar); satır en az 44pt dokunma alanı. Etiket md = Body 17/22.
  selection: {
    sm: { box: 18, radius: 4, fontSize: 15, lineHeight: 20, descriptionFontSize: 13, descriptionLineHeight: 18, gap: 10 },
    md: { box: 22, radius: 5, fontSize: 17, lineHeight: 22, descriptionFontSize: 15, descriptionLineHeight: 20, gap: 12 },
    lg: { box: 26, radius: 6, fontSize: 19, lineHeight: 24, descriptionFontSize: 15, descriptionLineHeight: 20, gap: 14 },
  },
  // Switch: md = iOS UISwitch 51×31 (topuz 27); M3 52×32.
  switch: {
    sm: { width: 40, labelWidth: 64, height: 24, knob: 20, fontSize: 10 },
    md: { width: 51, labelWidth: 80, height: 31, knob: 27, fontSize: 12 },
    lg: { width: 60, labelWidth: 96, height: 36, knob: 32, fontSize: 13 },
  },
};

export interface NativeConfigOverrides {
  /** Örn. `{ md: { height: 48, fontSize: 17 } }`. */
  sizes?: Partial<Record<ExtendedSize, Partial<NativeControlSize>>>;
  card?: Partial<Record<Size, Partial<NativeCardSize>>>;
  list?: Partial<Record<Size, Partial<NativeListSize>>>;
  typography?: Partial<Record<NativeTextStyle, Partial<NativeTextSize>>>;
  avatar?: Partial<Record<Size, Partial<NativeAvatarSize>>>;
  badge?: Partial<Record<"sm" | "md", Partial<NativeBadgeSize>>>;
  tag?: Partial<NativeTagSize>;
  selection?: Partial<Record<Size, Partial<NativeSelectionSize>>>;
  switch?: Partial<Record<Size, Partial<NativeSwitchSize>>>;
}

function mergeScale<K extends string, T extends object>(defaults: Readonly<Record<K, T>>, overrides?: Partial<Record<K, Partial<T>>>): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const key of Object.keys(defaults) as K[]) result[key] = { ...defaults[key], ...overrides?.[key] };
  return result;
}

export function mergeNativeConfig(base: NativeConfig, overrides?: NativeConfigOverrides): NativeConfig {
  if (!overrides) return base;
  return {
    sizes: mergeScale(base.sizes, overrides.sizes),
    card: mergeScale(base.card, overrides.card),
    list: mergeScale(base.list, overrides.list),
    typography: mergeScale(base.typography, overrides.typography),
    avatar: mergeScale(base.avatar, overrides.avatar),
    badge: mergeScale(base.badge, overrides.badge),
    tag: { ...base.tag, ...overrides.tag },
    selection: mergeScale(base.selection, overrides.selection),
    switch: mergeScale(base.switch, overrides.switch),
  };
}

const NativeConfigContext = createContext<NativeConfig>(defaultNativeConfig);

/** Native ölçü ve tipografisini bağımsız olarak özelleştirir; iç içe kullanıldığında üst ayarları korur. */
export function NativeConfigProvider({ config, children }: { config?: NativeConfigOverrides; children: ReactNode }) {
  const parent = useContext(NativeConfigContext);
  const value = useMemo(() => mergeNativeConfig(parent, config), [parent, config]);
  return <NativeConfigContext.Provider value={value}>{children}</NativeConfigContext.Provider>;
}

export function useNativeConfig(): NativeConfig {
  return useContext(NativeConfigContext);
}
