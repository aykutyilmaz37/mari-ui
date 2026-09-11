import { describe, expect, it } from "vitest";
import { isFileValid } from "./utils";

function makeFile(name: string, type: string, size = 100) {
  return new File(["x".repeat(size)], name, { type });
}

describe("isFileValid", () => {
  it("allowedType bir MIME türü olarak verildiğinde de doğru çalışır (Faz 13 — eskiden 'image/png' hep geçersiz sayılırdı)", () => {
    const file = makeFile("a.png", "image/png");
    expect(isFileValid({ file, allowedType: "image/png" })).toEqual({ valid: true });
  });

  it("allowedType çıplak bir uzantı olarak verildiğinde de çalışır", () => {
    const file = makeFile("a.png", "image/png");
    expect(isFileValid({ file, allowedType: "png" })).toEqual({ valid: true });
  });

  it("uzantı uyuşmuyorsa invalid-type döner", () => {
    const file = makeFile("a.pdf", "application/pdf");
    expect(isFileValid({ file, allowedType: "image/png" })).toEqual({ valid: false, reason: "invalid-type" });
  });

  it("boyut sınırını aşınca size-exceeded döner", () => {
    const file = makeFile("a.png", "image/png", 1000);
    expect(isFileValid({ file, maxSize: 500 })).toEqual({ valid: false, reason: "size-exceeded" });
  });
});
