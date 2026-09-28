import { describe, expect, it } from "vitest";
import { formatCountdown, formatStopwatch, formatValue, spokenDuration, splitDuration, trendTone } from "./utils";

describe("Statistic utils", () => {
  it("formatValue: tr-TR, precision", () => {
    expect(formatValue(1234567.8, undefined, "tr-TR")).toBe("1.234.567,8");
    expect(formatValue(1499.9, 2, "tr-TR")).toBe("1.499,90");
    expect(formatValue("—", 2, "tr-TR")).toBe("—");
  });

  it("splitDuration: negatif 0'a kırpılır", () => {
    expect(splitDuration(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, centis: 0 });
    expect(splitDuration(90_061_230)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, centis: 23 });
  });

  it("formatCountdown: gün / saat / dakika kademeleri", () => {
    const day = 86_400_000;
    expect(formatCountdown(2 * day + 4 * 3_600_000 + 12 * 60_000 + 9000)).toBe("2 gün 04:12:09");
    expect(formatCountdown(4 * 3_600_000 + 5000)).toBe("04:00:05");
    expect(formatCountdown(12 * 60_000 + 9000)).toBe("12:09");
    expect(formatCountdown(2 * day + 4 * 3_600_000, { showDays: false })).toBe("52:00:00");
    expect(formatCountdown(-1)).toBe("00:00");
  });

  it("formatStopwatch: dk:sn,salise; saat geçince başa saat", () => {
    expect(formatStopwatch(307_420)).toBe("05:07,42");
    expect(formatStopwatch(3_907_420)).toBe("1:05:07,42");
  });

  it("spokenDuration: sıfır birimler atlanır", () => {
    expect(spokenDuration(2 * 86_400_000 + 9000)).toBe("2 gün 9 saniye");
    expect(spokenDuration(0)).toBe("0 saniye");
  });

  it("trendTone: anlam yönden değil goodWhen'den", () => {
    expect(trendTone(12, "up")).toBe("good");
    expect(trendTone(-3, "up")).toBe("bad");
    expect(trendTone(8, "down")).toBe("bad");
    expect(trendTone(-8, "down")).toBe("good");
    expect(trendTone(0, "up")).toBe("neutral");
  });
});
