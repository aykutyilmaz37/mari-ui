import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runInit } from "../init";
import { dependenciesFor, detectPlatform, resolvePlatform } from "../platform";
import { syncAgentRules } from "../sync";
import { runThemeCommand } from "../theme";
import { configFromChoice } from "../themeChoice";
import { cleanupTempDir, makeTempDir, REAL_MANIFEST_PATH } from "./testUtils";

describe("platform tahmini ve paket listesi", () => {
  it("react-native ya da expo varsa native, yoksa web", () => {
    expect(detectPlatform({ dependencies: { expo: "~52.0.0", react: "19" } })).toBe("native");
    expect(detectPlatform({ devDependencies: { "react-native": "0.76.0" } })).toBe("native");
    expect(detectPlatform({ dependencies: { react: "19", "react-dom": "19" } })).toBe("web");
    expect(detectPlatform(null)).toBe("web");
  });

  it("seçilmeyen platformun paketi listede yok", () => {
    expect(dependenciesFor("web")).not.toContain("@mari-ui/native");
    expect(dependenciesFor("native")).not.toContain("@mari-ui/components");
    expect(dependenciesFor("both")).toEqual(expect.arrayContaining(["@mari-ui/components", "@mari-ui/native"]));
  });

  it("tema seçimi config'teki platformu silmez", () => {
    expect(configFromChoice({ kind: "default" }, { platform: "native" }).platform).toBe("native");
  });
});

describe("platforma göre init / sync / theme", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  const writePkg = (pkg: object) => writeFileSync(join(dir, "package.json"), JSON.stringify(pkg), "utf8");
  const readPkg = () => JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

  it("Expo projesinde: native paketi eklenir, web paketi EKLENMEZ, kural dosyası yazılmaz", () => {
    writePkg({ dependencies: { expo: "~52.0.0" } });
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });

    expect(result.platform).toBe("native");
    expect(readPkg().dependencies).toHaveProperty("@mari-ui/native");
    expect(readPkg().dependencies).not.toHaveProperty("@mari-ui/components");
    expect(result.ruleFiles?.skipped).toBe(true);
    for (const file of ["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursor", ".github", ".claude"]) expect(existsSync(join(dir, file))).toBe(false);
    expect(JSON.parse(readFileSync(result.configPath, "utf8")).platform).toBe("native");
  });

  it("açık seçim tahmini ezer ve config'e yazılır; sonraki sync/theme onu kullanır", () => {
    writePkg({ dependencies: { react: "19" } });
    runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, platform: "native" });
    expect(resolvePlatform(dir)).toBe("native");
    expect(syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH }).skipped).toBe(true);
  });

  it("web projesinde native paketi eklenmez; kurallar yazılır", () => {
    writePkg({ dependencies: { react: "19", "react-dom": "19" } });
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(readPkg().dependencies).not.toHaveProperty("@mari-ui/native");
    expect(result.ruleFiles?.skipped).toBe(false);
    expect(existsSync(join(dir, "AGENTS.md"))).toBe(true);
  });

  it("both: iki paket de eklenir", () => {
    writePkg({ dependencies: {} });
    runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, platform: "both" });
    expect(Object.keys(readPkg().dependencies)).toEqual(expect.arrayContaining(["@mari-ui/components", "@mari-ui/native"]));
  });

  it("native projede kurulu web paketi silinmez ama raporlanır", () => {
    writePkg({ dependencies: { expo: "~52.0.0", "@mari-ui/components": "^0.4.0" } });
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.foreignDependencies).toEqual(["@mari-ui/components"]);
    expect(readPkg().dependencies).toHaveProperty("@mari-ui/components");
  });

  it("native projede theme CSS üretmez, yalnız mari-ui-theme.ts", () => {
    writePkg({ dependencies: { "react-native": "0.76.0" } });
    const result = runThemeCommand({ targetDir: dir });
    expect(result.cssPath).toBeUndefined();
    expect(existsSync(join(dir, "mari-ui-theme.css"))).toBe(false);
    expect(existsSync(result.themeTsPath)).toBe(true);
  });
});
