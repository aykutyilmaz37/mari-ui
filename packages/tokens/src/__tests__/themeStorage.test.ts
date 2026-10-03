import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildThemeVars } from "../runtimeTheme";
import { DEFAULT_THEME_STORAGE_KEY, getThemeScript, loadTheme, saveTheme } from "../themeStorage";

let store: Map<string, string>;

/** Node ortamı: script'in dokunduğu kadar sahte `<html>`. */
function fakeDocument(prefersDark = false) {
  const attrs: Record<string, string> = {};
  const style: Record<string, string> = {};
  vi.stubGlobal("document", {
    documentElement: {
      setAttribute: (name: string, value: string) => (attrs[name] = value),
      style: { setProperty: (name: string, value: string) => (style[name] = value) },
    },
  });
  vi.stubGlobal("window", { matchMedia: () => ({ matches: prefersDark }) });
  return { attrs, style };
}

const runBootScript = (options?: Parameters<typeof getThemeScript>[0]) =>
  // eslint-disable-next-line sonarjs/code-eval -- test edilen şey tam olarak bu üretilmiş script
  new Function(getThemeScript(options))();

beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("saveTheme / loadTheme", () => {
  it("kaydedilen ayar geri okunur", () => {
    saveTheme({ mode: "dark", primary: "#16a34a", spacing: "compact" });
    expect(loadTheme()).toEqual({ mode: "dark", primary: "#16a34a", spacing: "compact" });
  });

  it("kayıt yoksa, bozuksa ya da eski biçimdeyse undefined", () => {
    expect(loadTheme()).toBeUndefined();
    store.set(DEFAULT_THEME_STORAGE_KEY, "{bozuk");
    expect(loadTheme()).toBeUndefined();
    store.set(DEFAULT_THEME_STORAGE_KEY, JSON.stringify({ mode: "dark" }));
    expect(loadTheme()).toBeUndefined();
  });

  it("depolama yoksa ya da hata verirse sessizce geçer", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    });
    expect(() => saveTheme({ mode: "dark" })).not.toThrow();
    expect(loadTheme()).toBeUndefined();
    vi.stubGlobal("localStorage", undefined);
    expect(() => saveTheme({ mode: "dark" })).not.toThrow();
    expect(loadTheme()).toBeUndefined();
  });
});

describe("getThemeScript", () => {
  it("kayıt yoksa <html>e dokunmaz", () => {
    const { attrs, style } = fakeDocument();
    runBootScript();
    expect(attrs).toEqual({});
    expect(style).toEqual({});
  });

  it("mod, yoğunluk ve ÖNCEDEN hesaplanmış vurgu değişkenlerini yazar", () => {
    const { attrs, style } = fakeDocument();
    saveTheme({ mode: "dark", primary: "#eab308", spacing: "comfortable" });
    runBootScript();
    expect(attrs).toEqual({ "data-theme": "dark", "data-density": "comfortable" });
    expect(style).toEqual(buildThemeVars({ primary: "#eab308" }, "dark"));
  });

  it("normal yoğunluk da açıkça yazılır; yoğunluk yoksa yazılmaz", () => {
    const { attrs } = fakeDocument();
    saveTheme({ mode: "light", spacing: "normal" });
    runBootScript();
    expect(attrs).toEqual({ "data-theme": "light", "data-density": "normal" });
    const second = fakeDocument();
    saveTheme({ mode: "light" });
    runBootScript();
    expect(second.attrs).toEqual({ "data-theme": "light" });
  });

  it("system modu o anki işletim sistemi tercihine çözülür", () => {
    const { attrs, style } = fakeDocument(true);
    saveTheme({ mode: "system", primary: "#16a34a" });
    runBootScript();
    expect(attrs["data-theme"]).toBe("dark");
    expect(style).toEqual(buildThemeVars({ primary: "#16a34a" }, "dark"));
  });

  it("özel anahtar; </script> ile script bloğu kapatılamaz", () => {
    const { attrs } = fakeDocument();
    saveTheme({ mode: "dark" }, "uygulamam");
    runBootScript({ storageKey: "uygulamam" });
    expect(attrs["data-theme"]).toBe("dark");
    expect(getThemeScript({ storageKey: "</script><script>alert(1)" })).not.toContain("</script>");
  });

  it("depolamaya erişim hata verirse sayfayı kırmaz", () => {
    fakeDocument();
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
    });
    expect(() => runBootScript()).not.toThrow();
  });
});
