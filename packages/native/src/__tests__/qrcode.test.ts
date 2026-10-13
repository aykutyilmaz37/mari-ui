import { describe, expect, it } from "vitest";
import qrcode from "qrcode-generator";
import { buildQRModel, toByteString } from "../QRCode/qrUtils";

const base = { errorLevel: "M" as const, margin: 2, dotType: "square" as const, cornerSquareType: "square" as const, cornerDotType: "square" as const };

describe("qrcode/utils", () => {
  it("toByteString: UTF-8 baytları (kütüphanenin kendi UTF-8 çeviricisiyle aynı)", () => {
    const text = "Şişli Çağlayan — ğüöı";
    const expected = qrcode.stringToBytesFuncs["UTF-8"]!(text);
    expect(Array.from(toByteString(text), (c) => c.charCodeAt(0))).toEqual(expected);
    // Varsayılan kodlama "ş"yi 0x5F ("_") yapardı.
    expect(toByteString("ş")).toBe("Å\u009f");
  });

  it("buildQRModel: viewBox = modül + 2×kenar; üç konum işareti; hata düzeyi sürümü büyütür", () => {
    const m = buildQRModel({ ...base, value: "https://mari-ui.dev" });
    expect(m.moduleCount).toBe(25);
    expect(m.size).toBe(29);
    expect(m.corners).toHaveLength(3);
    expect(m.dataPath.length).toBeGreaterThan(0);
    expect(buildQRModel({ ...base, errorLevel: "H", value: "https://mari-ui.dev" }).moduleCount).toBeGreaterThan(25);
  });

  it("nokta/köşe tipleri yolu değiştirir", () => {
    const square = buildQRModel({ ...base, value: "a" });
    const dots = buildQRModel({ ...base, value: "a", dotType: "dots", cornerSquareType: "dot", cornerDotType: "dot" });
    expect(dots.dataPath).toContain("a");
    expect(square.dataPath).not.toContain("a");
    expect(dots.corners[0]!.ring).not.toBe(square.corners[0]!.ring);
  });
});
