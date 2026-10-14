# @mari-ui/modules (iskelet — henüz kod yok)

Hazır sayfa modülleri (giriş, sepet, ödeme, panel…) için ayrılmış yer. Modüller ilk gerçek uygulamanın ihtiyacına göre yazılacak; veri ve aksiyonlar uygulamanın verdiği **adaptörlerle** bağlanacak (kütüphanede fetch/URL yok, Storybook ve testler için mock adaptörler).

Bu klasörde `package.json` yok; `pnpm-workspace.yaml` onu görmezden gelir, build ve testler etkilenmez.

## Aday modüller

`about`, `auth/{create-password,forgot-password,login,otp,register}`, `basket`, `blog`, `checkout`, `contact`, `dashboard`, `error`, `faq`, `filters`, `home`, `landing`, `list`, `portfolio`, `pricing`, `products`, `profile`, `reports`, `services`, `standard`, `team`, `testimonials`.

## İlkeler

- `@mari-ui/components` üzerine kurulur; kendi stil sistemi yok.
- Her modül birkaç **düzen varyantı** taşıyabilir (ör. giriş: ortada kart / iki kolon + görsel); mantık ve adaptör aynı kalır.
- React Native karşılıkları ayrı bir pakette ele alınır.
