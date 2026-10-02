/**
 * Public varlık (görsel, video, font, indirme) adresi üretici.
 *
 * Kütüphane ortam değişkeni OKUMAZ — `process.env.NEXT_PUBLIC_*` Next'e,
 * `import.meta.env` Vite'a özgü; hangisinin kullanılacağı uygulamanın
 * kararıdır. Tüketici değerleri bir kez bağlar:
 *
 * ```ts
 * export const asset = createAssetResolver({
 *   assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
 *   cdnUrl: process.env.NEXT_PUBLIC_CDN_ZONE === "true" ? process.env.NEXT_PUBLIC_CDN_URL : undefined,
 *   absoluteBase: process.env.NEXT_PUBLIC_IMAGE_PRELINK,
 * });
 * ```
 */
export interface AssetResolverConfig {
  /** Her yolun önüne eklenen yol öneki, örn. `/bo-web-assets`. */
  assetPrefix?: string;
  /** Verilirse adres bu kökle tam URL olur, örn. `https://cdn.example.com`. */
  cdnUrl?: string;
  /** `{ absolute: true }` çağrılarının kökü (önek/CDN uygulanmaz). */
  absoluteBase?: string;
}

export interface ResolveAssetOptions {
  /** `absoluteBase` kökünü kullan; `assetPrefix` ve `cdnUrl` atlanır. */
  absolute?: boolean;
}

export type AssetResolver = (path?: string | null, options?: ResolveAssetOptions) => string;

/** Dokunulmadan döndürülecek adresler: `http(s):`, protokolsüz `//`, `data:`, `blob:`. */
const PASSTHROUGH = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

function trimTrailingSlash(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end--;
  return value.slice(0, end);
}
const withLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

/** Adres zaten tam mı (şema veya `//` ile başlıyor) — önek/CDN eklenmemeli. */
export function isAbsoluteUrl(path: string): boolean {
  return PASSTHROUGH.test(path);
}

export function createAssetResolver(config: AssetResolverConfig = {}): AssetResolver {
  const prefix = trimTrailingSlash(config.assetPrefix ?? "");
  const cdn = trimTrailingSlash(config.cdnUrl ?? "");
  const absoluteBase = trimTrailingSlash(config.absoluteBase ?? "");

  return (path, options) => {
    if (!path) return "";
    if (isAbsoluteUrl(path)) return path;

    const normalized = withLeadingSlash(path);
    if (options?.absolute) return `${absoluteBase}${normalized}`;

    const prefixed = prefix ? `${withLeadingSlash(prefix)}${normalized}` : normalized;
    return cdn ? `${cdn}${prefixed}` : prefixed;
  };
}
