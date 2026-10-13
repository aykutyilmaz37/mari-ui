import React, { useLayoutEffect } from "react";
import type { Decorator } from "@storybook/react";
import { personaFontsUrl, personaNames, personas, resolveThemeConfig, spacingDensityBase, themeToCssVariables, type PersonaName } from "@mari-ui/tokens";

/**
 * Faz 21 — araç çubuğundaki "Kişilik" seçimi. Seçilen kişiliğin çözülmüş temasını
 * `<html>`e inline CSS değişkeni olarak yazar (portal'a giden Modal/Drawer da
 * etkilensin diye story kabına değil köke) ve fontlarını Google Fonts'tan yükler.
 * "Varsayılan" seçilince tüm inline değişkenler kaldırılır, paket teması geri gelir.
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
let appliedVars: string[] = [];

function applyPersona(persona: PersonaName | undefined, mode: "light" | "dark") {
  const root = document.documentElement;
  for (const name of appliedVars) root.style.removeProperty(name);
  appliedVars = [];
  document.getElementById(FONT_LINK_ID)?.remove();
  if (!persona) return;

  const resolved = resolveThemeConfig({ persona });
  const vars = { ...themeToCssVariables(resolved[mode]), "--spacing": spacingDensityBase[resolved.spacingDensity] };
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  appliedVars = Object.keys(vars);

  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = personaFontsUrl(persona);
  document.head.appendChild(link);
}

function PersonaScope({ persona, mode, children }: { persona: PersonaName | undefined; mode: "light" | "dark"; children: React.ReactNode }) {
  useLayoutEffect(() => applyPersona(persona, mode), [persona, mode]);
  return <>{children}</>;
}

export const withPersona: Decorator = (Story, context) => {
  const value = context.globals.persona as string | undefined;
  const persona = personaNames.includes(value as PersonaName) ? (value as PersonaName) : undefined;
  const mode = context.globals.theme === "dark" ? "dark" : "light";
  return (
    <PersonaScope persona={persona} mode={mode}>
      <Story />
    </PersonaScope>
  );
};
