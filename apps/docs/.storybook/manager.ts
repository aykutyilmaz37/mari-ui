"use client";

import { addons } from "@storybook/manager-api";
import "@mari-ui/tokens/fonts.css";
import { createMariTheme } from "./theme";
import { personaLogoUrl } from "./personaLogo";

// Kabuk açık iris; kanvas ve doküman teması araç çubuğundan değiştirilebilir.
addons.setConfig({
  theme: createMariTheme("light"),
  sidebar: { showRoots: true },
});

/**
 * Faz 21 — kenar çubuğu logosu araç çubuğundaki Kişilik seçimini izler. Tema
 * nesnesi yeniden kurulmaz (Storybook manager temasını çalışma zamanında
 * değiştirmez); yalnız logo görselinin adresi değişir.
 */
const STATIC_LOGO = "/mari-ui-logo.svg";
let persona: string | undefined;

function paintLogo() {
  const url = personaLogoUrl(persona) ?? STATIC_LOGO;
  document.querySelectorAll<HTMLImageElement>(`img[src="${STATIC_LOGO}"], img[data-mari-logo]`).forEach((img) => {
    img.dataset.mariLogo = "";
    if (img.getAttribute("src") !== url) img.src = url;
  });
}

addons.register("mari-ui/persona-logo", () => {
  const channel = addons.getChannel();
  const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
    persona = globals?.persona as string | undefined;
    paintLogo();
  };
  channel.on("globalsUpdated", onGlobals);
  channel.on("setGlobals", onGlobals);
  // Kenar çubuğu yeniden çizilince (ör. daraltıp açma) logo statik dosyaya döner.
  new MutationObserver(paintLogo).observe(document.body, { childList: true, subtree: true });
});
