import { describe, expect, it } from "vitest";
import { activeOtpIndex, normalizeOtp } from "../Input/otp";

describe("normalizeOtp", () => {
  it("numeric: yapıştırılan metinden yalnız rakamlar, uzunlukla kesilir", () => {
    expect(normalizeOtp("Kodunuz: 482 913 7", 6, true)).toEqual(["4", "8", "2", "9", "1", "3"]);
  });
  it("text: boşluklar atılır, formatter her haneye uygulanır", () => {
    expect(normalizeOtp("ab c1", 4, false, (c) => c.toLocaleUpperCase("tr"))).toEqual(["A", "B", "C", "1"]);
  });
});

describe("activeOtpIndex", () => {
  it("ilk boş yuva; hepsi doluysa son hane", () => {
    expect(activeOtpIndex(0, 6)).toBe(0);
    expect(activeOtpIndex(3, 6)).toBe(3);
    expect(activeOtpIndex(6, 6)).toBe(5);
  });
});
