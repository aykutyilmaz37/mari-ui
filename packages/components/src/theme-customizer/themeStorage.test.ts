import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getThemeScript, saveTheme } from "@mari-ui/tokens";
import { applyTheme } from "./applyTheme";

/** Açılış script'i ile `applyTheme`in birlikte çalışması (script'in kendisi tokens'ta test ediliyor). */
const html = document.documentElement;

const runBootScript = () =>
  // eslint-disable-next-line sonarjs/code-eval -- test edilen şey tam olarak bu üretilmiş script
  new Function(getThemeScript())();

const snapshot = () => ({
  theme: html.getAttribute("data-theme"),
  density: html.getAttribute("data-density"),
  style: html.getAttribute("style"),
});

function resetHtml() {
  html.removeAttribute("data-theme");
  html.removeAttribute("data-density");
  html.removeAttribute("style");
}

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetHtml();
});

describe("getThemeScript + applyTheme", () => {
  it("script, hydration sonrası applyTheme'in yazacağının aynısını yazar (görünür değişim yok)", () => {
    const settings = { mode: "dark", primary: "#eab308", spacing: "comfortable" } as const;
    saveTheme(settings);
    runBootScript();
    const fromScript = snapshot();

    resetHtml();
    applyTheme(settings);
    expect(fromScript).toEqual(snapshot());
  });

  it("script'in yazdığı vurgu rengi, renksiz applyTheme ile temizlenir", () => {
    saveTheme({ mode: "light", primary: "#dc2626" });
    runBootScript();
    expect(html.style.getPropertyValue("--mari-color-primary")).not.toBe("");
    applyTheme({ mode: "light" });
    expect(html.style.getPropertyValue("--mari-color-primary")).toBe("");
  });
});
