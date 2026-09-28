import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { buildRulesContent } from "../buildRulesContent";
import { loadManifest } from "../manifest";
import { REAL_MANIFEST_PATH } from "./testUtils";

describe("buildRulesContent (gerçek manifest.json üzerinde)", () => {
  const manifest = loadManifest(process.cwd(), REAL_MANIFEST_PATH);
  const content = buildRulesContent({ manifest, theme: lightTheme });

  it("component envanterini içerir (gerçek import yoluyla)", () => {
    expect(content).toContain("@mari-ui/components/button");
    expect(content).toContain("Button");
  });

  it("beş eksenin hepsini tablo olarak içerir", () => {
    expect(content).toContain("ColorRole");
    expect(content).toContain("`primary`");
    expect(content).toContain("Variant");
    expect(content).toContain("Placement");
  });

  it("terk edilmiş prop'ları GERÇEK JSDoc gerekçesiyle listeler", () => {
    expect(content).toMatch(/Button\.type/);
    expect(content).toMatch(/Tag\.statu/);
  });

  it("çözümlenmiş tema renklerini (gerçek hex değerleri) tabloya koyar", () => {
    expect(content).toContain(lightTheme.color.primary.solid);
  });

  it("anti-pattern bölümünü içerir", () => {
    expect(content).toContain("Anti-pattern");
    expect(content).toContain("Runtime'da Tailwind class string'i üretme");
  });

  it("elle düzenlenmemesi gerektiğini açıkça belirtir", () => {
    expect(content).toMatch(/npx mari-ui sync/);
  });
});
