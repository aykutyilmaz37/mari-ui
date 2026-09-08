import { describe, expect, it } from "vitest";
import { isMarkerBlockUpToDate, MalformedMarkerBlockError, MARKER_END, MARKER_START, upsertMarkerBlock } from "../markerBlock";

describe("upsertMarkerBlock", () => {
  it("boş dosyada: sadece bloğu yazar", () => {
    const result = upsertMarkerBlock("", "merhaba");
    expect(result).toBe(`${MARKER_START}\nmerhaba\n${MARKER_END}\n`);
  });

  it("marker taşımayan mevcut içerik: kullanıcının içeriğini KORUR, bloğu SONA ekler", () => {
    const existing = "# Benim projem\n\nBuraya kendi notlarımı yazdım.\n";
    const result = upsertMarkerBlock(existing, "mari-ui kuralları");
    expect(result).toContain("Buraya kendi notlarımı yazdım.");
    expect(result.indexOf("Buraya kendi notlarımı yazdım.")).toBeLessThan(result.indexOf(MARKER_START));
    expect(result).toContain(`${MARKER_START}\nmari-ui kuralları\n${MARKER_END}`);
  });

  it("marker taşıyan mevcut içerik: SADECE iki işaret arasını değiştirir, öncesi/sonrası dokunulmadan kalır", () => {
    const existing = `ÖNCE\n${MARKER_START}\neski içerik\n${MARKER_END}\nSONRA`;
    const result = upsertMarkerBlock(existing, "yeni içerik");
    expect(result).toBe(`ÖNCE\n${MARKER_START}\nyeni içerik\n${MARKER_END}\nSONRA`);
  });

  it("bozuk blok (start var, end yok): açıkça hata fırlatır (sessizce yanlış bir şey yazmaz)", () => {
    const existing = `${MARKER_START}\nbitmemiş...`;
    expect(() => upsertMarkerBlock(existing, "yeni", "AGENTS.md")).toThrow(MalformedMarkerBlockError);
  });

  it("iki kere art arda aynı body ile çağrılırsa İDEMPOTENT'tir (tekrar tekrar büyümez)", () => {
    const once = upsertMarkerBlock("mevcut içerik", "gövde");
    const twice = upsertMarkerBlock(once, "gövde");
    expect(twice).toBe(once);
  });
});

describe("isMarkerBlockUpToDate", () => {
  it("blok yoksa false döner", () => {
    expect(isMarkerBlockUpToDate("hiç marker yok", "gövde")).toBe(false);
  });

  it("blok var ama içerik farklıysa false döner", () => {
    const existing = `${MARKER_START}\neski\n${MARKER_END}`;
    expect(isMarkerBlockUpToDate(existing, "yeni")).toBe(false);
  });

  it("blok güncel içerikle birebir aynıysa true döner", () => {
    const existing = upsertMarkerBlock("", "gövde");
    expect(isMarkerBlockUpToDate(existing, "gövde")).toBe(true);
  });
});
