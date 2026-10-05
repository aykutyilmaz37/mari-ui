import { describe, expect, it } from "vitest";
import { clampPercent, filledSteps, progressValueText, resolveProgressColor, resolveProgressStatus } from "../Progress/utils";

describe("Progress", () => {
  it("yüzdeyi 0–100 aralığına sınırlar", () => {
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(undefined)).toBe(0);
  });
  it("durum verilmezse %100'de success; success/exception kendi rengini alır", () => {
    expect(resolveProgressStatus(undefined, 100)).toBe("success");
    expect(resolveProgressStatus(undefined, 40)).toBe("normal");
    expect(resolveProgressColor("exception", "primary")).toBe("error");
    expect(resolveProgressColor("normal", undefined)).toBe("primary");
  });
  it("ekran okuyucu metni durumu söyler, özel format kullanılır", () => {
    expect(progressValueText(undefined, 45, "normal")).toBe("%45");
    expect(progressValueText(undefined, 100, "success")).toBe("%100, tamamlandı");
    expect(progressValueText("3/5 dosya", 60, "exception")).toBe("3/5 dosya, hata");
  });
  it("adım modunda dolu adım sayısı", () => {
    expect(filledSteps(50, 5)).toBe(3);
    expect(filledSteps(100, 4)).toBe(4);
  });
});
