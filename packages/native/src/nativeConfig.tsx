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

export interface NativeSegmentedSize {
  readonly height: number;
  readonly fontSize: number;
  readonly paddingHorizontal: number;
  readonly radius: number;
}

export interface NativeSliderSize {
  /** Ray kalınlığı. */
  readonly track: number;
  /** Tutamaç çapı. */
  readonly thumb: number;
  /** Dikey slider'ın yüksekliği. */
  readonly verticalLength: number;
}

export interface NativeStatisticSize {
  readonly valueFontSize: number;
  readonly valueLineHeight: number;
  /** Başlık, trend ve açıklama satırı. */
  readonly labelFontSize: number;
  readonly labelLineHeight: number;
}

export interface NativeStepsSize {
  /** Gösterge dairesi. */
  readonly indicator: number;
  readonly iconSize: number;
  /** Dairedeki numara. */
  readonly numberFontSize: number;
  readonly titleFontSize: number;
  readonly titleLineHeight: number;
  readonly descriptionFontSize: number;
  readonly descriptionLineHeight: number;
}

export interface NativeAccordionSize {
  readonly paddingVertical: number;
  readonly paddingHorizontal: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly iconSize: number;
}

export interface NativeTabsSize {
  readonly height: number;
  readonly fontSize: number;
  readonly paddingHorizontal: number;
  readonly iconSize: number;
}

export interface NativeSelectSize {
  /** Paneldeki seçenek satırı. */
  readonly optionMinHeight: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly descriptionFontSize: number;
  readonly descriptionLineHeight: number;
  /** Grup başlığı (büyük harf, soluk). */
  readonly groupFontSize: number;
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

export interface NativeAppBarSize {
  /** Üst sıra (geri / başlık / eylemler) yüksekliği. */
  readonly height: number;
  readonly titleFontSize: number;
  readonly titleLineHeight: number;
  readonly subtitleFontSize: number;
  readonly subtitleLineHeight: number;
  /** `size="large"`: üst sıranın altındaki büyük başlık. */
  readonly largeTitleFontSize: number;
  readonly largeTitleLineHeight: number;
  /** Büyük başlık alanının yüksekliği (kaydırınca 0'a iner). */
  readonly largeAreaHeight: number;
  /** Eylem / geri düğmesinin dokunma kutusu. */
  readonly actionSize: number;
  readonly iconSize: number;
}

export interface NativeBottomNavigationSize {
  /** Çubuğun yüksekliği (güvenli alan payı hariç). */
  readonly height: number;
  readonly iconSize: number;
  readonly labelFontSize: number;
  readonly labelLineHeight: number;
  /** `pill`: aktif ikonun arkasındaki hap zemin. */
  readonly indicatorWidth: number;
  readonly indicatorHeight: number;
}

export interface NativeSidebarSize {
  /** Panel genişliği: ekranın bu oranı, en fazla `maxWidth`. */
  readonly widthRatio: number;
  readonly maxWidth: number;
  readonly rowMinHeight: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly iconSize: number;
  readonly headingFontSize: number;
  readonly paddingHorizontal: number;
}

export interface NativeTreeSize {
  /** Satır en az yüksekliği (dokunma hedefi). */
  readonly rowMinHeight: number;
  /** Her seviyenin girintisi. */
  readonly indent: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly iconSize: number;
  /** Aç/kapa okunun dokunma kutusu. */
  readonly toggleSize: number;
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
  readonly segmented: Readonly<Record<Size, NativeSegmentedSize>>;
  readonly slider: Readonly<Record<Size, NativeSliderSize>>;
  readonly statistic: Readonly<Record<Size, NativeStatisticSize>>;
  readonly steps: Readonly<Record<"sm" | "md", NativeStepsSize>>;
  readonly accordion: Readonly<Record<Size, NativeAccordionSize>>;
  readonly tabs: Readonly<Record<Size, NativeTabsSize>>;
  readonly select: NativeSelectSize;
  readonly appBar: NativeAppBarSize;
  readonly bottomNavigation: Readonly<Record<"pill" | "plain", NativeBottomNavigationSize>>;
  readonly sidebar: NativeSidebarSize;
  readonly tree: NativeTreeSize;
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
  // Segmented: md = iOS UISegmentedControl 32pt, 13 orta kalın; dokunma alanı hitSlop ile 44.
  segmented: {
    sm: { height: 28, fontSize: 13, paddingHorizontal: 10, radius: 7 },
    md: { height: 32, fontSize: 13, paddingHorizontal: 12, radius: 8 },
    lg: { height: 40, fontSize: 15, paddingHorizontal: 16, radius: 10 },
  },
  // Slider: md tutamaç 28 = iOS UISlider; ray 4. Dokunma alanı her boyutta en az 44.
  slider: {
    sm: { track: 4, thumb: 20, verticalLength: 160 },
    md: { track: 4, thumb: 28, verticalLength: 200 },
    lg: { track: 6, thumb: 32, verticalLength: 240 },
  },
  // Statistic: değer HIG Title 2 / Title 1 / Large Title; etiket Footnote / Subheadline.
  statistic: {
    sm: { valueFontSize: 22, valueLineHeight: 28, labelFontSize: 13, labelLineHeight: 18 },
    md: { valueFontSize: 28, valueLineHeight: 34, labelFontSize: 15, labelLineHeight: 20 },
    lg: { valueFontSize: 34, valueLineHeight: 41, labelFontSize: 15, labelLineHeight: 20 },
  },
  // Steps: gösterge web ile aynı 24/32; başlık Subheadline / Body, açıklama Footnote / Subheadline.
  steps: {
    sm: { indicator: 24, iconSize: 12, numberFontSize: 12, titleFontSize: 15, titleLineHeight: 20, descriptionFontSize: 13, descriptionLineHeight: 18 },
    md: { indicator: 32, iconSize: 16, numberFontSize: 14, titleFontSize: 17, titleLineHeight: 22, descriptionFontSize: 15, descriptionLineHeight: 20 },
  },
  // Accordion: başlık satırı her boyutta en az 44pt; md = iOS liste satırı (Body 17/22).
  accordion: {
    sm: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, lineHeight: 20, iconSize: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 17, lineHeight: 22, iconSize: 18 },
    lg: { paddingVertical: 16, paddingHorizontal: 20, fontSize: 17, lineHeight: 22, iconSize: 20 },
  },
  // Tabs: sekme yüksekliği md 44 (dokunma hedefi); pills iç yüzeyi Segmented gibi.
  tabs: {
    sm: { height: 36, fontSize: 14, paddingHorizontal: 12, iconSize: 14 },
    md: { height: 44, fontSize: 15, paddingHorizontal: 16, iconSize: 16 },
    lg: { height: 48, fontSize: 17, paddingHorizontal: 20, iconSize: 18 },
  },
  // Select: alan Input ölçeğini (`sizes`) kullanır; panel satırı iOS liste satırı.
  select: { optionMinHeight: 48, fontSize: 17, lineHeight: 22, descriptionFontSize: 15, descriptionLineHeight: 20, groupFontSize: 13 },
  // AppBar: başlık iOS Headline (17/22), büyük başlık iOS Large Title (34/41); eylem kutusu 44 (dokunma hedefi).
  appBar: { height: 56, titleFontSize: 17, titleLineHeight: 22, subtitleFontSize: 13, subtitleLineHeight: 18, largeTitleFontSize: 34, largeTitleLineHeight: 41, largeAreaHeight: 52, actionSize: 44, iconSize: 24 },
  // BottomNavigation: pill = Material 3 (80, gösterge 64×32), plain = iOS sekme çubuğu (56).
  bottomNavigation: {
    pill: { height: 80, iconSize: 24, labelFontSize: 12, labelLineHeight: 16, indicatorWidth: 64, indicatorHeight: 32 },
    plain: { height: 56, iconSize: 24, labelFontSize: 11, labelLineHeight: 13, indicatorWidth: 0, indicatorHeight: 0 },
  },
  // Sidebar (drawer): telefonda tam genişlik (kullanıcı kararı), tablette en fazla 480; satır iOS liste satırı.
  sidebar: { widthRatio: 1, maxWidth: 480, rowMinHeight: 48, fontSize: 17, lineHeight: 22, iconSize: 20, headingFontSize: 13, paddingHorizontal: 16 },
  // Tree: satır 44 (dokunma hedefi), metin iOS Callout (16/21), girinti 20.
  tree: { rowMinHeight: 44, indent: 20, fontSize: 16, lineHeight: 21, iconSize: 18, toggleSize: 32 },
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
  segmented?: Partial<Record<Size, Partial<NativeSegmentedSize>>>;
  slider?: Partial<Record<Size, Partial<NativeSliderSize>>>;
  statistic?: Partial<Record<Size, Partial<NativeStatisticSize>>>;
  steps?: Partial<Record<"sm" | "md", Partial<NativeStepsSize>>>;
  accordion?: Partial<Record<Size, Partial<NativeAccordionSize>>>;
  tabs?: Partial<Record<Size, Partial<NativeTabsSize>>>;
  select?: Partial<NativeSelectSize>;
  appBar?: Partial<NativeAppBarSize>;
  bottomNavigation?: Partial<Record<"pill" | "plain", Partial<NativeBottomNavigationSize>>>;
  sidebar?: Partial<NativeSidebarSize>;
  tree?: Partial<NativeTreeSize>;
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
    segmented: mergeScale(base.segmented, overrides.segmented),
    slider: mergeScale(base.slider, overrides.slider),
    statistic: mergeScale(base.statistic, overrides.statistic),
    steps: mergeScale(base.steps, overrides.steps),
    accordion: mergeScale(base.accordion, overrides.accordion),
    tabs: mergeScale(base.tabs, overrides.tabs),
    select: { ...base.select, ...overrides.select },
    appBar: { ...base.appBar, ...overrides.appBar },
    bottomNavigation: mergeScale(base.bottomNavigation, overrides.bottomNavigation),
    sidebar: { ...base.sidebar, ...overrides.sidebar },
    tree: { ...base.tree, ...overrides.tree },
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
