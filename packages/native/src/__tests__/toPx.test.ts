import { describe, expect, it } from "vitest";
import { toPx } from "../theme/toPx";

describe("toPx", () => {
  it("rem'i 16px taban üzerinden sayıya çevirir", () => {
    expect(toPx("0.5rem")).toBe(8);
    expect(toPx("1rem")).toBe(16);
    expect(toPx("0.875rem")).toBe(14);
  });

  it("px'i doğrudan sayıya çevirir", () => {
    expect(toPx("0px")).toBe(0);
    expect(toPx("9999px")).toBe(9999);
  });

  it("birimsiz veya tanınmayan bir değeri 0'a düşürür (sessizce NaN üretmez)", () => {
    expect(toPx("not-a-number")).toBe(0);
  });
});
