import { loadScriptOnce } from "../scriptLoader";

/**
 * `Window` genişletmesi burada, kullanan kodun YANINDA (ayrı bir `types.ts`
 * yerine) — ayrı bir dosya olsaydı SADECE tip amaçlı, çalışma zamanında
 * hiçbir etkisi olmayan bir `import "./types"` gerekirdi ve bu, tsup'ın
 * `sideEffects: false` optimizasyonuyla çakışıp bir build uyarısı üretirdi
 * (fiilen denenip görüldü). `declare global`, `tsconfig.json`'un `include`'
 * una giren HER dosyada zaten global — yeniden import etmeye gerek yok.
 */
declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

const SCRIPT_ID = "mari-ui-recaptcha-v3";

/**
 * Google reCAPTCHA v3 (görünmez, aksiyon-bazlı) script'ini yükler.
 * `siteKey` tüketicinin KENDİ Google reCAPTCHA konsolundan aldığı anahtar —
 * bu paket hiçbir anahtarı sabit KODLAMAZ/varsaymaz.
 * https://developers.google.com/recaptcha/docs/v3
 */
export function loadRecaptcha(siteKey: string): Promise<void> {
  return loadScriptOnce(`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`, { id: SCRIPT_ID });
}

/**
 * Script zaten yüklenmiş olmalı (`loadRecaptcha` önce çağrılmış olmalı) —
 * `grecaptcha.ready()`in HAZIR olmasını bekleyip `action` için bir token
 * üretir. `action` reCAPTCHA'nın kendi terminolojisinde "bu doğrulamanın
 * hangi kullanıcı eylemi için yapıldığı" (örn. `"login"`, `"signup"`) —
 * Google'ın risk skorlamasında kullanılır.
 */
export function executeRecaptcha(siteKey: string, action: string): Promise<string> {
  if (typeof window === "undefined" || !window.grecaptcha) {
    return Promise.reject(new Error("[@mari-ui/utils] executeRecaptcha: grecaptcha yüklü değil — önce loadRecaptcha() çağrılmalı."));
  }
  const grecaptcha = window.grecaptcha;
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}
