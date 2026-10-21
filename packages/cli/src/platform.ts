import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { MariUiThemeConfig } from "@mari-ui/tokens";
import { readConfigIfExists } from "./configFile";

/**
 * Projenin hedef platformu. `web` → `@mari-ui/components`, `native` →
 * `@mari-ui/native`, `both` → ikisi (tek `package.json`da iki platformu
 * hedefleyen projeler, ör. Expo + web). Ayrı web ve mobil uygulamaları olan bir
 * monorepo'da her uygulama kendi klasöründe (`--dir`) ayrı kurulur.
 */
export type Platform = NonNullable<MariUiThemeConfig["platform"]>;

export const PLATFORMS = ["web", "native", "both"] as const satisfies readonly Platform[];

export const PLATFORM_LABELS: Record<Platform, string> = {
  web: "Web (React)",
  native: "Mobil (React Native / Expo)",
  both: "İkisi de (aynı pakette web + mobil)",
};

const COMMON_DEPENDENCIES = ["@mari-ui/core", "@mari-ui/tokens"] as const;
export const WEB_PACKAGE = "@mari-ui/components";
export const NATIVE_PACKAGE = "@mari-ui/native";

/** Platformun kurulacak paketleri. Seçilmeyen platformun paketi listede hiç yok. */
export function dependenciesFor(platform: Platform): string[] {
  const own = { web: [WEB_PACKAGE], native: [NATIVE_PACKAGE], both: [WEB_PACKAGE, NATIVE_PACKAGE] }[platform];
  return [...own, ...COMMON_DEPENDENCIES];
}

/** Platforma ait OLMAYAN mari-ui paketi (ör. native projede `@mari-ui/components`) — `init` uyarır, silmez. */
export function foreignPackagesFor(platform: Platform): string[] {
  if (platform === "web") return [NATIVE_PACKAGE];
  if (platform === "native") return [WEB_PACKAGE];
  return [];
}

export function isPlatform(value: unknown): value is Platform {
  return (PLATFORMS as readonly unknown[]).includes(value);
}

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * `package.json`dan tahmin (soru sorulamadığında ve config'te `platform` yokken).
 * `react-native`/`expo` → native; yoksa web. Expo web de `react-dom` taşıdığı için
 * `react-dom` varlığı `both` sayılmaz — `both` yalnız açıkça seçilir.
 */
export function detectPlatform(pkg: PackageJsonLike | null): Platform {
  if (!pkg) return "web";
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return deps["react-native"] || deps.expo ? "native" : "web";
}

export function readPackageJson(targetDir: string): PackageJsonLike | null {
  const path = join(targetDir, "package.json");
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as PackageJsonLike) : null;
}

/** Config'te yazılı platform; yoksa `undefined` (sihirbaz sorsun ya da tahmin edilsin). */
export function configuredPlatform(targetDir: string): Platform | undefined {
  const platform = readConfigIfExists(targetDir)?.platform;
  return isPlatform(platform) ? platform : undefined;
}

/** `sync`/`theme`in kullandığı platform: config → `package.json` tahmini. */
export function resolvePlatform(targetDir: string): Platform {
  return configuredPlatform(targetDir) ?? detectPlatform(readPackageJson(targetDir));
}
