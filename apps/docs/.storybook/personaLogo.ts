import { generateRamp, personas, type PersonaName } from "@mari-ui/tokens";

const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";

/**
 * Faz 21 — Storybook kenar çubuğu logosu, seçili kişiliğin `primary` rampasıyla.
 * `public/mari-ui-logo.svg`in aynısı; yalnız iris tonları kişilik rampasından gelir.
 * Kişilik yoksa `null` (manager statik dosyayı kullanır).
 */
export function personaLogoUrl(persona: string | undefined): string | null {
  const config = personas[persona as PersonaName]?.config;
  if (!config?.color?.primary) return null;
  const ramp = generateRamp(config.color.primary);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 56" role="img"><title>Mari UI</title>
<g transform="translate(4 4)">
<rect width="48" height="48" rx="15" fill="${ramp[600]}"/>
<path d="M24 6.5c-3.1 3.2-3.2 5.5 0 8.2 3.2-2.7 3.1-5 0-8.2Z" fill="${ramp[200]}"/>
<path d="M16.6 9.3c-.3 4.5 1.2 6.5 5.6 7.1.5-4.4-1-6.4-5.6-7.1Zm14.8 0c.3 4.5-1.2 6.5-5.6 7.1-.5-4.4 1-6.4 5.6-7.1Z" fill="${ramp[50]}"/>
<path d="M10.5 36V23a4.5 4.5 0 0 1 8.1-2.7L24 27l5.4-6.7a4.5 4.5 0 0 1 8.1 2.7v13" fill="none" stroke="#fff" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<text x="66" y="38" font-family="${FONT}" font-size="30" font-weight="750" letter-spacing="-1.8" fill="#242331">mari</text>
<circle cx="128.5" cy="34" r="2.1" fill="${ramp[400]}"/>
<text x="137" y="38" font-family="${FONT}" font-size="30" font-weight="750" letter-spacing="-1.8" fill="${ramp[600]}">ui</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
