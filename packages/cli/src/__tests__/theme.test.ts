import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { runThemeCommand } from "../theme";
import { cleanupTempDir, makeTempDir } from "./testUtils";

describe("runThemeCommand", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("config yokken bile (varsayılan tema) CSS + TS token dosyalarını üretir", () => {
    const result = runThemeCommand({ targetDir: dir });
    expect(existsSync(result.cssPath)).toBe(true);
    expect(existsSync(result.themeTsPath)).toBe(true);
    expect(readFileSync(result.cssPath, "utf8")).toContain(":root {");
    expect(readFileSync(result.themeTsPath, "utf8")).toContain("export const mariTheme");
  });

  it("özel bir mari-ui.config.json'daki rengi GERÇEKTEN kullanır", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ color: { primary: "#059669" } }), "utf8");
    const result = runThemeCommand({ targetDir: dir });
    expect(result.cssContent).not.toContain(`--mari-color-primary-solid: ${lightTheme.color.primary.solid};`);
  });

  it("check: true iken dosya yazmadan bayat olup olmadığını raporlar", () => {
    const first = runThemeCommand({ targetDir: dir, check: true });
    expect(first.stale).toBe(true);
    expect(existsSync(first.cssPath)).toBe(false);

    runThemeCommand({ targetDir: dir });
    const second = runThemeCommand({ targetDir: dir, check: true });
    expect(second.stale).toBe(false);
  });

  it("outDir verilirse dosyaları oraya yazar (config yine targetDir'den okunur)", () => {
    const outDir = makeTempDir();
    try {
      const result = runThemeCommand({ targetDir: dir, outDir });
      expect(result.cssPath.startsWith(outDir)).toBe(true);
    } finally {
      cleanupTempDir(outDir);
    }
  });

  it("density.spacing CSS'e kök varsayılan, TS'e spacingDensity olarak yazılır", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ density: { spacing: "comfortable" } }), "utf8");
    const result = runThemeCommand({ targetDir: dir });
    expect(result.cssContent).toContain(":root:not([data-density])");
    expect(result.themeTsContent).toContain('"spacingDensity": "comfortable"');
  });

  it("scale.fluid açıkken CSS'e akışkan kök yazı boyutu yazılır", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ scale: { fluid: true, max: 24 } }), "utf8");
    expect(runThemeCommand({ targetDir: dir }).cssContent).toContain("font-size: clamp(100%");
    const plainDir = makeTempDir();
    try {
      expect(runThemeCommand({ targetDir: plainDir }).cssContent).not.toContain("html {");
    } finally {
      cleanupTempDir(plainDir);
    }
  });

  it("Faz 10 — config.themes'teki ek isimli temalar da CSS'e [data-theme=\"...\"] olarak yazılır", () => {
    writeFileSync(
      join(dir, "mari-ui.config.json"),
      JSON.stringify({ themes: { brand: { base: "light", color: { primary: "#a21caf" } } } }),
      "utf8"
    );
    const result = runThemeCommand({ targetDir: dir });
    expect(result.cssContent).toContain('[data-theme="brand"]');
    expect(result.themeTsContent).toContain('"brand"');
  });
});
