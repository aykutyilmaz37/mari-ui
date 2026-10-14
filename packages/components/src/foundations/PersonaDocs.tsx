"use client";

import { contrastRatio, type HexColor } from "@mari-ui/tokens";
import { usePersonaTheme } from "./usePersonaTheme";

/**
 * YALNIZ DOKÜMAN İÇİN — Foundations MDX sayfalarının seçili kişiliğe
 * göre değişen parçaları. Değerler `@mari-ui/tokens`ın çözdüğü temadan okunur;
 * sayfadaki örnek çizimler zaten CSS değişkenlerinden boyanır.
 */

const ROLES = ["primary", "accent", "neutral", "success", "error", "warning", "info"] as const;
const CANVAS = ["surface", "surfaceAlt", "foreground", "muted", "border", "input", "ring"] as const;

const firstFamily = (stack: string) => stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? stack;
const ratio = (a: string, b: string) => contrastRatio(a as HexColor, b as HexColor).toFixed(2);

/** Sayfa başlığının altındaki "şu an gösterilen" satırı. */
export function PersonaNote() {
  const { label, persona } = usePersonaTheme();
  return (
    <p style={{ fontSize: 13, color: "var(--mari-color-muted)" }}>
      Gösterilen kişilik: <strong style={{ color: "var(--mari-color-foreground)" }}>{label}</strong>
      {persona ? "" : " (varsayılan)"} — araç çubuğundaki <em>Kişilik</em> menüsünden değiştirin.
    </p>
  );
}

export function SemanticPalette() {
  const { light, dark } = usePersonaTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {ROLES.map((role) => (
        <div key={role} style={{ border: "1px solid var(--mari-color-border)", borderRadius: "var(--mari-radius-md)", overflow: "hidden" }}>
          <div style={{ padding: 12, background: `var(--mari-color-${role}-solid)`, color: `var(--mari-color-${role}-solid-contrast)` }}>{role}</div>
          <div style={{ padding: 12, fontSize: 12 }}>
            Açık: {light.color[role].solid}
            <br />
            Koyu: {dark.color[role].solid}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CanvasTable() {
  const { light, dark } = usePersonaTheme();
  return (
    <table>
      <thead>
        <tr><th>Token</th><th>Açık</th><th>Koyu</th></tr>
      </thead>
      <tbody>
        {CANVAS.map((token) => (
          <tr key={token}><td>{token}</td><td><code>{light.color.canvas[token]}</code></td><td><code>{dark.color.canvas[token]}</code></td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function ContrastTable() {
  const { light, dark } = usePersonaTheme();
  return (
    <table>
      <thead>
        <tr><th>Tema</th><th>Gövde metni</th><th>Düğme metni</th><th>Alan sınırı</th></tr>
      </thead>
      <tbody>
        {[light, dark].map((theme) => (
          <tr key={theme.name}>
            <td>{theme.mode === "light" ? "Açık" : "Koyu"}</td>
            <td>{ratio(theme.color.canvas.foreground, theme.color.canvas.surface)}:1</td>
            <td>{ratio(theme.color.primary.solidContrast, theme.color.primary.solid)}:1</td>
            <td>{ratio(theme.color.canvas.input, theme.color.canvas.surface)}:1</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Kişiliğin üç font ailesi, kendi fontlarıyla örnek satır. */
export function FontFamilies() {
  const { light } = usePersonaTheme();
  const { sans, heading = sans, mono } = light.fontFamily;
  const rows = [
    ["Başlık", heading, "--mari-font-heading", "Yeni bir başlangıç: ğüşıöç İĞÜŞÖÇ"],
    ["Arayüz ve gövde", sans, "--mari-font-sans", "Fikrini web ve mobilde aynı özenle hayata geçir."],
    ["Kod", mono, "--mari-font-mono", "const ışık = görünür(ğ);"],
  ] as const;
  return (
    <div style={{ display: "grid", gap: 12, margin: "16px 0" }}>
      {rows.map(([role, stack, cssVar, sample]) => (
        <div key={role} style={{ border: "1px solid var(--mari-color-border)", borderRadius: "var(--mari-radius-md)", padding: 12 }}>
          <div style={{ fontSize: 12, color: "var(--mari-color-muted)" }}>
            {role} — <strong>{firstFamily(stack)}</strong> · <code>{cssVar}</code>
          </div>
          <div style={{ fontFamily: `var(${cssVar})`, fontSize: role === "Başlık" ? 24 : 16, marginTop: 4 }}>{sample}</div>
        </div>
      ))}
    </div>
  );
}

const RADIUS_USE: Record<string, string> = {
  none: "—",
  sm: "Küçük kontroller (xs/sm buton, tag)",
  md: "**Çoğu component'in varsayılanı**",
  lg: "Kart, modal",
  xl: "Büyük yüzeyler",
  full: "Pill, avatar, switch",
};

const DENSITY_LABEL = { compact: "Sıkı", normal: "Normal", comfortable: "Rahat" } as const;

export function RadiusTable() {
  const { light, radiusDensity } = usePersonaTheme();
  return (
    <>
      <p style={{ fontSize: 13 }}>Kişiliğin radius yoğunluğu: <code>{radiusDensity}</code></p>
      <table>
        <thead>
          <tr><th>Anahtar</th><th>Değer</th><th>Örnek</th><th>Kullanım</th></tr>
        </thead>
        <tbody>
          {Object.entries(light.radius).map(([key, value]) => (
            <tr key={key}>
              <td><code>{key}</code></td>
              <td><code>{value}</code></td>
              <td><div style={{ width: 40, height: 24, border: "1px solid var(--mari-color-input)", background: "var(--mari-color-primary-subtle)", borderRadius: `var(--mari-radius-${key})` }} /></td>
              <td>{RADIUS_USE[key]?.replace(/\*\*/g, "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** Kişiliğin boşluk yoğunluğu (`--spacing` tabanı). */
export function SpacingDensityNote() {
  const { spacingDensity } = usePersonaTheme();
  return (
    <p style={{ fontSize: 13 }}>
      Kişiliğin boşluk yoğunluğu: <strong>{DENSITY_LABEL[spacingDensity]}</strong> (<code>{spacingDensity}</code>). Aşağıdaki çubuklar ve tüm component'ler bu tabana göre
      ölçeklenir; px karşılıkları Normal yoğunluk içindir.
    </p>
  );
}
