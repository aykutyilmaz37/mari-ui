import { describe, expect, it } from "vitest";
import { formatMarkdownTables, isMarkerBlockUpToDate, MalformedMarkerBlockError, MARKER_END, MARKER_START, upsertMarkerBlock } from "../markerBlock";

describe("upsertMarkerBlock", () => {
  it("boş dosyada: sadece bloğu yazar", () => {
    const result = upsertMarkerBlock("", "merhaba");
    expect(result).toBe(`${MARKER_START}\n\nmerhaba\n\n${MARKER_END}\n`);
  });

  it("marker taşımayan mevcut içerik: kullanıcının içeriğini KORUR, bloğu SONA ekler", () => {
    const existing = "# Benim projem\n\nBuraya kendi notlarımı yazdım.\n";
    const result = upsertMarkerBlock(existing, "mari-ui kuralları");
    expect(result).toContain("Buraya kendi notlarımı yazdım.");
    expect(result.indexOf("Buraya kendi notlarımı yazdım.")).toBeLessThan(result.indexOf(MARKER_START));
    expect(result).toContain(`${MARKER_START}\n\nmari-ui kuralları\n\n${MARKER_END}`);
  });

  it("marker taşıyan mevcut içerik: SADECE iki işaret arasını değiştirir, öncesi/sonrası dokunulmadan kalır", () => {
    const existing = `ÖNCE\n${MARKER_START}\neski içerik\n${MARKER_END}\nSONRA`;
    const result = upsertMarkerBlock(existing, "yeni içerik");
    expect(result).toBe(`ÖNCE\n${MARKER_START}\n\nyeni içerik\n\n${MARKER_END}\nSONRA`);
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

describe("Prettier biçimi", () => {
  it("tabloları Prettier gibi hizalar (emoji iki sütun, ayırıcı en az 3 tire)", () => {
    const table = "| A | Uzun başlık |\n|---|---|\n| `x` | ✅ |";
    expect(formatMarkdownTables(table)).toBe("| A   | Uzun başlık |\n| --- | ----------- |\n| `x` | ✅          |");
  });

  it("--check: eski biçim (boş satırsız, hizasız tablo) bayat sayılmaz", () => {
    const body = "Başlık\n\n| a | b |\n|---|---|\n| 1 | 2 |";
    const oldFormat = `${MARKER_START}\n${body}\n${MARKER_END}`;
    expect(isMarkerBlockUpToDate(oldFormat, body)).toBe(true);
  });

  it("--check: biçim dışı içerik farkı yine bayat", () => {
    const existing = upsertMarkerBlock("", "| a | b |\n|---|---|\n| 1 | 2 |");
    expect(isMarkerBlockUpToDate(existing, "| a | b |\n|---|---|\n| 1 | 3 |")).toBe(false);
  });
});
