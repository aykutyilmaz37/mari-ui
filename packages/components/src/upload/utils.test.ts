import { describe, expect, it } from "vitest";
import { isFileValid, toAcceptAttribute } from "./utils";

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

  it("accept sözdizimi: joker, virgüllü liste, noktalı uzantı ve jpg/jpeg eşdeğerliği", () => {
    const jpg = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    const pdf = new File(["x"], "fatura.pdf", { type: "application/pdf" });
    expect(isFileValid({ file: jpg, allowedType: "image/*" }).valid).toBe(true);
    expect(isFileValid({ file: pdf, allowedType: "image/*" }).valid).toBe(false);
    expect(isFileValid({ file: pdf, allowedType: "image/png, application/pdf" }).valid).toBe(true);
    expect(isFileValid({ file: jpg, allowedType: ".jpg" }).valid).toBe(true);
    expect(isFileValid({ file: jpg, allowedType: "jpeg" }).valid).toBe(true);
    expect(toAcceptAttribute("png, image/*,.pdf")).toBe(".png,image/*,.pdf");
  });
});
