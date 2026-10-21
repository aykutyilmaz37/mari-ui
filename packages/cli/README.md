# @mari-ui/cli

[mari-ui](https://github.com/aykutyilmaz37/mari-ui) tasarım sistemini bir projeye kurar, projenin temasını üretir ve AI kod asistanları (Claude Code, Codex, Cursor, Gemini, GitHub Copilot) için **kütüphanenin gerçek prop sözleşmesinden** üretilmiş kural dosyalarını güncel tutar.

## Hızlı başlangıç

```bash
npx @mari-ui/cli init      # platformu (web / native / ikisi) ve temayı sorar
pnpm install
npx @mari-ui/cli sync
npx @mari-ui/cli theme     # tema dosyalarını üretir (temayı değiştirmek için de bu)
```

`init`; seçilen platformun paketlerini `package.json`a ekler (aşağıdaki tablo), `mari-ui.config.json`ı oluşturur, AI kural dosyalarını yazar ve web'de projenize uygun CSS girişini (Tailwind v4'lü ya da Tailwind'siz) söyler. Paket yöneticisini kendisi çalıştırmaz; kurulumdan sonra `sync` kuralları yüklenen sürüme göre tazeler.

## Platform seçimi

`init` önce platformu sorar; sorulamıyorsa (CI, `--yes`) `mari-ui.config.json`daki `platform`, o da yoksa `package.json` tahmini kullanılır (`react-native`/`expo` → `native`, yoksa `web`; `both` tahmin edilmez). Seçim config'e `platform` olarak yazılır.

| Platform | Komut | Eklenen paketler |
|---|---|---|
| Web | `init --platform web` | `@mari-ui/components`, `@mari-ui/core`, `@mari-ui/tokens` |
| Mobil (React Native / Expo) | `init --platform native` | `@mari-ui/native`, `@mari-ui/core`, `@mari-ui/tokens` |
| İkisi (tek `package.json`) | `init --platform both` | ikisi + `@mari-ui/core`, `@mari-ui/tokens` |

Seçilmeyen platformun paketi eklenmez; kurulu yabancı mari-ui paketi uyarılır (silinmez). Native'de `theme` CSS üretmez. Ayrı web ve mobil uygulamaları olan monorepo'da her uygulamayı kendi klasöründe kurun: `init --platform web --dir apps/web`, `init --platform native --dir apps/mobile`.

Karar tablosu, yazılan dosyalar ve yanlış kurulumu düzeltme: [docs/kurulum-platformlar.md](https://github.com/aykutyilmaz37/mari-ui/blob/main/docs/kurulum-platformlar.md).

## Komutlar

| Komut | Ne yapar |
|---|---|
| `init` | Bağımlılıkları ekler, `mari-ui.config.json` oluşturur (varsa dokunmaz), AI kural dosyalarını yazar. |
| `sync` | Kural dosyalarını güncel tema ve kütüphane sürümüne göre tazeler. Temayı değiştirdiyseniz ayrıca `theme` çalıştırın. |
| `theme` | Temayı sorar (aşağıda), `mari-ui.config.json`ı günceller ve `mari-ui-theme.css` (CSS değişkenleri) ile `mari-ui-theme.ts`i (React Native / koddan erişim) üretir. |

| Bayrak | |
|---|---|
| `--dir <yol>` | Hedef proje kökü (varsayılan: bulunulan dizin) |
| `--platform <ad>` | `web`, `native` ya da `both` — `init`te sorulmaz |
| `--manifest <yol>` | Manifest dosyası (varsayılan: kurulu paketten; `both`ta web manifest'i) |
| `--native-manifest <yol>` | `both`ta `@mari-ui/native` manifest'i |
| `--agents <liste>` | `claude,codex,cursor,gemini,copilot` (varsayılan: hepsi) |
| `--check` | Hiçbir şey yazmaz; dosyalar bayatsa çıkış kodu `1` — CI için |
| `--persona <ad>` | `default` (Yumuşak iris) ya da kişilik: `corporate` (Kurumsal), `playful` (Oyunbaz), `minimal`, `editorial` (Editoryal), `luxury` (Lüks) |
| `--primary <#hex>` / `--accent <#hex>` | Özel tema: marka ve vurgu rengi |
| `-y`, `--yes` | Soru sorma: bayraklar ya da mevcut `mari-ui.config.json` |

## Tema seçimi

`npx @mari-ui/cli theme` önce temayı sorar (ok tuşları + Enter):

- **Mevcut ayarı koru** — config zaten varsa.
- **Varsayılan (Yumuşak iris)** — mari-ui'ın kendi teması.
- **Kurumsal, Oyunbaz, Minimal, Editoryal, Lüks** — renk, font, köşe, boşluk, gölge ve hareketi birlikte seçen hazır kişilikler.
- **Özel** — birincil renk, vurgu rengi (isteğe bağlı), köşe yuvarlaklığı ve yoğunluk sorulur.

Seçim config'in tema alanlarını baştan yazar; ek temalar (`themes`) ve büyük ekran ayarı (`scale`) korunur. Soru yalnız etkileşimli terminalde sorulur; CI'da ve AI ajanlarında bayraklar ya da mevcut config kullanılır:

```bash
npx @mari-ui/cli theme --persona minimal
npx @mari-ui/cli theme --primary "#0f766e" --accent "#f59e0b"
npx @mari-ui/cli theme --yes          # mevcut config'ten yeniden üret
```

## `mari-ui.config.json`

```json
{
  "persona": "playful",
  "color": { "primary": "#0f766e" },
  "themes": { "marka-koyu": { "base": "dark", "color": { "primary": "#facc15" } } }
}
```

```bash
npx @mari-ui/cli theme
```

Kişilik taban olur, yazdığınız her alan onu ezer. `themes` altındaki her ek tema `[data-theme="<ad>"]` ile seçilir. Üretilen `mari-ui-theme.css`i mari-ui CSS'inden **sonra** import edin. Kişiliğin Google Fonts bağlantısı komut çıktısında yazılır. Değerleri görerek seçmek için repodaki tema stüdyosu (`apps/studio`) aynı dosyayı dışa aktarır.

## AI kuralları

Kurallar elle yazılmaz: kütüphanenin derlenmiş manifest'inden (component'ler, gerçek prop'lar, renk/boyut/variant eksenleri) ve projenizin çözümlenmiş temasından üretilir. Böylece asistan var olmayan bir prop'u ya da sabit bir rengi önermez.

- Kısa **kesin kurallar** (önce mari-ui component'i, sabit renk/px yok, yüklenmede `skeleton`, erişilebilirlik…) tüm araçların dosyasına girer.
- Uzun **sayfa kurma rehberi** (uygulama iskeleti, sayfa kalıpları, "hangi durumda hangi component", tasarım brief'i) Claude skill'ine girer: web'de `.claude/skills/mari-ui/SKILL.md`, native'de `.claude/skills/mari-ui-native/SKILL.md`, `both`ta `mari-ui-web` ve `mari-ui-native`.
- `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi paylaşılan dosyalarda yalnız `<!-- mari-ui:start -->` / `<!-- mari-ui:end -->` arası değişir; kendi içeriğiniz korunur.

CI'da kuralların güncel kaldığını denetlemek için: `npx @mari-ui/cli sync --check`.

Lisans: MIT.
