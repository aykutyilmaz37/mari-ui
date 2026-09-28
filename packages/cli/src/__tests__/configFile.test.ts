import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, readConfig, writeDefaultConfigIfMissing } from "../configFile";
import { cleanupTempDir, makeTempDir } from "./testUtils";

describe("configFile", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("readConfig: dosya yoksa DEFAULT_CONFIG'i döner (init hiç çalıştırılmamış projede bile sync çalışabilsin diye)", () => {
    expect(readConfig(dir)).toEqual(DEFAULT_CONFIG);
  });

  it("readConfig: dosya varsa onu okur", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ color: { primary: "#000000" } }), "utf8");
    expect(readConfig(dir)).toEqual({ color: { primary: "#000000" } });
  });

  it("writeDefaultConfigIfMissing: dosya yoksa oluşturur", () => {
    const result = writeDefaultConfigIfMissing(dir);
    expect(result.created).toBe(true);
    expect(existsSync(result.path)).toBe(true);
    expect(JSON.parse(readFileSync(result.path, "utf8"))).toEqual(DEFAULT_CONFIG);
  });

  it("writeDefaultConfigIfMissing: dosya VARSA üzerine YAZMAZ (kullanıcının tema seçimini silmez)", () => {
    const customConfig = { color: { primary: "#7c3aed", accent: "#f97316" } };
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify(customConfig), "utf8");

    const result = writeDefaultConfigIfMissing(dir);
    expect(result.created).toBe(false);
    expect(JSON.parse(readFileSync(result.path, "utf8"))).toEqual(customConfig);
  });
});
