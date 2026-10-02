import { afterEach, describe, expect, it, vi } from "vitest";
import { buildThemeVars } from "@mari-ui/tokens";
import { applyTheme, resolveColorScheme } from "./applyTheme";

type Listener = () => void;

function mockMatchMedia(initialDark: boolean) {
  const listeners = new Set<Listener>();
  const query = {
    matches: initialDark,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  vi.stubGlobal("matchMedia", () => query);
  return {
    listeners,
    setDark(dark: boolean) {
      query.matches = dark;
      listeners.forEach((fn) => fn());
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("style");
});

describe("applyTheme", () => {
  it("varsayılan hedef <html>; mod ve yoğunluk özniteliklerle uygulanır", () => {
    applyTheme({ mode: "dark", spacing: "compact" });
    const html = document.documentElement;
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(html).toHaveAttribute("data-density", "compact");
    expect(html.getAttribute("style") ?? "").toBe("");
  });

  it("vurgu rengi satır içi primary değişkenleri olarak yazılır", () => {
    applyTheme({ mode: "light", primary: "#facc15" });
    const expected = buildThemeVars({ primary: "#facc15" }, "light");
    for (const [name, value] of Object.entries(expected)) {
      expect(document.documentElement.style.getPropertyValue(name)).toBe(value);
    }
  });

  it("normal yoğunluk özniteliği kaldırır", () => {
    applyTheme({ spacing: "comfortable" });
    applyTheme({ spacing: "normal" });
    expect(document.documentElement).not.toHaveAttribute("data-density");
  });

  it("system: işletim sistemi tercihini izler ve vurgu rengini yeni moda göre yeniden hesaplar", () => {
    const media = mockMatchMedia(false);
    applyTheme({ mode: "system", primary: "#22d3ee" });
    const html = document.documentElement;
    expect(html).toHaveAttribute("data-theme", "light");
    media.setDark(true);
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(html.style.getPropertyValue("--mari-color-primary-solid")).toBe(buildThemeVars({ primary: "#22d3ee" }, "dark")["--mari-color-primary-solid"]);
  });

  it("tekrar çağrı öncekinin yerini alır: eski dinleyici ve eski değişkenler kalmaz", () => {
    const media = mockMatchMedia(false);
    applyTheme({ mode: "system", primary: "#22d3ee" });
    applyTheme({ mode: "light" });
    expect(media.listeners.size).toBe(0);
    expect(document.documentElement.style.getPropertyValue("--mari-color-primary-solid")).toBe("");
  });

  it("temizlik elemanı ilk çağrıdan önceki haline döndürür", () => {
    const el = document.createElement("div");
    el.setAttribute("data-theme", "brand");
    const media = mockMatchMedia(true);
    applyTheme({ mode: "light", spacing: "compact" }, el);
    const dispose = applyTheme({ mode: "system", primary: "#facc15", spacing: "comfortable" }, el);
    expect(el).toHaveAttribute("data-theme", "dark");
    dispose();
    expect(el).toHaveAttribute("data-theme", "brand");
    expect(el).not.toHaveAttribute("data-density");
    expect(el.style).toHaveLength(0);
    expect(media.listeners.size).toBe(0);
  });

  it("eskimiş temizlik yeni uygulamaya dokunmaz", () => {
    const el = document.createElement("div");
    const stale = applyTheme({ mode: "dark" }, el);
    applyTheme({ mode: "light" }, el);
    stale();
    expect(el).toHaveAttribute("data-theme", "light");
  });
});

describe("resolveColorScheme", () => {
  it("açık seçimleri olduğu gibi, system'i medya sorgusuna göre çözer", () => {
    expect(resolveColorScheme("dark")).toBe("dark");
    mockMatchMedia(true);
    expect(resolveColorScheme("system")).toBe("dark");
  });
});
