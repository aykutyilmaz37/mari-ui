import { describe, expect, it } from "vitest";
import { AA_TEXT_MIN, contrastRatio } from "../contrast";
import { lightTheme, darkTheme, type Theme } from "../theme";
import type { ColorRole } from "../semantic/colors";

/**
 * Bu test dosyasının varlık sebebi planın kendisinde yazılı: "Tüm semantik
 * çiftler için kontrast doğrulaması bir test olarak yazılacak — göz kararı
 * bırakılmayacak." Turuncu accent (#F97316) üzerine beyaz metin konursa
 * WCAG AA'yı geçemez (~2.8:1); bu test suite'i tam olarak böyle bir
 * regresyonun sessizce geri gelmesini engeller.
 */

const ROLES: Exclude<ColorRole, "neutral">[] = [
  "primary",
  "accent",
  "success",
  "error",
  "warning",
  "info",
];

function expectAA(label: string, bg: string, fg: string) {
  const ratio = contrastRatio(bg as `#${string}`, fg as `#${string}`);
  expect(ratio, `${label}: ${bg} vs ${fg} → ${ratio.toFixed(2)}:1 (AA eşiği ${AA_TEXT_MIN}:1)`).toBeGreaterThanOrEqual(
    AA_TEXT_MIN
  );
}

function testTheme(theme: Theme, name: string) {
  describe(`${name} tema`, () => {
    for (const role of ROLES) {
      const colorRole = theme.color[role];

      it(`${role}.solid + ${role}.solidContrast (dolgulu bileşen metni) AA'yı geçer`, () => {
        expectAA(`${role}.solid`, colorRole.solid, colorRole.solidContrast);
      });

      it(`${role}.subtle + ${role}.subtleContrast (yumuşak arka plan metni) AA'yı geçer`, () => {
        expectAA(`${role}.subtle`, colorRole.subtle, colorRole.subtleContrast);
      });

      it(`${role}.text sayfa yüzeyinde (${theme.color.neutral.surface}) AA'yı geçer`, () => {
        expectAA(`${role}.text on surface`, theme.color.neutral.surface, colorRole.text);
      });
    }

    it("foreground sayfa yüzeyinde AAA'yı geçer (gövde metni)", () => {
      const ratio = contrastRatio(
        theme.color.neutral.surface as `#${string}`,
        theme.color.neutral.foreground as `#${string}`
      );
      expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it("muted metin sayfa yüzeyinde AA'yı geçer (ikincil metin)", () => {
      expectAA("muted on surface", theme.color.neutral.surface, theme.color.neutral.muted);
    });
  });
}

testTheme(lightTheme, "Açık");
testTheme(darkTheme, "Koyu");

describe("Bilinen regresyon: turuncu accent + beyaz metin", () => {
  it("accent.solid (#F97316 ailesi) üzerinde düz beyazın AA'yı GEÇEMEYECEĞİNİ doğrular", () => {
    // Bu, "solidContrast otomatik hesaplanmasaydı ne olurdu" senaryosu —
    // beklenen davranış: whiteContrast AA'yı geçmiyor, bu yüzden
    // deriveColorRole otomatik olarak koyu bir foreground seçiyor.
    const ratio = contrastRatio(lightTheme.color.accent.solid, "#ffffff");
    expect(ratio).toBeLessThan(AA_TEXT_MIN);
    // Ve gerçekten kullanılan solidContrast bunun yerine AA'yı geçiyor:
    expectAA("accent.solid (gerçek foreground ile)", lightTheme.color.accent.solid, lightTheme.color.accent.solidContrast);
  });
});
