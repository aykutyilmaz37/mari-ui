import { describe, expect, it } from "vitest";
import { clamp, formatForEditing, formatNumber, isAllowedInput, parseNumber, roundTo, stepValue } from "./utils";

const tr = { locale: "tr-TR", grouping: true };
/**
 * Ondalıklı sonuçlar metin olarak karşılaştırılır — hem sonarjs'in kayan
 * nokta eşitliği kuralına uyar hem de daha katıdır: "0.3" beklenirken
 * 0.30000000000000004 gibi bir artık metinde hemen görünür.
 */
const str = (n: number | null | undefined) => String(n);

describe("InputNumber utils", () => {
  it("formatNumber: tr-TR binlik nokta + ondalık virgül, precision sabit basamak", () => {
    expect(formatNumber(1234567.5, tr)).toBe("1.234.567,5");
    expect(formatNumber(1234.5, { ...tr, precision: 2 })).toBe("1.234,50");
    expect(formatNumber(1234.5, { ...tr, grouping: false })).toBe("1234,5");
    expect(formatNumber(null, tr)).toBe("");
  });

  it("formatForEditing: ayraçsız, yerelin ondalığı", () => {
    expect(formatForEditing(1234.56, tr)).toBe("1234,56");
  });

  it("parseNumber: virgül ondalık, nokta binlik", () => {
    expect(str(parseNumber("1.234,56", "tr-TR"))).toBe("1234.56");
    expect(str(parseNumber("1234,5", "tr-TR"))).toBe("1234.5");
    expect(str(parseNumber("-12,5", "tr-TR"))).toBe("-12.5");
  });

  it("parseNumber: virgül yokken nokta yalnız geçerli gruplamaysa binlik, değilse ondalık", () => {
    expect(parseNumber("1.234", "tr-TR")).toBe(1234);
    expect(parseNumber("1.234.567", "tr-TR")).toBe(1234567);
    expect(str(parseNumber("12.5", "tr-TR"))).toBe("12.5");
    expect(str(parseNumber("3.14", "tr-TR"))).toBe("3.14");
  });

  it("parseNumber: boş → null, anlamsız → undefined", () => {
    expect(parseNumber("", "tr-TR")).toBeNull();
    expect(parseNumber("-", "tr-TR")).toBeNull();
    expect(parseNumber("1,2,3", "tr-TR")).toBeUndefined();
    expect(parseNumber("abc", "tr-TR")).toBeUndefined();
  });

  it("parseNumber: en-US'te nokta ondalık, virgül binlik", () => {
    expect(str(parseNumber("1,234.5", "en-US"))).toBe("1234.5");
  });

  it("isAllowedInput: harf girmez, ayraçlar ve işaret girer", () => {
    expect(isAllowedInput("-1.234,5", "tr-TR")).toBe(true);
    expect(isAllowedInput("12a", "tr-TR")).toBe(false);
    expect(isAllowedInput("1e5", "tr-TR")).toBe(false);
  });

  it("roundTo / clamp: kayan nokta artığı yok", () => {
    expect(str(roundTo(0.1 + 0.2, undefined))).toBe("0.3");
    expect(str(roundTo(1.005, 2))).toBe("1.01");
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("stepValue: 0.1 adımda artık yok, sınırda durur, boşken min'den başlar", () => {
    expect(str(stepValue(0.2, 1, 0.1, undefined, undefined, undefined))).toBe("0.3");
    expect(stepValue(9.5, 1, 1, 0, 10, undefined)).toBe(10);
    expect(stepValue(null, 1, 1, 5, 10, undefined)).toBe(5);
    expect(stepValue(null, -1, 1, 0, 10, undefined)).toBe(10);
    expect(str(stepValue(1, 1, 0.25, undefined, undefined, 2))).toBe("1.25");
  });
});
