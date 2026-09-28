# Erişilebilirlik (a11y) disiplini — Faz 9

Bu proje üç KATMANLI bir erişilebilirlik güvenlik ağı kullanır — hiçbiri tek başına yeterli değil, üçü birlikte hem derleme zamanında hem çalışma zamanında hem de gözle denetlemeyi kapsıyor:

| Katman | Araç | Ne zaman çalışır | Ne yakalar |
|---|---|---|---|
| 1. Statik analiz | `eslint-plugin-jsx-a11y` (`@mari-ui/eslint-config/react`, sadece web) | `pnpm lint`, her push/PR'da CI'da (Faz 8) | Eksik `alt`, geçersiz ARIA rolü/attribute, klavyeyle erişilemeyen interaktif element, `autoFocus` kötüye kullanımı, ... |
| 2. Otomatik çalışma zamanı denetimi | `axe-core` (doğrudan, `src/testUtils/a11y.ts`) | `pnpm test` (vitest/jsdom), CI'da | ARIA ilişkileri, rol/isim hesaplaması, focus-able olmayan interaktif elementler — component GERÇEKTEN render edilmiş haliyle |
| 3. Görsel/manuel denetim | `@storybook/addon-a11y` (Faz 4) | Storybook'u açıp gözle bakınca | Renk kontrastı (jsdom'da çalışmayan tek şey — bkz. aşağıda), gerçek tarayıcı düzeni, ekran okuyucu ile fiili deneyim |

**Neden üçü birden**: 2. katman olmadan 1. katman sadece JSX'in KENDİSİNE bakar — `role="none"` gibi "teknik olarak geçerli ama semantik olarak yanlış" bir kaçamak, statik kural setini kolayca atlatabilir (fiilen `Modal`de böyle oldu, bkz. aşağıda). 3. katman olmadan RENK KONTRASTI hiç denetlenmez (jsdom piksel render etmiyor). Storybook'un addon-a11y'si otomatik ÇALIŞTIRILMADIĞI (birinin Storybook'u AÇIP bakması gerektiği) için CI'a bağlı DEĞİL — bu, sadece 3. katmana güvenmenin neden yetmediğinin kanıtı.

## Faz 9'da fiilen bulunup düzeltilen gerçek hatalar

- **`Card`**: `onClick` verilen bir `<div>` klavyeyle hiç etkinleştirilemiyordu (rol yok, `tabIndex` yok, `onKeyDown` yok). `jsx-a11y/click-events-have-key-events` + `no-static-element-interactions` tarafından yakalandı → `role="button"` + `tabIndex={0}` + Enter/Space desteği eklendi.
- **`Modal`**: ÜÇ gerçek hata birden — (1) `role="none"` diyalog semantiğini TAMAMEN siliyordu (doğru çözüm `role="dialog"` + `aria-modal` + `aria-labelledby`), (2) `open=false` iken component DOM'da kalmaya devam ettiği için içindeki butonlar klavye Tab'ıyla hâlâ erişilebiliyordu (`inert` eklendi), (3) açılınca odak içeri taşınmıyor, Escape'e basınca kapanmıyordu (`useEffect` ile focus-in/focus-restore + Escape dinleyicisi eklendi — bu component ilk kez hook kullanmaya başladığı için `"use client"` eklendi). Detay için `packages/components/src/modal/Modal.tsx`teki JSDoc'a bakın. jsdom `inert`i UYGULAMADIĞI için (`element.inert` bile `undefined` dönüyor — fiilen doğrulandı) `inert`in gerçek odak-engelleme davranışı Storybook'ta GERÇEK bir tarayıcıda ayrıca doğrulandı: Escape'e basınca `inert` ekleniyor, overlay içindeki bir butona PROGRAMATİK `.focus()` çağrısı bile başarısız kalıyor, odak tetikleyici butonda kalıyor.
- **`Checkbox`/`Radio`**: `autoFocus` pass-through prop'u `jsx-a11y/no-autofocus`ı tetikledi — bu GERÇEK bir hata değildi (kütüphane autofocus'u ZORLAMIYOR, tüketicinin verdiği prop'u iletiyor), gerekçeli `eslint-disable` ile işaretlendi.

## Yeni component yazarken / mevcut birini gözden geçirirken checklist

Bu checklist Faz 13'ün (backlog madde 18 — component bazlı detaylı gözden geçirme) her turunda uygulanmalı:

1. **Rol doğru mu?** `role="none"`/`role="presentation"` bir kaçamak DEĞİL — gerçekten "bu elementin semantiği yok" anlamına gelmeli. İnteraktif bir şey her zaman gerçek bir interaktif rol (`button`, `link`, `dialog`, ...) taşımalı.
2. **Klavye ile HER ŞEY yapılabiliyor mu?** Fare/dokunma ile yapılan her eylemin bir klavye eşdeğeri olmalı (Enter/Space aktivasyon, Escape kapama, ok tuşlarıyla gezinme — liste/menü/sekme gibi bileşik yapılarda).
3. **Focus yönetimi.** Bir overlay (modal/drawer/dropdown) açılınca odak içeri taşınmalı, kapanınca TETİKLEYEN elemana geri dönmeli. Kapalı/gizli içerik `inert` (veya DOM'dan tamamen kaldırma) ile klavye erişiminden çıkarılmalı.
4. **Kontrast.** Zaten otomatik — `@mari-ui/tokens`ın `deriveColorRole`i her renk/foreground çiftini WCAG AA'ya göre hesaplıyor (Faz 1). Yeni bir renk YOLU eklerseniz (örn. yeni bir sabit renk), bu otomasyonu atlamayın.
5. **`pnpm lint` VE `pnpm test` ikisi de temiz olmalı** — biri diğerinin yakalayamadığını yakalıyor (bkz. yukarıdaki tablo).
6. **Yeni bir interaktif component için axe testi ekleyin** — `src/testUtils/a11y.ts`teki `getA11yViolations(container)`ı kullanın, hem "varsayılan" hem "en karmaşık gerçek kullanım" (örn. bir modal için hem açık hem kapalı) durumunu test edin.

## Bilinen sınırlama

`axe-core`nin `color-contrast` kuralı jsdom'da (gerçek piksel render'ı olmadığı için) ÇALIŞTIRILAMIYOR — `src/testUtils/a11y.ts`te bilinçli olarak devre dışı. Bu eksik değil: kontrast garantisi zaten Faz 1'in matematiksel otomasyonundan geliyor (bkz. `packages/tokens/src/contrast.ts`). `axe-core`nin GERÇEK tarayıcıda çalışan versiyonu (Storybook'un addon-a11y'si) bunu ayrıca doğrular.
