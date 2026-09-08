# @mari-ui/modules (henüz yok — sadece klasör iskeleti)

Bu klasör, Faz 0'da (monorepo dönüşümünün başında) silinen `src/components/modules/**` scaffolding'inin (26 boş dosya, commit `97de61f`) YENİ konumdaki karşılığı — aynı 26 modül adı korunarak `.gitkeep` ile geri getirildi ki kapsam unutulmasın.

## Durum

**Faz 12 (backlog madde 11) bilinçli olarak DURDURULDU** — kullanıcının kendi kararı: modüllerin **parametrik veri/aksiyon sözleşmesi** (`onLogin`, `dataSource`, `endpoints` gibi prop'lar/adapter'lar üzerinden) kullanıcının kendi geliştireceği backend'in tasarımıyla birlikte netleşecek; backend henüz yok. Bu ayrıca madde 15'teki (bu monorepo'ya bir NestJS backend eklenip eklenmeyeceği — henüz karar değil, tartışma konusu) sonucuyla da kesişiyor. Bkz. proje planındaki Faz 12 notu.

Bu yüzden burada **sadece klasör yapısı** var — hiçbir kod, `package.json`, veya build altyapısı YOK. `pnpm-workspace.yaml`'ın `packages/*` glob'u bu dizini bir `package.json` bulamadığı için görmezden gelir; `pnpm install`/`turbo run` bundan etkilenmez.

## Modüller (orijinal 26 — Faz 0'dan aynen korundu)

`about`, `auth/{create-password,forgot-password,login,otp,register}`, `basket`, `blog`, `checkout`, `contact`, `dashboard`, `error`, `faq`, `filters`, `home`, `landing`, `list`, `portfolio`, `pricing`, `products`, `profile`, `reports`, `services`, `standard`, `team`, `testimonials`.

## Faz 12 başladığında hatırlanması gerekenler

- Backend'in parametrik sözleşmesi netleşmeden gerçek kod yazılmayacak (bkz. plan backlog madde 11: "modüller sabit bir API şekline değil, parametrik bir veri/aksiyon arayüzüne bağlı olacak").
- Sadece web için (mobile/RN karşılığı ayrı, daha sonraki bir faz).
- `@mari-ui/components`in (Faz 3, stabil) üzerine kurulacak.
