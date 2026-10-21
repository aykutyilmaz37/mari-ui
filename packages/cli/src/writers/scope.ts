import type { RulesPlatform } from "../manifest";

/**
 * Bir platformun kural gövdeleri. Yalnız bir anahtar varsa (web ya da native)
 * yazıcılar tek gövdeli eski çıktıyı üretir; ikisi birden varsa (`both`)
 * gövdeler ayrı dosyalara ya da aynı dosyada ayrı bölümlere yazılır.
 */
export type PlatformBodies = Partial<Record<RulesPlatform, string>>;

/** `both`ta dosya glob'u ile ayıran araçlar (Cursor, Copilot) için. */
export const PLATFORM_GLOBS: Record<RulesPlatform, string> = {
  web: "**/*.web.tsx",
  native: "**/*.native.tsx,**/*.ios.tsx,**/*.android.tsx",
};

/**
 * `both`ta her bölümün başındaki "hangi dosyalar için" notu. Aynı pakette iki
 * platform varken glob tek başına yetmez (ortak `.tsx` dosyaları); asıl ayırıcı
 * dosyanın import'larıdır.
 */
export const SCOPE_NOTES: Record<RulesPlatform, string> = {
  web: "> **Hangi dosyalar için:** web kodu — `@mari-ui/components` ya da `react-dom` kullanan dosyalar (`*.web.tsx` dahil). `react-native` / `@mari-ui/native` import eden dosyada bu bölümü değil React Native bölümünü uygula.",
  native:
    "> **Hangi dosyalar için:** React Native kodu — `react-native` ya da `@mari-ui/native` import eden dosyalar (`*.native.tsx`, `*.ios.tsx`, `*.android.tsx` dahil). Web dosyasında bu bölümü değil web bölümünü uygula.",
};

export function isDual(bodies: PlatformBodies): bodies is Required<PlatformBodies> {
  return bodies.web !== undefined && bodies.native !== undefined;
}

export function scoped(platform: RulesPlatform, body: string): string {
  return `${SCOPE_NOTES[platform]}\n\n${body}`;
}

/** Tek dosyalı araçlar (AGENTS.md, GEMINI.md): tek gövde aynen; `both`ta iki bölüm alt alta. */
export function singleFileBody(bodies: PlatformBodies): string {
  if (isDual(bodies)) return `${scoped("web", bodies.web)}\n---\n\n${scoped("native", bodies.native)}`;
  return bodies.web ?? bodies.native ?? "";
}
