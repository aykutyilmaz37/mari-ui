import { describe, expect, it } from "vitest";
import { initialSizes, limitsOf, moveHandle, parseStored, setPanelSize, toFraction } from "./utils";

/** Oran dizileri kayan nokta — yaklaşık karşılaştırma. */
const approx = (values: number[]) => values.map((v) => expect.closeTo(v, 5));

describe("Splitter utils", () => {
  it("toFraction: px kullanılabilir alana, yüzde doğrudan", () => {
    expect(toFraction(200, 1000)).toBeCloseTo(0.2);
    expect(toFraction("30%", 1000)).toBeCloseTo(0.3);
    expect(toFraction(undefined, 1000)).toBeUndefined();
  });

  it("initialSizes: verilenler alınır, verilmeyenler kalanı eşit paylaşır; toplam 1", () => {
    expect(initialSizes([200, undefined, undefined], 1000)).toEqual(approx([0.2, 0.4, 0.4]));
    expect(initialSizes([undefined, undefined], 500)).toEqual(approx([0.5, 0.5]));
    // Fazla verilmiş: orantılı küçülür.
    expect(initialSizes(["80%", "40%"], 1000)).toEqual(approx([2 / 3, 1 / 3]));
  });

  it("moveHandle: yalnız iki komşu değişir, toplam korunur, min/max sınırında durur", () => {
    const lim = [limitsOf(100, 600, 1000), limitsOf("20%", undefined, 1000), limitsOf(0, undefined, 1000)];
    const sizes = [0.3, 0.4, 0.3];
    expect(moveHandle(sizes, 0, 0.1, lim)).toEqual(approx([0.4, 0.3, 0.3]));
    // a en fazla 0.6 (max), ama b en az 0.2 → a en fazla 0.5.
    expect(moveHandle(sizes, 0, 1, lim)).toEqual(approx([0.5, 0.2, 0.3]));
    // a en az 0.1 (min 100px).
    expect(moveHandle(sizes, 0, -1, lim)).toEqual(approx([0.1, 0.6, 0.3]));
  });

  it("setPanelSize: daraltma alanı komşuya verir, açma geri alır", () => {
    const collapsed = setPanelSize([0.2, 0.5, 0.3], 0, 1, 0);
    expect(collapsed).toEqual(approx([0, 0.7, 0.3]));
    expect(setPanelSize(collapsed, 0, 1, 0.2)).toEqual(approx([0.2, 0.5, 0.3]));
  });

  it("parseStored: panel sayısı uymayan / bozuk kayıt yok sayılır", () => {
    expect(parseStored("[1,1]", 2)).toEqual(approx([0.5, 0.5]));
    expect(parseStored("[1,1]", 3)).toBeNull();
    expect(parseStored("bozuk", 2)).toBeNull();
    expect(parseStored(null, 2)).toBeNull();
  });
});
