# @mari-ui/cli

[mari-ui](https://github.com/aykutyilmaz37/mari-ui) tasarım sistemini bir projeye kurar, projenin temasını üretir ve AI kod asistanları (Claude Code, Codex, Cursor, Gemini, GitHub Copilot) için **kütüphanenin gerçek prop sözleşmesinden** üretilmiş kural dosyalarını güncel tutar.

## Hızlı başlangıç

```bash
npx @mari-ui/cli init --persona minimal
pnpm install
npx @mari-ui/cli sync
```

`init`; `@mari-ui/components`, `@mari-ui/core` ve `@mari-ui/tokens`ı `package.json`a ekler, `mari-ui.config.json`ı oluşturur, AI kural dosyalarını yazar ve projenize uygun CSS girişini (Tailwind v4'lü ya da Tailwind'siz) söyler. Paket yöneticisini kendisi çalıştırmaz; kurulumdan sonra `sync` kuralları yüklenen sürüme göre tazeler.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `init` | Bağımlılıkları ekler, `mari-ui.config.json` oluşturur (varsa dokunmaz), AI kural dosyalarını yazar. |
| `sync` | Kural dosyalarını güncel tema ve kütüphane sürümüne göre tazeler. Temayı değiştirdiyseniz ayrıca `theme` çalıştırın. |
| `theme` | `mari-ui.config.json`dan `mari-ui-theme.css` (CSS değişkenleri) ve `mari-ui-theme.ts` (React Native / koddan erişim) üretir. |

| Bayrak | |
|---|---|
| `--dir <yol>` | Hedef proje kökü (varsayılan: bulunulan dizin) |
| `--agents <liste>` | `claude,codex,cursor,gemini,copilot` (varsayılan: hepsi) |
| `--check` | Hiçbir şey yazmaz; dosyalar bayatsa çıkış kodu `1` — CI için |
| `--persona <ad>` | `init`: tasarım kişiliği — `corporate` (Kurumsal), `playful` (Oyunbaz), `minimal`, `editorial` (Editoryal), `luxury` (Lüks) |

## Tema: `mari-ui.config.json`

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
- Uzun **sayfa kurma rehberi** (uygulama iskeleti, sayfa kalıpları, "hangi durumda hangi component", tasarım brief'i) Claude skill'ine (`.claude/skills/mari-ui/SKILL.md`) girer.
- `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi paylaşılan dosyalarda yalnız `<!-- mari-ui:start -->` / `<!-- mari-ui:end -->` arası değişir; kendi içeriğiniz korunur.

CI'da kuralların güncel kaldığını denetlemek için: `npx @mari-ui/cli sync --check`.

Lisans: MIT.
