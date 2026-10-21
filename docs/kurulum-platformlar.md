# mari-ui kurulumu: web / native / ikisi

> **AI ajanı için:** mari-ui'ı bir projeye kurmadan ya da kural dosyalarına güvenmeden önce bu dosyayı oku. Karar tablosundaki komutu çalıştır, "Yasaklar" bölümünü çiğneme. Davranış `@mari-ui/cli` kaynağından (`packages/cli/src/platform.ts`, `init.ts`, `sync.ts`, `writers/`) doğrulanmıştır.

## Karar tablosu

| Projende ne var | Komut | `package.json`a eklenen paketler | Yazılan kural dosyaları |
|---|---|---|---|
| Web uygulaması (React, Next.js, Vite) | `npx @mari-ui/cli init --platform web` | `@mari-ui/components`, `@mari-ui/core`, `@mari-ui/tokens` | `CLAUDE.md`, `.claude/skills/mari-ui/SKILL.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/mari-ui.mdc`, `.github/copilot-instructions.md` |
| Mobil uygulama (React Native / Expo) | `npx @mari-ui/cli init --platform native` | `@mari-ui/native`, `@mari-ui/core`, `@mari-ui/tokens` | `CLAUDE.md`, `.claude/skills/mari-ui-native/SKILL.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/mari-ui.mdc`, `.github/copilot-instructions.md` (içerik React Native kuralları) |
| Tek `package.json`da hem web hem mobil (ör. Expo + web) | `npx @mari-ui/cli init --platform both` | `@mari-ui/components`, `@mari-ui/native`, `@mari-ui/core`, `@mari-ui/tokens` | `CLAUDE.md` (iki bölüm), `.claude/skills/mari-ui-web/SKILL.md`, `.claude/skills/mari-ui-native/SKILL.md`, `AGENTS.md` ve `GEMINI.md` (iki bölüm), `.cursor/rules/mari-ui-web.mdc`, `.cursor/rules/mari-ui-native.mdc`, `.github/instructions/mari-ui-web.instructions.md`, `.github/instructions/mari-ui-native.instructions.md` |
| Ayrı web ve mobil uygulamaları olan monorepo | Her uygulama için ayrı: `npx @mari-ui/cli init --platform web --dir apps/web` ve `npx @mari-ui/cli init --platform native --dir apps/mobile` | Her uygulamaya yalnız kendi satırındaki paketler | Her uygulamanın klasörüne yalnız kendi platformunun dosyaları |

Notlar:

- `--platform` verilmezse etkileşimli terminalde sorulur. Sorulamıyorsa (CI, `--yes`, boru) önce `mari-ui.config.json`daki `platform`, o da yoksa `package.json` tahmini kullanılır: `react-native` ya da `expo` bağımlılığı varsa `native`, yoksa `web`. **`both` hiçbir zaman tahmin edilmez**, yalnız açıkça seçilir.
- `init` paketleri yalnız `package.json`a yazar, paket yöneticisini çalıştırmaz. Sonra: `pnpm install` (ya da npm/yarn), ardından `npx @mari-ui/cli sync`. Paket kurulu değilken kural dosyaları yazılmaz; `init` bunu uyarır.
- Seçim `mari-ui.config.json`a `"platform": "web" | "native" | "both"` olarak yazılır. `sync` ve `theme` platformu buradan okur.
- `native`te `theme` yalnız `mari-ui-theme.ts` üretir (CSS yok) ve Tailwind talimatı basılmaz.
- `--agents claude,cursor` ile yalnız seçili araçların dosyaları yazılır.
- `both`ta manifest yollarını elle vermek için: `--manifest <web manifest>` ve `--native-manifest <native manifest>`. Normalde gerekmez, kurulu paketlerden okunur.

## Yasaklar

1. **Native (React Native / Expo) projeye `@mari-ui/components` kurma.** O paket DOM ve Tailwind kullanır; mobilde çalışmaz. Mobilde `@mari-ui/native` kullanılır.
2. **Web kuralını mobil kodda kullanma.** Tailwind sınıfları, `<a href>` + `onNavigate`, CSS değişkenleri web kuralıdır. React Native dosyasında React Native kuralını uygula.
3. **Seçilmeyen platformun paketini ekleme.** `web` projeye `@mari-ui/native`, `native` projeye `@mari-ui/components` eklenmez. CLI de eklemez.
4. **Ayrı uygulamaları olan monorepo'da kökte `both` ile kurma.** Her uygulama kendi klasöründe `--dir` ile ayrı kurulur.

## "İkisi de" (`both`) ile ayrı uygulamalı monorepo farkı

- **`both`**: aynı paket (tek `package.json`) hem web hem mobil kod içeriyor. Kurallar iki set olarak yazılır; her bölümün başında "hangi dosyalar için" notu vardır. Asıl ayırıcı dosyanın import'larıdır: `react-native` / `@mari-ui/native` import eden dosya native, `@mari-ui/components` / `react-dom` kullanan dosya web.
- **Ayrı uygulamalar** (`apps/web`, `apps/mobile`): her uygulama tek platformludur. `both` kullanılmaz; her klasöre kendi `init --platform … --dir …` komutu.

### `both`ta Copilot sınırlaması

`both`ta Copilot dosyaları glob ile ayrılır:

- `.github/instructions/mari-ui-web.instructions.md` → `applyTo: "**/*.web.tsx"`
- `.github/instructions/mari-ui-native.instructions.md` → `applyTo: "**/*.native.tsx,**/*.ios.tsx,**/*.android.tsx"`

Platform uzantısı olmayan ortak `.tsx` dosyalarında (ör. `Button.tsx`) **Copilot bu dosyaların hiçbirini yüklemez.** Bu durumda `.github/copilot-instructions.md` de yazılmaz. Cursor'da glob aynıdır ama her `.mdc`nin `description`ı Cursor'ın ortak dosyada doğru kuralı seçmesine yardım eder. Claude, Codex ve Gemini iki bölümü birlikte okur.

## Yanlış kurulumu fark etme ve düzeltme

### Belirtiler

- Mobil projede `package.json`da `@mari-ui/components` var.
- Mobil projenin kural dosyalarında Tailwind sınıfları, `<a href>`, `mari-ui-theme.css` geçiyor.
- `mari-ui.config.json`da `platform` yok ya da yanlış.
- `init` çıktısında `⚠ Bu platforma ait olmayan paket kurulu: …` satırı.

### 1. CLI 0.4.0'dan kalan web dosyaları

CLI 0.4.0 platform ayırmıyordu; mobil projeye de web kurallarını yazdı. **Platform değişince CLI eski dosyaları silmez.** Sonradan `init --platform native` çalıştırınca şunlar olur:

- Aynı yolu kullanan dosyalarda mari-ui bloğu native içerikle değişir: `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.cursor/rules/mari-ui.mdc`, `.github/copilot-instructions.md`. Bunlar için elle bir şey yapmana gerek yok.
- Native'in kullanmadığı yol olduğu gibi kalır ve web kuralı taşımaya devam eder. **Elle sil:**
  - `.claude/skills/mari-ui/` (içinde `SKILL.md`; native'de skill `.claude/skills/mari-ui-native/SKILL.md`)

Ters yönde (`native` → `web`) elle silinecek: `.claude/skills/mari-ui-native/`.

Platform `both`a geçtiyse tek platform dosyaları yerine ikili dosyalar yazılır. Eski tek platform dosyalarını **elle sil:**

- `.claude/skills/mari-ui/` (yerine `mari-ui-web` ve `mari-ui-native`)
- `.cursor/rules/mari-ui.mdc` (yerine `mari-ui-web.mdc` ve `mari-ui-native.mdc`)
- `.github/copilot-instructions.md` içindeki mari-ui bloğu (yerine `.github/instructions/mari-ui-*.instructions.md`)

`both`tan tek platforma geçtiyse tersini sil:

- `.claude/skills/mari-ui-web/` ya da `.claude/skills/mari-ui-native/` (seçilmeyen platformunki; web'e dönüldüyse ikisi de, çünkü web skill'i `.claude/skills/mari-ui/` yolunda)
- `.cursor/rules/mari-ui-web.mdc`, `.cursor/rules/mari-ui-native.mdc`
- `.github/instructions/mari-ui-web.instructions.md`, `.github/instructions/mari-ui-native.instructions.md`

**Paylaşılan dosyalarda yalnız bloğu sil.** `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.github/copilot-instructions.md` kullanıcının kendi içeriğini de taşıyabilir. mari-ui yalnız şu iki satır arasını yönetir:

```md
<!-- mari-ui:start -->
…
<!-- mari-ui:end -->
```

Dosyada bu bloğun dışında içerik varsa dosyayı silme; yalnız iki marker dahil bloğu sil. Dosyada blok dışında hiçbir şey yoksa dosyanın tamamı silinebilir.

Temizlikten sonra:

```bash
npx @mari-ui/cli sync
npx @mari-ui/cli sync --check
```

### 2. Yabancı paket

`init`, platforma ait olmayan kurulu mari-ui paketini **kaldırmaz, yalnız uyarır**:

```text
⚠ Bu platforma ait olmayan paket kurulu: @mari-ui/components — gerekmiyorsa kaldırın (ör. pnpm remove @mari-ui/components).
```

Kodda o paketten import yoksa kaldır:

```bash
pnpm remove @mari-ui/components
```

Web projesinde yabancı paket `@mari-ui/native`dir (`pnpm remove @mari-ui/native`). `both`ta yabancı paket yoktur. npm ya da yarn kullanılıyorsa: `npm uninstall …` / `yarn remove …`.

### 3. `platform` alanını değiştirme

İki yol var:

- Komutla (önerilen): `npx @mari-ui/cli init --platform native` (gerekirse `--dir apps/mobile`). `platform` alanını yazar, eksik paketleri `package.json`a ekler, kuralları yeniden yazar. Var olan tema alanlarına dokunmaz.
- Elle: `mari-ui.config.json`da `"platform": "native"` yap, eksik paketi kur, sonra `npx @mari-ui/cli sync` çalıştır.

```json
{
  "platform": "native",
  "persona": "minimal"
}
```

Her iki yolda da eski dosyaları yukarıdaki listeye göre elle temizle. `sync`, config'teki platformun paketi kurulu değilse açık bir hata verir ve yanlış platformun kuralını yazmaz.
