"use client";

import { useMemo, useState } from "react";
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
} from "@mari-ui/tokens";
import { PreviewPanel } from "./PreviewPanel";

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SPACING_LABELS: Record<SpacingDensity, string> = { compact: "Sıkı", normal: "Normal", comfortable: "Rahat" };

function ContrastRow({ label, bg, fg, threshold = 4.5 }: { label: string; bg: HexColor; fg: HexColor; threshold?: number }) {
  const ratio = contrastRatio(bg, fg);
  const pass = meetsAA(bg, fg, threshold);
  return (
    <tr>
      <td>{label}</td>
      <td>
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: 4,
            background: bg,
            border: "1px solid rgba(0,0,0,0.15)",
            marginRight: 6,
            verticalAlign: "middle",
          }}
        />
        {bg}
      </td>
      <td>{fg}</td>
      <td>{ratio.toFixed(2)}:1</td>
      <td>
        <span className="studio-badge" data-pass={pass}>
          {pass ? "AA ✓" : "AA ✗"}
        </span>
      </td>
    </tr>
  );
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
  const [primaryHex, setPrimaryHex] = useState<string>(defaultThemeConfig.color.primary);
  const [accentHex, setAccentHex] = useState<string>(defaultThemeConfig.color.accent);
  const [fontFamilySans, setFontFamilySans] = useState<string>(lightTheme.fontFamily.sans);
  const [fontFamilyMono, setFontFamilyMono] = useState<string>(lightTheme.fontFamily.mono);
  const [fontFamilyHeading, setFontFamilyHeading] = useState(lightTheme.fontFamily.heading ?? lightTheme.fontFamily.sans);
  const [radiusDensity, setRadiusDensity] = useState<RadiusDensity>("md");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [previewSpacing, setPreviewSpacing] = useState<SpacingDensity>("normal");

  const config: MariUiThemeConfig = useMemo(
    () => ({
      color: { primary: primaryHex as HexColor, accent: accentHex as HexColor },
      typography: { fontFamilySans, fontFamilyMono, fontFamilyHeading },
      density: { radius: radiusDensity },
    }),
    [primaryHex, accentHex, fontFamilySans, fontFamilyMono, fontFamilyHeading, radiusDensity]
  );

  const resolved = useMemo(() => resolveThemeConfig(config), [config]);
  const activeTheme = previewMode === "light" ? resolved.light : resolved.dark;
  const cssVars = useMemo(() => themeToCssVariables(activeTheme), [activeTheme]);

  const handleHexChange = (raw: string, setter: (v: string) => void) => {
    if (HEX_PATTERN.test(raw)) setter(raw);
  };

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <h1 className="studio-title">mari-ui Tema Stüdyosu</h1>
        <p className="studio-subtitle">Renk, tipografi ve yoğunluk ayarlarını gerçek bileşenlerle canlı önizleyin.</p>

        <div className="studio-section">
          <h2 className="studio-section-title">Renk</h2>
          <p className="studio-section-hint">Her iki rengin solid/subtle metin kontrastı otomatik WCAG AA'ya göre yeniden hesaplanır.</p>

          <div className="studio-field">
            <label htmlFor="primary-color">Birincil (primary)</label>
            <div className="studio-color-row">
              <input id="primary-color" type="color" value={primaryHex} onChange={(e) => setPrimaryHex(e.target.value)} />
              <input
                className="studio-input"
                type="text"
                value={primaryHex}
                onChange={(e) => handleHexChange(e.target.value, setPrimaryHex)}
                spellCheck={false}
              />
            </div>
          </div>

          <div className="studio-field">
            <label htmlFor="accent-color">Vurgu (accent)</label>
            <div className="studio-color-row">
              <input id="accent-color" type="color" value={accentHex} onChange={(e) => setAccentHex(e.target.value)} />
              <input
                className="studio-input"
                type="text"
                value={accentHex}
                onChange={(e) => handleHexChange(e.target.value, setAccentHex)}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div className="studio-section">
          <h2 className="studio-section-title">Tipografi</h2>
          <div className="studio-field">
            <label htmlFor="font-sans">Gövde/UI font ailesi</label>
            <input id="font-sans" className="studio-input" type="text" value={fontFamilySans} onChange={(e) => setFontFamilySans(e.target.value)} />
          </div>
          <div className="studio-field">
            <label htmlFor="font-heading">Başlık / marka font ailesi</label>
            <input id="font-heading" className="studio-input" type="text" value={fontFamilyHeading} onChange={(e) => setFontFamilyHeading(e.target.value)} />
          </div>
          <div className="studio-field">
            <label htmlFor="font-mono">Kod/monospace font ailesi</label>
            <input id="font-mono" className="studio-input" type="text" value={fontFamilyMono} onChange={(e) => setFontFamilyMono(e.target.value)} />

          </div>
        </div>

        <div className="studio-section">
          <h2 className="studio-section-title">Yoğunluk</h2>
          <div className="studio-field">
            <label htmlFor="radius-density">Köşe yuvarlaklığı (radius)</label>
            <select id="radius-density" className="studio-select" value={radiusDensity} onChange={(e) => setRadiusDensity(e.target.value as RadiusDensity)}>
              {radiusDensities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="studio-field-hint">
              Tüm radius skalasını orantılı ölçekler: `none` tamamen keskin, `md` varsayılan. Avatar/switch gibi geometrik olarak yuvarlak öğeler etkilenmez.
            </p>
          </div>
        </div>

        <button className="studio-download-btn" onClick={() => downloadJson("mari-ui.config.json", config)}>
          mari-ui.config.json indir
        </button>
      </aside>

      <main className="studio-main">
        <div className="studio-toggle-row">
          <div className="studio-mode-toggle" role="group" aria-label="Önizleme modu">
            <button data-active={previewMode === "light"} onClick={() => setPreviewMode("light")}>
              Açık
            </button>
            <button data-active={previewMode === "dark"} onClick={() => setPreviewMode("dark")}>
              Koyu
            </button>
          </div>
          {/* Son kullanıcının ThemeCustomizer'da seçebileceği yoğunluk — config'e yazılmaz, yalnız önizleme. */}
          <div className="studio-mode-toggle" role="group" aria-label="Yoğunluk önizlemesi (son kullanıcı)">
            {spacingDensities.map((option) => (
              <button key={option} data-active={previewSpacing === option} onClick={() => setPreviewSpacing(option)}>
                {SPACING_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <PreviewPanel mode={previewMode} spacing={previewSpacing} cssVars={cssVars} fontFamilySans={fontFamilySans} />

        <div className="studio-section" style={{ marginTop: "2rem" }}>
          <h2 className="studio-section-title">WCAG Kontrast Kontrolü</h2>
          <p className="studio-section-hint">
            Metin için en az 4,5:1; kontrol sınırları ve odak halkası için en az 3:1 kontrast kontrol edilir.
          </p>
          <table className="studio-contrast-table">
            <thead>
              <tr>
                <th>Çift</th>
                <th>Arka plan</th>
                <th>Metin</th>
                <th>Oran</th>
                <th>Sonuç</th>
              </tr>
            </thead>
            <tbody>
              <ContrastRow label="Gövde metni" bg={activeTheme.color.canvas.surface as HexColor} fg={activeTheme.color.canvas.foreground as HexColor} />
              <ContrastRow label="Yardımcı metin" bg={activeTheme.color.canvas.surface as HexColor} fg={activeTheme.color.canvas.muted as HexColor} />
              <ContrastRow label="Alan sınırı (3:1)" bg={activeTheme.color.canvas.surface as HexColor} fg={activeTheme.color.canvas.input as HexColor} threshold={3} />
              <ContrastRow label="Odak halkası (3:1)" bg={activeTheme.color.canvas.surface as HexColor} fg={activeTheme.color.canvas.ring as HexColor} threshold={3} />
              <ContrastRow label="primary hover" bg={activeTheme.color.primary.solidHover} fg={activeTheme.color.primary.solidContrast} />
              <ContrastRow label="primary solid" bg={activeTheme.color.primary.solid} fg={activeTheme.color.primary.solidContrast} />
              <ContrastRow label="primary subtle" bg={activeTheme.color.primary.subtle} fg={activeTheme.color.primary.subtleContrast} />
              <ContrastRow label="accent solid" bg={activeTheme.color.accent.solid} fg={activeTheme.color.accent.solidContrast} />
              <ContrastRow label="accent subtle" bg={activeTheme.color.accent.subtle} fg={activeTheme.color.accent.subtleContrast} />
            </tbody>
          </table>
        </div>

        <div className="studio-section">
          <h2 className="studio-section-title">mari-ui.config.json önizleme</h2>
          <pre className="studio-json-preview">{JSON.stringify(config, null, 2)}</pre>
        </div>
      </main>
    </div>
  );
}
