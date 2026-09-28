# @mari-ui/utils

Faz 11 (backlog madde 12) — mari-ui'ın UI'dan bağımsız cross-cutting özellik modülleri. `@mari-ui/core`dan farkı: `core` headless UI mantığı (variant çözümleme, `cn()`, controlled/uncontrolled hook'ları) taşırken, bu paket component RENDER ETMEZ — üçüncü parti servis entegrasyonlarını sarmalar. **Framework-agnostic** — React'e bağımlı değil, herhangi bir web projesinde (Next.js, Vite, plain JS) kullanılabilir.

## Modüller

### `@mari-ui/utils/datalayer`

Google Tag Manager/GA4'ün endüstri standardı haline gelmiş `window.dataLayer.push()` sözleşmesi — belirli bir vendor'a değil, bu ARA KATMANA bağlanır (Segment/Adobe Launch gibi araçlar da aynı diziyi okur).

```ts
import { pushToDataLayer } from "@mari-ui/utils/datalayer";

pushToDataLayer({ event: "purchase", value: 49.99, currency: "TRY" });
```

`pushToDataLayer`, `window.dataLayer` henüz yoksa (GTM script'i sayfaya geç ekleniyorsa) kendisi oluşturur — olaylar kaybolmaz, GTM script'i geldiğinde geçmişi işler.

### `@mari-ui/utils/captcha`

Google reCAPTCHA v3 (görünmez, aksiyon-bazlı) ve hCaptcha için ince wrapper'lar. Her ikisi de `siteKey`i (veya widget id'sini) TÜKETİCİDEN alır — bu paket hiçbir anahtarı sabit kodlamaz/varsaymaz, ve hCaptcha için widget'ı RENDER ETMEZ (DOM/layout kararı tüketicinin).

```ts
import { loadRecaptcha, executeRecaptcha } from "@mari-ui/utils/captcha";

await loadRecaptcha("SITE_KEY");
const token = await executeRecaptcha("SITE_KEY", "login");
// token'ı backend'e gönderip Google'ın doğrulama endpoint'ine karşı kontrol edin.
```

### `loadScriptOnce` (kök export)

Yukarıdaki iki captcha wrapper'ının da üzerine kurulduğu genel script-enjeksiyon yardımcısı — aynı `src` için tekrar tekrar çağrılırsa script'i İKİNCİ KEZ eklemez, devam eden bir yükleme varsa aynı promise'i döner.

## Neden React hook'u YOK

Bu paket bilinçli olarak vanilla TypeScript — `@mari-ui/core`nun aksine (ki o headless ama React'e bağımlı: `useControllableState` gibi hook'lar taşır), `utils` "UI'dan bağımsız" olma tanımını React'e de bağımlı olmayacak kadar ileri götürüyor. Bir React tüketicisi bu fonksiyonları trivially kendi `useEffect`ine sarabilir:

```tsx
"use client";
useEffect(() => {
  loadRecaptcha(siteKey).catch(console.error);
}, [siteKey]);
```

İleride gerçek bir ihtiyaç çıkarsa (örn. birden fazla component AYNI hook'u tekrar tekrar yazıyorsa) ayrı bir `@mari-ui/utils/react` subpath'i eklenebilir — şimdiden spekülatif olarak eklenmedi.

## Test kapsamı

Tüm modüller jsdom altında test edilir — `scriptLoader` gerçek `<script>` DOM node'ları oluşturup `load`/`error` event'lerini simüle eder, captcha wrapper'ları `window.grecaptcha`/`window.hcaptcha`i mock'layıp doğru argümanlarla çağrıldığını doğrular (gerçek Google/hCaptcha ağ isteği YAPILMAZ — bu paket sadece ENTEGRASYON KATMANINI test eder, üçüncü parti servisin kendisini değil).
