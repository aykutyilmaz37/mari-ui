"use client";

import { useEffect, useMemo, useState } from "react";
import { personaNames, personas, resolveThemeConfig, type PersonaName } from "@mari-ui/tokens";

/**
 * YALNIZ DOKÜMAN İÇİN. Storybook araç çubuğundaki Kişilik seçimi
 * `<html data-persona>`e yazılır ve bu olay yayınlanır (`apps/docs/.storybook/withPersona.tsx`).
 * MDX sayfalarında dekoratör çalışmadığı için Foundations sayfaları seçimi buradan okur.
 */
export const PERSONA_EVENT = "mari-ui:persona";

function readPersona(): PersonaName | undefined {
  if (typeof document === "undefined") return undefined;
  const value = document.documentElement.dataset.persona;
  return personaNames.includes(value as PersonaName) ? (value as PersonaName) : undefined;
}

export function usePersonaTheme() {
  const [persona, setPersona] = useState(readPersona);
  useEffect(() => {
    const sync = () => setPersona(readPersona());
    window.addEventListener(PERSONA_EVENT, sync);
    sync();
    return () => window.removeEventListener(PERSONA_EVENT, sync);
  }, []);
  const resolved = useMemo(() => resolveThemeConfig(persona ? { persona } : {}), [persona]);
  return { persona, label: persona ? personas[persona].label : "Yumuşak iris", ...resolved };
}
