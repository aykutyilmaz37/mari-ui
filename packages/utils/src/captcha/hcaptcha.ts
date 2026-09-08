import { loadScriptOnce } from "../scriptLoader";

/** `Window` genişletmesi — bkz. recaptcha.ts'teki aynı gerekçe (neden ayrı bir `types.ts` dosyası yerine burada). */
declare global {
  interface Window {
    hcaptcha?: {
      execute(siteKeyOrWidgetId?: string, options?: { async: true }): Promise<{ response: string }>;
    };
  }
}

const SCRIPT_ID = "mari-ui-hcaptcha";

/**
 * hCaptcha'nın script'ini yükler. `explicit` render modu (`?render=explicit`)
 * kasıtlı — tüketici DOM'a NE ZAMAN bir widget render edeceğine kendisi
 * karar verir, script kendiliğinden sayfadaki `.h-captcha` elementlerini
 * aramaz. https://docs.hcaptcha.com/
 */
export function loadHCaptcha(): Promise<void> {
  return loadScriptOnce("https://js.hcaptcha.com/1/api.js?render=explicit", { id: SCRIPT_ID });
}

/**
 * Görünmez (invisible) bir hCaptcha widget'ını tetikler ve doğrulama
 * token'ını döner. `widgetId`, tüketicinin `hcaptcha.render(...)` ile
 * kendi oluşturduğu widget'ın kimliği — bu paket widget RENDER ETMEZ
 * (DOM/layout kararı tüketicinin), sadece tetikleme+token akışını sarar.
 */
export function executeHCaptcha(widgetId?: string): Promise<string> {
  if (typeof window === "undefined" || !window.hcaptcha) {
    return Promise.reject(new Error("[@mari-ui/utils] executeHCaptcha: hcaptcha yüklü değil — önce loadHCaptcha() çağrılmalı."));
  }
  return window.hcaptcha.execute(widgetId, { async: true }).then((result) => result.response);
}
