import type { Theme } from "@mari-ui/tokens";

/**
 * Font kipi:
 *
 * `"system"` (varsayılan): iOS'ta SF, Android'de Roboto. Hiçbir font dosyası
 *  yüklenmesi gerekmez. Token'lardaki aile adları ("Geist"…) kullanılmaz —
 *  yüklenmemiş bir aile iOS'ta geliştirme modunda hata basar, web'de serif'e
 *  düşer (Expo'da gerçek render'da görüldü).
 * - `"brand"`: token aileleri (Geist gövde, Manrope başlık, Geist Mono kod).
 *  Tüketici dosyaları `expo-font` ile, kayıt adı aile adıyla aynı olacak
 *  şekilde yükler (bkz. `BRAND_FONT_FAMILIES` ve README).
 */
export type NativeFonts = "system" | "brand";

/** `"brand"` kipinde yüklenmesi gereken aileler — `useFonts` anahtarları bunlar olmalı. */
export const BRAND_FONT_FAMILIES = ["Geist", "Manrope", "Geist Mono"] as const;

/** `nativeFontFamily` bu değerler için `undefined` döner → RN platform fontunu kullanır. */
const SYSTEM_FAMILY: Theme["fontFamily"] = { sans: "system-ui", mono: "ui-monospace", heading: "system-ui" };

const systemCache = /* @__PURE__ */ new WeakMap<Theme, Theme>();

/** Temayı font kipine göre döner; sistem kopyası tema başına bir kez üretilir (kimlik sabit → gereksiz render yok). */
export function withFonts(theme: Theme, fonts: NativeFonts): Theme {
  if (fonts === "brand") return theme;
  let system = systemCache.get(theme);
  if (!system) {
    system = { ...theme, fontFamily: SYSTEM_FAMILY };
    systemCache.set(theme, system);
  }
  return system;
}
