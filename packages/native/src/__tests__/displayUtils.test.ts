import { describe, expect, it } from "vitest";
import { displayCount, isBadgeHidden } from "../Badge/utils";
import { getInitials } from "../Avatar/utils";
import { defaultNativeConfig, mergeNativeConfig } from "../nativeConfig";

describe("Badge displayCount", () => {
  it("sınırı aşan sayıyı N+ yapar", () => {
    expect(displayCount(100, 99)).toBe("99+");
    expect(displayCount(99, 99)).toBe("99");
  });
  it("metni olduğu gibi, boş değeri null döner", () => {
    expect(displayCount("Yeni", 99)).toBe("Yeni");
    expect(displayCount("", 99)).toBeNull();
    expect(displayCount(undefined, 99)).toBeNull();
  });
});

describe("Badge isBadgeHidden", () => {
  it("0'ı yalnız showZero ile gösterir", () => {
    expect(isBadgeHidden(false, "0", 0, false)).toBe(true);
    expect(isBadgeHidden(false, "0", 0, true)).toBe(false);
  });
  it("nokta her zaman görünür", () => {
    expect(isBadgeHidden(true, null, undefined, false)).toBe(false);
  });
});

describe("Avatar getInitials", () => {
  it("ilk ve son kelimenin baş harfi, Türkçe büyük harf", () => {
    expect(getInitials("ilker Nur Şahin")).toBe("İŞ");
    expect(getInitials("  Ayşe  ")).toBe("A");
    expect(getInitials("")).toBe("");
  });
});

describe("nativeConfig gösterim ölçekleri", () => {
  it("tag tek nesne olarak, avatar/badge/typography satır satır ezilir", () => {
    const merged = mergeNativeConfig(defaultNativeConfig, { tag: { fontSize: 12 }, avatar: { md: { size: 44 } }, typography: { body: { fontSize: 16 } } });
    expect(merged.tag).toEqual({ ...defaultNativeConfig.tag, fontSize: 12 });
    expect(merged.avatar.md).toEqual({ ...defaultNativeConfig.avatar.md, size: 44 });
    expect(merged.avatar.lg).toEqual(defaultNativeConfig.avatar.lg);
    expect(merged.typography.body.lineHeight).toBe(defaultNativeConfig.typography.body.lineHeight);
    expect(merged.badge).toEqual(defaultNativeConfig.badge);
  });
});
