/**
 * Son kullanıcı tema ayarının kalıcılığı + açılış (FOUC) script'i. Bu pakette
 * — React'siz, "use client"sız — durması bilinçli: `getThemeScript` sunucuda
 * (ör. RSC layout'u, SSR şablonu, build adımı) da çağrılabilmeli.
 */
import { buildThemeVars, type ThemeSettings } from "./runtimeTheme";
import type { ThemeMode } from "./semantic/deriveColorRole";

export const DEFAULT_THEME_STORAGE_KEY = "mari-theme";

/** Paket DOM tiplerini yüklemiyor; yalnız gereken iki yöntem. */
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Sunucuda / depolama engelliyken `undefined` ya da erişimde hata — çağıranlar try içinde. */
const getStorage = () => (globalThis as { localStorage?: StorageLike }).localStorage;

/**
 * localStorage'daki kayıt. Vurgu rengi değişkenleri iki mod için ÖNCEDEN
 * hesaplanıp saklanır: açılış script'i paket kodu yükleyemez (kontrast
 * düzeltmesi çalıştıramaz), yalnız hazır değerleri yazar.
 */
interface StoredTheme {
  v: 1;
  settings: Partial<ThemeSettings>;
  vars: Record<ThemeMode, Record<string, string>>;
}

/** Ayarı kaydeder — `ThemeCustomizer`ın `onChange`ine verilir. Depolama kapalıysa sessizce geçer. */
export function saveTheme(settings: Partial<ThemeSettings>, storageKey = DEFAULT_THEME_STORAGE_KEY): void {
  const stored: StoredTheme = {
    v: 1,
    settings,
    vars: { light: buildThemeVars(settings, "light"), dark: buildThemeVars(settings, "dark") },
  };
  try {
    getStorage()?.setItem(storageKey, JSON.stringify(stored));
  } catch {
    // Gizli pencere / kota / SSR — kalıcılık yok, tema yine de uygulanmış durumda.
  }
}

/** Kayıtlı ayarı okur; yoksa ya da bozuksa `undefined`. */
export function loadTheme(storageKey = DEFAULT_THEME_STORAGE_KEY): Partial<ThemeSettings> | undefined {
  try {
    const raw = getStorage()?.getItem(storageKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    return parsed?.v === 1 && parsed.settings && typeof parsed.settings === "object" ? parsed.settings : undefined;
  } catch {
    return undefined;
  }
}

export interface ThemeScriptOptions {
  /** Varsayılan: `"mari-theme"` — `saveTheme`/`loadTheme` ile aynı olmalı. */
  storageKey?: string;
}

/**
 * Sayfa çizilmeden önce kayıtlı temayı `<html>`e yazan satır içi script'in
 * KAYNAK METNİ (FOUC önleme). Framework'ten bağımsız: `<head>`te stylesheet'ten
 * sonra, gövdeden önce bir `<script>` içine konur — React'te
 * `dangerouslySetInnerHTML`, düz HTML'de sunucu şablonu ya da build adımı.
 *
 * Mod/yoğunluk özniteliklerini ve vurgu değişkenlerini `applyTheme` ile aynı
 * biçimde yazar ("system" o anki işletim sistemi tercihine çözülür). Kayıt
 * yoksa hiçbir şey yapmaz: "system" varsayılanını stylesheet'in
 * `prefers-color-scheme` fallback'i zaten karşılıyor. Hydration sonrası
 * `applyTheme(loadTheme())` aynı değerleri yazar, görünür değişim olmaz.
 */
export function getThemeScript({ storageKey = DEFAULT_THEME_STORAGE_KEY }: ThemeScriptOptions = {}): string {
  // `</script>` kaçışı: anahtar tüketiciden gelir, script bloğunu kapatamamalı.
  const key = JSON.stringify(storageKey).replace(/</g, "\\u003c");
  return `(function(){try{var d=JSON.parse(localStorage.getItem(${key})||"null");if(!d||d.v!==1||!d.settings)return;var s=d.settings,e=document.documentElement,m=s.mode==="dark"||s.mode==="light"?s.mode:window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";e.setAttribute("data-theme",m);if(s.spacing)e.setAttribute("data-density",s.spacing);var v=d.vars&&d.vars[m];if(v)for(var k in v)e.style.setProperty(k,v[k])}catch(_){}})();`;
}
