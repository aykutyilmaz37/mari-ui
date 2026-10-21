# Plan: CLI'da web / native ayrımı

Durum: Faz A–D tamamlandı (2026-10-21).

## Sorun

`@mari-ui/cli` 0.4.0 platform ayrımı yapmıyor:

- `init` her projeye `@mari-ui/components` + `core` + `tokens` ekliyor (`packages/cli/src/init.ts`). Expo/RN projesi de web paketini alıyor, `@mari-ui/native` hiç eklenmiyor.
- `sync` kural içeriğini her zaman `@mari-ui/components/manifest.json`'dan üretiyor. Mobil projede de Tailwind sınıfları, `<a href>`, `"use client"` notları olan web kuralları yazılıyor. Bu, React Native kodu yazan ajanı yanıltıyor.
- `@mari-ui/native` için manifest yok, yani native kural içeriğinin bir kaynağı da yok.

Paketler birbirini çekmiyor: `components` ve `native` yalnız `core` + `tokens`'a bağlı. Karışma sadece `init`'ten geliyor.

## Hedef

1. Kurulumda platform sorulur: **web**, **native** ya da **ikisi**.
2. Yalnız biri seçilirse diğerinin paketi hiç eklenmez.
3. AI kuralları platforma göre ayrı yazılır. İçerik, kurulu paketin manifest'inden gelir: web → `@mari-ui/components`, native → `@mari-ui/native`.
4. Doğru kurulumu anlatan bir doküman yazılır. Bu dokümanı en çok AI ajanları okuyacak.

## Kararlar

- **Platform seçimi.** `init` etkileşimli terminalde sorar. Bayrak: `--platform web|native|both`. Sorulamıyorsa (CI, `--yes`) önce bayrağa bakılır, sonra `package.json`'dan tahmin edilir (`react-native`/`expo` → native, yoksa web). Seçim `mari-ui.config.json`'a `platform` alanı olarak yazılır. `sync` ve `theme` bu alanı okur, tekrar sormaz.
- **Paketler:**
  - web → `@mari-ui/components`, `@mari-ui/core`, `@mari-ui/tokens`
  - native → `@mari-ui/native`, `@mari-ui/core`, `@mari-ui/tokens`
  - both → dördü birden. Bu seçenek, tek `package.json`'da iki platformu da hedefleyen projeler (ör. Expo + web) için.
- **Monorepo (ayrı web ve mobil uygulamalar).** Her uygulamada ayrı çalıştırılır: `--dir apps/web`, `--dir apps/mobile`. Kural dosyaları o klasöre yazılır. Claude, Codex ve Gemini klasördeki iç içe dosyayı okur, böylece mobil kodda native kuralları görürler.
- **`both` iken kurallar.** İki gövde de üretilir. Cursor `.mdc` ve Copilot `applyTo` glob ile ayrılabilir. Claude'da iki ayrı skill olur (`mari-ui-web`, `mari-ui-native`). Tek dosyalı araçlarda (AGENTS.md, GEMINI.md) iki bölüm alt alta yazılır, her bölümün başında açık bir "hangi dosyalar için" notu bulunur.
- **Uyumsuz kurulum.** Config `native` diyor ama `@mari-ui/native` kurulu değilse `sync` açık bir hata verir. Hiçbir durumda yanlış platformun kuralları yazılmaz.
- **Native'de tema.** `theme`, native'de CSS dosyası ve Tailwind talimatı üretmez; yalnız `mari-ui-theme.ts` üretir. Web font `<link>` önerisi de native'de gösterilmez.

## Fazlar

Her faz kendi branch'inde, güncel `main`'den açılır. Her faz sonunda durulur.

### Faz A: Platform seçimi ve kurulum

- `ThemeChoice`'a benzer bir `PlatformChoice` eklenir: sihirbaz sorusu, `--platform` bayrağı ve `package.json` tahmini.
- `mari-ui.config.json` şemasına `platform` alanı eklenir (`packages/cli/src/configFile.ts`).
- `init.ts`: bağımlılık listesi platforma göre seçilir.
- `cli.ts`: Tailwind ve CSS talimatları yalnız web/both'ta gösterilir.
- `sync`: platform native ise ve native içerik henüz yoksa web kuralı **yazılmaz**, uyarı verilir. Bu, Faz C'ye kadar geçici bir korumadır.
- Testler: üç platform için `init` bağımlılıkları; native projede `sync`'in web dosyası yazmadığı.

### Faz B: Native manifest

- `packages/native/scripts/build-manifest.ts`, web'deki `packages/components/scripts/build-manifest.ts` ile aynı şemada çalışır: component, `importPath` (`@mari-ui/native/<subpath>`), props ve eksenler. `requiresUseClient` native'de yok ya da hep `false`.
- `dist/manifest.json` olarak çıkar ve `exports` içine `./manifest.json` eklenir.
- Build'e bağlanır. Testler: her subpath entry'sinin manifest'te olduğu.

### Faz C: Native kural içeriği

- `buildRulesContent.ts` ikiye ayrılır: ortak kısım (tema token tablosu, kişilik, eksenler) ve platforma özel kısım.
- Native için elle yazılan içerik:
  - Kesin kurallar: `StyleSheet` + token objesi; `className`/Tailwind yok; `onPress`; `accessibilityRole` / `accessibilityLabel`; link yerine navigasyon.
  - Native anti-pattern'ler: ham hex/px, `View` içinde çıplak metin, web paketinden import.
  - Serbest alanlar ve native skill rehberi (`skillGuide.ts`'in native karşılığı).
- `manifest.ts` platforma göre doğru paketin manifest'ini yükler.
- Yazıcılar (`writers/*`) `both` durumunda ikili çıktıyı üretir.
- Uçtan uca deneme: sahte monorepo'da `apps/web` ve `apps/mobile`'da ayrı `sync`; ayrıca tek pakette `both`.

### Faz D: Doküman

- `packages/cli/README.md` güncellenir: platform seçimi, paket tablosu, monorepo kullanımı.
- Yeni `docs/kurulum-platformlar.md` yazılır. Önce AI ajanları için yazılır, insan için de okunur:
  - Karar tablosu: "projende ne var → hangi komut → hangi paketler → hangi kural dosyaları".
  - Yasaklar: native projeye `@mari-ui/components` kurma; web kuralını mobilde kullanma.
  - Yanlış kurulumu fark etme ve düzeltme adımları.
- Storybook'taki `AiKurallari.mdx` aynı bilgiyle güncellenir.
- Changeset (minor): config'e `platform` alanı geliyor. Mevcut config'lerde alan yoksa `package.json` tahmini kullanılır, yani mevcut projeler bozulmaz.

## Açık sorular

- Native'de tema kişiliği fontları nasıl yüklenecek (`expo-font`)? Kural metninde sadece belirtilecek mi, yoksa CLI bir talimat mı basacak?
- `core` paketinin `clsx` / `tailwind-merge` bağımlılıkları native'de gereksiz. Ayrı bir iş olarak ele alınabilir.
- `toPx` `@mari-ui/native`'den export edilmeli mi? Native rehber şu an projeye bir `px()` yardımcısı yazdırıyor.
- Platform değişince bayat kural dosyaları (ör. native'e geçince `.claude/skills/mari-ui/`) için CLI uyarı versin mi? Şu an dosyalar silinmiyor ve uyarılmıyor; elle temizlik `docs/kurulum-platformlar.md`de.
