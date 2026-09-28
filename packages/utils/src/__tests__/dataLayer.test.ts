import { afterEach, describe, expect, it } from "vitest";
import { getDataLayer, initDataLayer, pushToDataLayer } from "../datalayer";

describe("dataLayer", () => {
  afterEach(() => {
    delete window.dataLayer;
  });

  it("initDataLayer: window.dataLayer yoksa oluşturur", () => {
    expect(window.dataLayer).toBeUndefined();
    const dl = initDataLayer();
    expect(window.dataLayer).toBe(dl);
    expect(dl).toEqual([]);
  });

  it("initDataLayer: zaten VARSA aynı diziyi (referansı) döner, ÜZERİNE YAZMAZ", () => {
    const first = initDataLayer();
    first.push({ event: "önceden_eklenmiş" });
    const second = initDataLayer();
    expect(second).toBe(first);
    expect(second).toHaveLength(1);
  });

  it("pushToDataLayer: dataLayer hiç init edilmemiş olsa bile kendisi init edip olayı ekler", () => {
    pushToDataLayer({ event: "sayfa_goruntuleme", path: "/anasayfa" });
    expect(getDataLayer()).toEqual([{ event: "sayfa_goruntuleme", path: "/anasayfa" }]);
  });

  it("pushToDataLayer: birden fazla olay sırayla birikir", () => {
    pushToDataLayer({ event: "a" });
    pushToDataLayer({ event: "b" });
    expect(getDataLayer().map((e) => e.event)).toEqual(["a", "b"]);
  });
});
