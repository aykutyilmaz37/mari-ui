import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadScriptOnce, __resetScriptLoaderCache } from "../scriptLoader";

describe("loadScriptOnce", () => {
  beforeEach(() => {
    __resetScriptLoaderCache();
    document.head.innerHTML = "";
  });

  it("doğru src ile bir <script> etiketi ekler", () => {
    void loadScriptOnce("https://example.com/a.js");
    const script = document.querySelector<HTMLScriptElement>('script[src="https://example.com/a.js"]');
    expect(script).not.toBeNull();
    expect(script?.async).toBe(true); // varsayılan
  });

  it("'load' event'inde promise çözülür", async () => {
    const promise = loadScriptOnce("https://example.com/b.js");
    const script = document.querySelector('script[src="https://example.com/b.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBeUndefined();
  });

  it("'error' event'inde promise reddedilir", async () => {
    const promise = loadScriptOnce("https://example.com/c.js");
    const script = document.querySelector('script[src="https://example.com/c.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("error"));
    await expect(promise).rejects.toThrow("https://example.com/c.js");
  });

  it("AYNI src için art arda çağrılırsa script'i İKİNCİ KEZ eklemez, aynı promise'i döner", () => {
    const first = loadScriptOnce("https://example.com/d.js");
    const second = loadScriptOnce("https://example.com/d.js");
    expect(first).toBe(second);
    expect(document.querySelectorAll('script[src="https://example.com/d.js"]')).toHaveLength(1);
  });

  it("id verilirse ve o id'de zaten bir element varsa (tüketici elle eklemişse) tekrar eklemez", () => {
    const existing = document.createElement("script");
    existing.id = "already-there";
    document.head.appendChild(existing);

    void loadScriptOnce("https://example.com/e.js", { id: "already-there" });
    expect(document.querySelectorAll('script[src="https://example.com/e.js"]')).toHaveLength(0);
  });

  describe("document olmayan ortam (SSR/Node/React Native)", () => {
    let originalDocument: Document;
    beforeEach(() => {
      originalDocument = globalThis.document;
      // @ts-expect-error — kasıtlı olarak "document yok" senaryosunu simüle ediyoruz.
      delete globalThis.document;
    });
    afterEach(() => {
      globalThis.document = originalDocument;
    });

    it("açıkça reddeder, sessizce asılı kalmaz", async () => {
      await expect(loadScriptOnce("https://example.com/f.js")).rejects.toThrow('"document" yok');
    });
  });
});
