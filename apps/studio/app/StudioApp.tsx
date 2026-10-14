"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DownloadIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@mari-ui/components/button";
import { Card } from "@mari-ui/components/card";
import { ColorPicker } from "@mari-ui/components/color-picker";
import { Field } from "@mari-ui/components/field";
import { Input } from "@mari-ui/components/input";
import { MariLogo } from "@mari-ui/components/logo";
import { Segmented } from "@mari-ui/components/segmented";
import { Select } from "@mari-ui/components/select";
import { Switch } from "@mari-ui/components/switch";
import { Table, type ColumnDef } from "@mari-ui/components/table";
import { Tag } from "@mari-ui/components/tag";
import { Text, Title } from "@mari-ui/components/typography";
import {
  defaultThemeConfig,
  contrastRatio,
  lightTheme,
  meetsAA,
  resolveThemeConfig,
  themeToCssVariables,
  type HexColor,
  type MariUiThemeConfig,
  radiusDensities,
  type RadiusDensity,
  spacingDensities,
  type SpacingDensity,
  shadowDensities,
  type ShadowDensity,
  motionLevels,
  type MotionLevel,
  personaNames,
  personas,
  personaFontsUrl,
  minimizeConfig,
  type PersonaName,
} from "@mari-ui/tokens";
import { PreviewPanel } from "./PreviewPanel";

const SPACING_LABELS: Record<SpacingDensity, string> = { compact: "Sıkı", normal: "Normal", comfortable: "Rahat" };
const FLUID_MAX_OPTIONS = [18, 20, 22, 24, 26, 28, 32];
const SHADOW_LABELS: Record<ShadowDensity, string> = { none: "Yok", soft: "Yumuşak", normal: "Normal", strong: "Belirgin" };
const MOTION_LABELS: Record<MotionLevel, string> = { off: "Kapalı", calm: "Sakin", normal: "Normal", lively: "Canlı" };
const FONT_LINK_ID = "studio-persona-fonts";
const RADIUS_LABELS: Record<RadiusDensity, string> = { none: "Keskin", sm: "Az", md: "Orta", lg: "Çok" };
const DEFAULT_PERSONA = "default";
const PERSONA_OPTIONS = [{ value: DEFAULT_PERSONA, label: "Varsayılan (Yumuşak iris)" }, ...personaNames.map((name) => ({ value: name, label: personas[name].label }))];

/** Kişiliğin (ya da varsayılanın) tüm düzenlenebilir alanları — seçince sol panel bunlarla dolar. */
function personaFields(name: PersonaName | undefined) {
  const p = name ? personas[name].config : {};
  return {
    primary: p.color?.primary ?? defaultThemeConfig.color.primary,
    accent: p.color?.accent ?? defaultThemeConfig.color.accent,
    sans: p.typography?.fontFamilySans ?? lightTheme.fontFamily.sans,
    mono: p.typography?.fontFamilyMono ?? lightTheme.fontFamily.mono,
    heading: p.typography?.fontFamilyHeading ?? lightTheme.fontFamily.heading ?? lightTheme.fontFamily.sans,
    radius: p.density?.radius ?? defaultThemeConfig.density.radius,
    spacing: p.density?.spacing ?? defaultThemeConfig.density.spacing,
    shadow: p.density?.shadow ?? defaultThemeConfig.density.shadow,
    motion: p.motion ?? defaultThemeConfig.motion,
  };
}

/** Stüdyoda düzenlenen ek tema (`config.themes`'in bir girdisi); `id` yalnız liste anahtarı. */
interface ExtraTheme {
  id: string;
  name: string;
  base: "light" | "dark";
  primary: string;
  accent: string;
}

/** Ek tema adı `[data-theme="<ad>"]` seçicisi olur: küçük harf/rakam/tire, harfle başlar, light/dark değil, tekil. */
function themeNameError(name: string, all: ExtraTheme[]): string | undefined {
  if (!name) return "Ad gerekli.";
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return "Küçük harf, rakam ve tire; harfle başlamalı (ör. marka-koyu).";
  if (name === "light" || name === "dark") return "light/dark zaten var — başka bir ad seçin.";
  if (all.filter((t) => t.name === name).length > 1) return "Bu ad başka bir temada kullanılıyor.";
  return undefined;
}

function nextThemeName(all: ExtraTheme[]): string {
  let i = all.length + 1;
  while (all.some((t) => t.name === `tema-${i}`)) i++;
  return `tema-${i}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudioApp() {
  const [persona, setPersona] = useState<PersonaName | undefined>();
  const [shadowDensity, setShadowDensity] = useState<ShadowDensity>(defaultThemeConfig.density.shadow);
  const [motion, setMotion] = useState<MotionLevel>(defaultThemeConfig.motion);
  const [primaryHex, setPrimaryHex] = useState<string>(defaultThemeConfig.color.primary);
  const [accentHex, setAccentHex] = useState<string>(defaultThemeConfig.color.accent);
  const [fontFamilySans, setFontFamilySans] = useState<string>(lightTheme.fontFamily.sans);
  const [fontFamilyMono, setFontFamilyMono] = useState<string>(lightTheme.fontFamily.mono);
  const [fontFamilyHeading, setFontFamilyHeading] = useState(lightTheme.fontFamily.heading ?? lightTheme.fontFamily.sans);
  const [radiusDensity, setRadiusDensity] = useState<RadiusDensity>("md");
  const [spacingDensity, setSpacingDensity] = useState<SpacingDensity>("normal");
  const [fluidScale, setFluidScale] = useState(defaultThemeConfig.scale.fluid);
  const [fluidMax, setFluidMax] = useState(defaultThemeConfig.scale.max);
  const [extraThemes, setExtraThemes] = useState<ExtraTheme[]>([]);
  const [previewMode, setPreviewMode] = useState<string>("light");
  const [previewSpacing, setPreviewSpacing] = useState<SpacingDensity>("normal");

  // Kişilik seçilince tüm alanlar onun değerleriyle dolar; sonra her alan elle değiştirilebilir.
  const choosePersona = (name: PersonaName | undefined) => {
    const f = personaFields(name);
    setPersona(name);
    setPrimaryHex(f.primary);
    setAccentHex(f.accent);
    setFontFamilySans(f.sans);
    setFontFamilyMono(f.mono);
    setFontFamilyHeading(f.heading);
    setRadiusDensity(f.radius);
    setSpacingDensity(f.spacing);
    setPreviewSpacing(f.spacing);
    setShadowDensity(f.shadow);
    setMotion(f.motion);
  };

  // Kişiliğin fontları önizlemede görünsün (Google Fonts).
  useEffect(() => {
    document.getElementById(FONT_LINK_ID)?.remove();
    if (!persona) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = personaFontsUrl(persona);
    document.head.appendChild(link);
  }, [persona]);

  const updateTheme = (id: string, patch: Partial<ExtraTheme>) => setExtraThemes((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTheme = (id: string) => setExtraThemes((list) => list.filter((t) => t.id !== id));
  const addTheme = () =>
    setExtraThemes((list) => [...list, { id: crypto.randomUUID(), name: nextThemeName(list), base: "dark", primary: primaryHex, accent: accentHex }]);
  // Adı geçersiz tema config'e ve önizlemeye girmez (alanında hata gösterilir).
  const validThemes = extraThemes.filter((t) => !themeNameError(t.name, extraThemes));

  const explicitConfig: MariUiThemeConfig = useMemo(
    () => ({
      persona,
      color: { primary: primaryHex as HexColor, accent: accentHex as HexColor },
      typography: { fontFamilySans, fontFamilyMono, fontFamilyHeading },
      density: { radius: radiusDensity, spacing: spacingDensity, shadow: shadowDensity },
      motion,
      scale: { fluid: fluidScale, max: fluidMax },
      ...(validThemes.length > 0 && {
        themes: Object.fromEntries(validThemes.map((t) => [t.name, { base: t.base, color: { primary: t.primary as HexColor, accent: t.accent as HexColor } }])),
      }),
    }),
    [persona, primaryHex, accentHex, fontFamilySans, fontFamilyMono, fontFamilyHeading, radiusDensity, spacingDensity, shadowDensity, motion, fluidScale, fluidMax, validThemes]
  );
  // Dışa aktarılan dosya: kişilik + yalnız ondan farklı alanlar.
  const config = useMemo(
    () => minimizeConfig(explicitConfig, { ...defaultThemeConfig, typography: { fontFamilySans: lightTheme.fontFamily.sans, fontFamilyMono: lightTheme.fontFamily.mono, fontFamilyHeading: lightTheme.fontFamily.heading } }),
    [explicitConfig]
  );

  const resolved = useMemo(() => resolveThemeConfig(config), [config]);
  // Önizlenen tema silinir/geçersizleşirse açığa dönülür.
  const previewOptions = [{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, ...validThemes.map((t) => ({ value: t.name, label: t.name }))];
  const mode = previewOptions.some((o) => o.value === previewMode) ? previewMode : "light";
  const activeTheme = resolved.themes[mode] ?? (mode === "dark" ? resolved.dark : resolved.light);
  const cssVars = useMemo(() => themeToCssVariables(activeTheme), [activeTheme]);
  const contrastRows: ContrastRowData[] = [
    contrastRow("surface", "Gövde metni", activeTheme.color.canvas.surface, activeTheme.color.canvas.foreground),
    contrastRow("muted", "Yardımcı metin", activeTheme.color.canvas.surface, activeTheme.color.canvas.muted),
    contrastRow("input", "Alan sınırı (3:1)", activeTheme.color.canvas.surface, activeTheme.color.canvas.input, 3),
    contrastRow("ring", "Odak halkası (3:1)", activeTheme.color.canvas.surface, activeTheme.color.canvas.ring, 3),
    contrastRow("primary-hover", "primary hover", activeTheme.color.primary.solidHover, activeTheme.color.primary.solidContrast),
    contrastRow("primary-solid", "primary solid", activeTheme.color.primary.solid, activeTheme.color.primary.solidContrast),
    contrastRow("primary-subtle", "primary subtle", activeTheme.color.primary.subtle, activeTheme.color.primary.subtleContrast),
    contrastRow("accent-solid", "accent solid", activeTheme.color.accent.solid, activeTheme.color.accent.solidContrast),
    contrastRow("accent-subtle", "accent subtle", activeTheme.color.accent.subtle, activeTheme.color.accent.subtleContrast),
  ];

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <header className="studio-header">
          <MariLogo size={36} label="mari-ui" />
          <Text muted className="studio-hint">Tema stüdyosu — ayarları gerçek bileşenlerle canlı önizleyin.</Text>
        </header>

        <Section title="Kişilik">
          <Field label="Tasarım kişiliği" hint={`${persona ? personas[persona].description : "Renk, font, köşe, boşluk, gölge ve hareketi birlikte seçen hazır paketler."} Seçince aşağıdaki alanlar dolar; değiştirdiğiniz alanlar kişiliği ezer.`}>
            <Select
              value={persona ?? DEFAULT_PERSONA}
              options={PERSONA_OPTIONS}
              onChange={(value) => choosePersona(value === DEFAULT_PERSONA ? undefined : (value as PersonaName))}
            />
          </Field>
        </Section>

        <Section title="Renk" hint="Her iki rengin dolgu/metin kontrastı WCAG AA'ya göre otomatik hesaplanır.">
          <Field label="Birincil (primary)">
            <ColorPicker value={primaryHex} onChange={(value) => value && setPrimaryHex(value)} showText disabledAlpha />
          </Field>
          <Field label="Vurgu (accent)">
            <ColorPicker value={accentHex} onChange={(value) => value && setAccentHex(value)} showText disabledAlpha />
          </Field>
        </Section>

        <Section title="Tipografi">
          <Field label="Gövde / arayüz font ailesi">
            <Input value={fontFamilySans} onChange={(e) => setFontFamilySans(e.target.value)} />
          </Field>
          <Field label="Başlık / marka font ailesi">
            <Input value={fontFamilyHeading} onChange={(e) => setFontFamilyHeading(e.target.value)} />
          </Field>
          <Field label="Kod / monospace font ailesi">
            <Input value={fontFamilyMono} onChange={(e) => setFontFamilyMono(e.target.value)} />
          </Field>
        </Section>

        <Section title="Yoğunluk">
          <Field label="Köşe yuvarlaklığı" hint="Tüm radius skalasını orantılı ölçekler; avatar/switch gibi yuvarlak öğeler etkilenmez.">
            <Select value={radiusDensity} options={radiusDensities.map((value) => ({ value, label: RADIUS_LABELS[value] }))} onChange={(value) => setRadiusDensity(value as RadiusDensity)} />
          </Field>
          <Field label="Varsayılan boşluk" hint="Yükseklik, iç boşluk ve aralıklar ölçeklenir; yazı boyutu değişmez. Son kullanıcı ThemeCustomizer ile kendi tercihini seçebilir.">
            <Select
              value={spacingDensity}
              options={spacingDensities.map((value) => ({ value, label: SPACING_LABELS[value] }))}
              onChange={(value) => {
                setSpacingDensity(value as SpacingDensity);
                setPreviewSpacing(value as SpacingDensity);
              }}
            />
          </Field>
        </Section>

        <Section title="Gölge ve hareket">
          <Field label="Gölge yoğunluğu" hint={'Geometri aynı, koyuluk ölçeklenir. "Yok"ta yüzeyler kenarlıkla ayrışır.'}>
            <Select value={shadowDensity} options={shadowDensities.map((value) => ({ value, label: SHADOW_LABELS[value] }))} onChange={(value) => setShadowDensity(value as ShadowDensity)} />
          </Field>
          <Field label="Hareket" hint={'Geçiş süreleri çarpılır (Sakin ×1,4 · Canlı ×0,85 + hafif taşan eğri · Kapalı anında). "Hareketi azalt" tercihi her zaman geçerli.'}>
            <Select value={motion} options={motionLevels.map((value) => ({ value, label: MOTION_LABELS[value] }))} onChange={(value) => setMotion(value as MotionLevel)} />
          </Field>
        </Section>

        <Section title="Ek temalar" hint={'Açık/koyunun yanında kendi temalarınız (ör. marka, yüksek kontrast). Her biri `data-theme="<ad>"` ile seçilir; açık ya da koyu tabanlıdır, kendi rengini taşır, font ve yoğunluğu ana temadan alır.'}>
          {extraThemes.map((t) => (
            <Card
              key={t.id}
              size="sm"
              title={t.name || "Adsız tema"}
              extra={<Button variant="ghost" color="neutral" size="sm" shape="square" icon={<Trash2Icon size={16} aria-hidden />} aria-label={`${t.name || "Adsız tema"} temasını kaldır`} onClick={() => removeTheme(t.id)} />}
            >
              <div className="studio-section-body">
                <Field label="Ad" error={themeNameError(t.name, extraThemes)}>
                  <Input value={t.name} onChange={(e) => updateTheme(t.id, { name: e.target.value.trim() })} />
                </Field>
                <Field label="Taban">
                  <Segmented aria-label={`${t.name || "Adsız tema"} tabanı`} value={t.base} options={[{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }]} onChange={(value) => updateTheme(t.id, { base: value as "light" | "dark" })} />
                </Field>
                <Field label="Birincil (primary)">
                  <ColorPicker value={t.primary} onChange={(value) => value && updateTheme(t.id, { primary: value })} showText disabledAlpha />
                </Field>
                <Field label="Vurgu (accent)">
                  <ColorPicker value={t.accent} onChange={(value) => value && updateTheme(t.id, { accent: value })} showText disabledAlpha />
                </Field>
              </div>
            </Card>
          ))}
          <Button variant="outline" color="neutral" block icon={<PlusIcon size={16} aria-hidden />} onClick={addTheme}>
            Tema ekle
          </Button>
        </Section>

        <Section title="Büyük ekran">
          <Switch label="Büyük ekranlarda büyüt" checked={fluidScale} onChange={setFluidScale} />
          <Text muted className="studio-hint">
            Kök yazı boyutu 1920px'ten itibaren ekranla büyür, 4K'de (3840px) aşağıdaki değere ulaşır; 1920px ve altı değişmez. Bu önizlemede görünmez — ekran genişliğine bağlı.
          </Text>
          <Field label="4K'de kök yazı boyutu" disabled={!fluidScale}>
            <Select
              value={fluidMax}
              disabled={!fluidScale}
              options={FLUID_MAX_OPTIONS.map((px) => ({ value: px, label: `${px}px (×${(px / 16).toFixed(2)})` }))}
              onChange={(value) => setFluidMax(Number(value))}
            />
          </Field>
        </Section>

        <Button block icon={<DownloadIcon size={16} aria-hidden />} onClick={() => downloadJson("mari-ui.config.json", config)}>
          mari-ui.config.json indir
        </Button>
      </aside>

      <main className="studio-main">
        <div className="studio-toggle-row">
          <Segmented aria-label="Önizlenen tema" value={mode} options={previewOptions} onChange={(value) => setPreviewMode(String(value))} />
          {/* Son kullanıcının ThemeCustomizer'da seçebileceği yoğunluk — config'e yazılmaz, yalnız önizleme. */}
          <Segmented
            aria-label="Yoğunluk önizlemesi (son kullanıcı)"
            value={previewSpacing}
            options={spacingDensities.map((value) => ({ value, label: SPACING_LABELS[value] }))}
            onChange={(value) => setPreviewSpacing(value as SpacingDensity)}
          />
        </div>

        <PreviewPanel mode={mode} spacing={previewSpacing} cssVars={cssVars} fontFamilySans={fontFamilySans} />

        <Section title="WCAG kontrast kontrolü" hint="Metin için en az 4,5:1; kontrol sınırları ve odak halkası için en az 3:1.">
          <Table<ContrastRowData> label="Kontrast oranları" data={contrastRows} columns={CONTRAST_COLUMNS} />
        </Section>

        <Section title="mari-ui.config.json önizleme">
          <pre className="studio-json-preview">{JSON.stringify(config, null, 2)}</pre>
        </Section>
      </main>
    </div>
  );
}

/** Kenar çubuğu / ana alan bölümü: başlık + isteğe bağlı açıklama + içerik. */
function Section({ title, hint, children }: Readonly<{ title: string; hint?: string; children: ReactNode }>) {
  return (
    <section className="studio-section">
      <Title level={6}>{title}</Title>
      {hint ? <Text muted className="studio-hint">{hint}</Text> : null}
      <div className="studio-section-body">{children}</div>
    </section>
  );
}

interface ContrastRowData {
  id: string;
  label: string;
  bg: string;
  fg: string;
  ratio: string;
  pass: boolean;
}

function contrastRow(id: string, label: string, bg: string, fg: string, threshold = 4.5): ContrastRowData {
  return { id, label, bg, fg, ratio: `${contrastRatio(bg as HexColor, fg as HexColor).toFixed(2)}:1`, pass: meetsAA(bg as HexColor, fg as HexColor, threshold) };
}

const swatch = (color: string) => (
  <span className="studio-swatch-cell">
    <span className="studio-swatch" style={{ background: color }} aria-hidden />
    {color}
  </span>
);

const CONTRAST_COLUMNS: ColumnDef<ContrastRowData>[] = [
  { header: "Çift", columnName: "label" },
  { header: "Arka plan", columnName: "bg", render: (_, row) => swatch(row.bg) },
  { header: "Metin", columnName: "fg", render: (_, row) => swatch(row.fg) },
  { header: "Oran", columnName: "ratio", align: "end" },
  { header: "Sonuç", columnName: "pass", render: (_, row) => <Tag color={row.pass ? "success" : "error"}>{row.pass ? "AA ✓" : "AA ✗"}</Tag> },
];
