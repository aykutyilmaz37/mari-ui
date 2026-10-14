"use client";

import React, { useLayoutEffect } from "react";
import type { Decorator } from "@storybook/react";
import { addons } from "storybook/internal/preview-api";
import { buildPlainThemeCss, personaFontsUrl, personaNames, personas, resolveThemeConfig, type PersonaName } from "@mari-ui/tokens";

/**
 * Faz 21 — araç çubuğundaki "Kişilik" seçimi. Seçilen kişiliğin temasını, CLI'ın
 * ürettiği dosyanın aynısı olarak (`:root` + `[data-theme="light|dark"]`) bir `<style>`
 * bloğuyla basar — böylece kendi `data-theme`'ini taşıyan iç çerçeveler (Yumuşak İris)
 * de kişiliğe uyar — ve fontlarını Google Fonts'tan yükler. "Varsayılan"da ikisi de kaldırılır.
 */
export const personaToolbar = {
  description: "Tasarım kişiliği",
  toolbar: {
    title: "Kişilik",
    icon: "mirror",
    items: [{ value: "default", title: "Varsayılan" }, ...personaNames.map((name) => ({ value: name, title: personas[name].label }))],
    dynamicTitle: true,
  },
};

const FONT_LINK_ID = "mari-persona-fonts";
const STYLE_ID = "mari-persona-theme";
/** `packages/components/src/foundations/usePersonaTheme.ts` ile aynı ad. */
const PERSONA_EVENT = "mari-ui:persona";
let applied: PersonaName | undefined | null = null;

const toPersona = (value: unknown) => (personaNames.includes(value as PersonaName) ? (value as PersonaName) : undefined);

function applyPersona(persona: PersonaName | undefined) {
  if (applied === persona) return;
  applied = persona;
  if (persona) document.documentElement.dataset.persona = persona;
  else delete document.documentElement.dataset.persona;
  window.dispatchEvent(new Event(PERSONA_EVENT));
  document.getElementById(FONT_LINK_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
  if (!persona) return;

  const resolved = resolveThemeConfig({ persona });
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = buildPlainThemeCss({ default: resolved.light, named: { dark: resolved.dark } }, { header: "", spacingDensity: resolved.spacingDensity });
  document.head.appendChild(style);

  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = personaFontsUrl(persona);
  document.head.appendChild(link);
}

function PersonaScope({ persona, children }: Readonly<{ persona: PersonaName | undefined; children: React.ReactNode }>) {
  useLayoutEffect(() => applyPersona(persona), [persona]);
  return <>{children}</>;
}

export const withPersona: Decorator = (Story, context) => {
  const persona = toPersona(context.globals.persona);
  return (
    <PersonaScope persona={persona}>
      <Story />
    </PersonaScope>
  );
};

/**
 * MDX doküman sayfalarında (Foundations) dekoratör çalışmaz; seçim değişikliğini
 * önizleme kanalından da dinleyip uygularız. `preview.tsx` bir kez çağırır.
 */
export function listenPersonaGlobals() {
  const channel = addons.getChannel();
  const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => applyPersona(toPersona(globals?.persona));
  channel.on("setGlobals", onGlobals);
  channel.on("globalsUpdated", onGlobals);
}
