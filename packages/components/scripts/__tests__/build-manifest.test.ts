import { join } from "node:path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { cleanTypeText, extractAxes, resolveComponents } from "../build-manifest";

const PACKAGE_ROOT = join(__dirname, "../..");

function buildProject(): Project {
  return new Project({ tsConfigFilePath: join(PACKAGE_ROOT, "tsconfig.json") });
}

describe("cleanTypeText", () => {
  it("mutlak dosya yolu içeren import() önekini siler", () => {
    expect(cleanTypeText('import("/Users/ako/x/packages/core/dist/index").ColorRole | undefined')).toBe("ColorRole | undefined");
  });

  it("import() içermeyen bir metni değiştirmeden bırakır", () => {
    expect(cleanTypeText("string | undefined")).toBe("string | undefined");
  });
});

// Her test gerçek kaynakla bir ts-morph projesi kurar; coverage (v8) açıkken 5 sn'yi aşıyordu.
describe("resolveComponents (gerçek kaynak kodu üzerinde — fixture değil)", { timeout: 30_000 }, () => {
  it("Button: gerçek prop'ları ve terk edilmiş `type`'ı JSDoc'tan doğru çıkarır", () => {
    const project = buildProject();
    const [button] = resolveComponents(project, "button", join(PACKAGE_ROOT, "src/button/index.ts"));
    expect(button?.name).toBe("Button");
    expect(button?.importPath).toBe("@mari-ui/components/button");
    expect(button?.requiresUseClient).toBe(false);

    const colorProp = button?.props.find((p) => p.name === "color");
    expect(colorProp?.type).toBe("ColorRole | undefined");
    expect(colorProp?.deprecated).toBe(false);

    const legacyType = button?.props.find((p) => p.name === "type");
    expect(legacyType?.deprecated).toBe(true);
    expect(legacyType?.deprecatedReason).toContain("color");
  });

  it("React'ten miras alınan ARIA/DOM property'lerini (kendi kaynağımızda deklare edilmemiş) dışarıda bırakır", () => {
    const project = buildProject();
    const [button] = resolveComponents(project, "button", join(PACKAGE_ROOT, "src/button/index.ts"));
    const propNames = button?.props.map((p) => p.name) ?? [];
    expect(propNames).not.toContain("aria-label");
    expect(propNames).not.toContain("key");
    expect(propNames).not.toContain("style");
  });

  it("Input: use client gerektiren bir component olarak işaretlenir (gerçek dosyada hook kullanıyor)", () => {
    const project = buildProject();
    const components = resolveComponents(project, "input", join(PACKAGE_ROOT, "src/input/index.ts"));
    const input = components.find((c) => c.name === "Input");
    expect(input?.requiresUseClient).toBe(true);
  });

  it("Tek bir index.ts BİRDEN FAZLA component export edebiliyorsa (input klasörü) hepsini ayrı ayrı listeler", () => {
    const project = buildProject();
    const components = resolveComponents(project, "input", join(PACKAGE_ROOT, "src/input/index.ts"));
    const names = components.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["Input", "Textarea", "OtpInput", "SearchInput"]));
    // Aynı klasörden geldikleri için aynı import yolunu paylaşırlar.
    expect(components.every((c) => c.importPath === "@mari-ui/components/input")).toBe(true);
  });

  it("Card: eskiden hiç uygulanmayan `styles` prop'unun kaldırılma gerekçesini JSDoc'tan taşır", () => {
    const project = buildProject();
    const [card] = resolveComponents(project, "card", join(PACKAGE_ROOT, "src/card/index.ts"));
    const stylesProp = card?.props.find((p) => p.name === "styles");
    expect(stylesProp?.deprecated).toBe(true);
    expect(stylesProp?.deprecatedReason).toMatch(/classNames/);
    // JSDoc kaynakta birden fazla satıra bölünmüş olsa bile tek satıra normalize edilmeli.
    expect(stylesProp?.deprecatedReason).not.toMatch(/\n/);
  });

  it("Type-only export'ları (interface/type alias) component sanmaz", () => {
    const project = buildProject();
    const components = resolveComponents(project, "button", join(PACKAGE_ROOT, "src/button/index.ts"));
    const names = components.map((c) => c.name);
    expect(names).not.toContain("ButtonProps");
    expect(names).not.toContain("ButtonShape");
  });
});

describe("extractAxes (gerçek @mari-ui/core/src/types/common.ts üzerinde)", () => {
  it("beş paylaşılan ekseni de bulur, gerçek değerleriyle", () => {
    const project = buildProject();
    const axes = extractAxes(project);
    expect(axes.ColorRole).toEqual(expect.arrayContaining(["primary", "accent", "success", "error", "warning", "info", "neutral"]));
    expect(axes.Size).toEqual(expect.arrayContaining(["sm", "md", "lg"]));
    expect(axes.Variant).toEqual(expect.arrayContaining(["solid", "outline", "soft", "ghost", "link"]));
    expect(axes.Radius).toEqual(expect.arrayContaining(["none", "sm", "md", "lg", "xl", "full"]));
    expect(axes.Placement).toContain("top-start");
  });

  it("saf string-literal union OLMAYAN yardımcı tipleri (örn. SlotClassNames<T>) dışarıda bırakır", () => {
    const project = buildProject();
    const axes = extractAxes(project);
    expect(axes.SlotClassNames).toBeUndefined();
  });
});
