import { describe, expect, it } from "vitest";
import { AA_TEXT_MIN, contrastRatio, meetsAA } from "../contrast";
import { deriveColorRole } from "../semantic/deriveColorRole";
import { generateRamp } from "../primitives/generateRamp";
import { lightTheme, darkTheme, type Theme } from "../theme";
import type { ColorRole } from "../semantic/colors";

/**
 * Bu test dosyasının varlık sebebi planın kendisinde yazılı: "Tüm semantik
 * çiftler için kontrast doğrulaması bir test olarak yazılacak — göz kararı
 * bırakılmayacak." `deriveColorRole` bir renk üzerinde beyaz metnin AA'yı
 * geçip geçmediğini HESAPLAYIP `solidContrast`i otomatik seçer; bu suite hem
 * yerleşik paletin tüm çiftlerini hem de bu otomatik seçim mekanizmasını
 * doğrular. Soft Iris hem açık hem koyu modda ayrıca hover ve kontrol sınırlarını denetler.
 */

const ROLES: ColorRole[] = ["primary", "accent", "success", "error", "warning", "info", "neutral"];

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

      it(`${role} hover, alternatif yüzey ve kontrol kenarlıkları kontrastı korur`, () => {
        expectAA(`${role} hover`, colorRole.solidHover, colorRole.solidContrast);
        expectAA(`${role} outline hover`, colorRole.subtle, colorRole.text);
        expectAA(`${role} on surfaceAlt`, theme.color.canvas.surfaceAlt, colorRole.text);
        for (const bg of [theme.color.canvas.surface, theme.color.canvas.surfaceAlt, colorRole.subtle]) {
          expect(contrastRatio(bg as `#${string}`, colorRole.border)).toBeGreaterThanOrEqual(3);
        }
      });

      it(`${role}.subtle + ${role}.subtleContrast (yumuşak arka plan metni) AA'yı geçer`, () => {
        expectAA(`${role}.subtle`, colorRole.subtle, colorRole.subtleContrast);
      });

      it(`${role}.text sayfa yüzeyinde (${theme.color.canvas.surface}) AA'yı geçer`, () => {
        expectAA(`${role}.text on surface`, theme.color.canvas.surface, colorRole.text);
      });
    }

    it("input ve odak sınırları her iki yüzeyde 3:1; yardımcı metin 4,5:1", () => {
      const { canvas } = theme.color;
      for (const surface of [canvas.surface, canvas.surfaceAlt]) {
        for (const control of [canvas.input, canvas.ring]) {
          expect(contrastRatio(surface as `#${string}`, control as `#${string}`)).toBeGreaterThanOrEqual(3);
        }
        expectAA("muted", surface, canvas.muted);
      }
    });

    it("foreground sayfa yüzeyinde AAA'yı geçer (gövde metni)", () => {
      const ratio = contrastRatio(
        theme.color.canvas.surface as `#${string}`,
        theme.color.canvas.foreground as `#${string}`
      );
      expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it("muted metin sayfa yüzeyinde AA'yı geçer (ikincil metin)", () => {
      expectAA("muted on surface", theme.color.canvas.surface, theme.color.canvas.muted);
    });
  });
}

testTheme(lightTheme, "Açık");
testTheme(darkTheme, "Koyu");

describe("Otomatik foreground seçimi: açık bir renk üzerinde beyaz metin", () => {
  it("beyazın AA'yı geçemediği bir rampada deriveColorRole koyu foreground seçer", () => {
    // Açık sarı (#facc15) üzerinde beyaz metin ~1.6:1 — AA'nın çok altında.
    // "solidContrast otomatik hesaplanmasaydı ne olurdu" senaryosu: beklenen
    // davranış deriveColorRole'ün otomatik olarak koyu foreground seçmesi.
    const ramp = generateRamp("#facc15");
    const role = deriveColorRole(ramp, "#ffffff", "light", 600);
    expect(contrastRatio(role.solid, "#ffffff")).toBeLessThan(AA_TEXT_MIN);
    expect(role.solidContrast).not.toBe("#ffffff");
    expect(meetsAA(role.solid, role.solidContrast)).toBe(true);
  });

  it("yerleşik paletin her solid/solidContrast çifti gerçekten AA geçer (açık + koyu)", () => {
    for (const role of ROLES) {
      expectAA(`light ${role}.solid`, lightTheme.color[role].solid, lightTheme.color[role].solidContrast);
      expectAA(`dark ${role}.solid`, darkTheme.color[role].solid, darkTheme.color[role].solidContrast);
    }
  });
});
