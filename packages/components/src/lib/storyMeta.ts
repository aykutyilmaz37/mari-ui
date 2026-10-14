/**
 * Faz 13 (madde 18 — tasarım geçişi): Storybook düzeni ant.design/components
 * yapısına oturtuldu. Her component sayfası aynı iskelete sahip olsun diye
 * bu iki helper kullanılır:
 *
 *  - `componentDoc({...})` → autodocs sayfasının component açıklaması:
 *    özet + **Ne Zaman Kullanılır** / **Ne Zaman Kullanılmaz** madde listeleri
 *    (ant'ın "When To Use" bölümü) + **Erişilebilirlik** notu. Tek markdown
 *    string döndürür; `parameters.docs.description.component`'e verilir.
 *  - `storyDoc("...")` → tek bir story'nin autodocs açıklaması (ant'ın her
 *    demo'sunun altındaki paragraf).
 *
 * NEDEN helper bir `Meta` OBJESİ değil de string döndürüyor: Storybook'un
 * statik CSF indeksleyicisi `export default`'un başlatıcısının bir
 * **ObjectExpression** olmasını şart koşuyor — `export default makeMeta({...})`
 * "default export must be an object" hatası veriyor. Bu yüzden `title`,
 * `component`, `tags` her stories dosyasında düz obje literali olarak kalır;
 * helper sadece tekrar eden markdown'ı üretir.
 *
 * `title` → `<Kategori>/<Ad>` (sidebar Genel / Navigasyon / Veri Girişi /
 * Veri Gösterimi / Geri Bildirim gruplarına düşer — `preview.tsx` storySort).
 *
 * Sadece `.stories.tsx`'ten import edilir — dist'e girmez (storybookArgTypes.ts
 * ile aynı gerekçe).
 */

export const STORY_CATEGORIES = [
  "Genel",
  "Navigasyon",
  "Veri Girişi",
  "Veri Gösterimi",
  "Geri Bildirim",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

interface ComponentDocInput {
  /** Tek-iki cümlelik tanım — ne işe yarar. Markdown desteklenir. */
  summary: string;
  /** "Ne Zaman Kullanılır" maddeleri. */
  whenToUse?: string[];
  /** "Ne Zaman Kullanılmaz" maddeleri — hangi durumda başka bir component tercih edilmeli. */
  whenNotToUse?: string[];
  /** Erişilebilirlik notu (klavye, ARIA, odak). */
  a11y?: string;
}

function bulletList(heading: string, items?: string[]): string {
  if (!items || items.length === 0) return "";
  const bullets = items.map((i) => "- " + i).join("\n");
  return `\n\n### ${heading}\n\n${bullets}`;
}

/** ant düzeninde bir component autodocs açıklaması üretir. */
export function componentDoc(input: ComponentDocInput): string {
  return (
    input.summary +
    bulletList("Ne Zaman Kullanılır", input.whenToUse) +
    bulletList("Ne Zaman Kullanılmaz", input.whenNotToUse) +
    (input.a11y ? `\n\n### Erişilebilirlik\n\n${input.a11y}` : "")
  );
}

/**
 * Faz 21 — Playground gibi argümanla değişen story'ler için kodu argümandan üreten
 * fonksiyon. Storybook'un kendi JSX dökümü ref'leri `[Circular]`, ikon/loader gibi
 * fonksiyonları `() => {}` diye basıyordu; bu fonksiyon `source.transform`a bağlanır,
 * kod o anki argümanlarla temiz yazılır.
 */
export type StoryCode = (args: Record<string, unknown>) => string;

function literal(value: unknown, indent: string): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => literal(v, indent)).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined && typeof v !== "function");
    const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
    const fields = entries.map(([k, v]) => key(k) + ": " + literal(v, indent));
    return "{ " + fields.join(", ") + " }";
  }
  return String(value);
}

/**
 * Argümanları JSX prop dizisine çevirir: `true` → `ad`, `false`/`undefined`/fonksiyon
 * atlanır, metin → `ad="…"`, diğerleri → `ad={…}`. `skip` ile elle yazılacak
 * prop'lar (ikon, handler, ref) çıkarılır; `defaults` ile varsayılana eşit değerler gizlenir.
 */
function propString(key: string, value: unknown): string {
  if (value === true) return key;
  if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
  return `${key}={${literal(value, "")}}`;
}

export function jsxProps(args: Record<string, unknown>, { skip = [], defaults = {} }: { skip?: string[]; defaults?: Record<string, unknown> } = {}): string {
  return Object.entries(args)
    .filter(([key, value]) => !skip.includes(key) && key !== "children" && value !== undefined && value !== false && typeof value !== "function" && !(key in defaults && defaults[key] === value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => propString(key, value))
    .join(" ");
}

/**
 * Tek bir story'nin autodocs açıklaması (ant'ın her demo'sunun altındaki
 * başlık + paragraf). `export const Foo: Story = { ...storyDoc("...") }`.
 */
function sourceOf(code: string | StoryCode | undefined) {
  if (typeof code === "function") return { source: { language: "tsx", transform: (_src: string, ctx: { args: Record<string, unknown> }) => code(ctx.args).trim() } };
  return code ? { source: { code: code.trim(), language: "tsx" } } : {};
}

export function storyDoc(
  description: string,
  code?: string | StoryCode
): { parameters: { docs: { description: { story: string }; source?: { code?: string; language: string; transform?: (src: string, ctx: { args: Record<string, unknown> }) => string } } } } {
  return {
    parameters: {
      docs: {
        description: { story: description },
        ...sourceOf(code),
      },
    },
  };
}

/**
 * Faz 13.5 kullanıcı bulgusu: bir story `render: () => <HelperComponent />`
 * gibi harici, adlandırılmış bir yardımcı component'e yönlendirirse,
 * Storybook'un "Show code" paneli JSX'i statik olarak açamayıp ham CSF story
 * nesnesini (`{ name: "...", ...storyDoc(...), render: () => <HelperComponent
 * /> }`) olduğu gibi basıyor — tüketiciye component'i NASIL KULLANACAĞINI
 * değil, bizim iç test/hikaye iskeletimizi gösteriyor. Bu yüzden interaktif
 * story'lerde `useState` gibi hook'lar `render` callback'inin İÇİNE inline
 * yazılmalı, ayrı bir isimlendirilmiş component'e ÇIKARILMAMALI.
 *
 * Faz 13.6 kullanıcı bulgusu: inline `render` de YETMİYOR — Storybook 8,
 * özel `render`'lı her story'de dinamik JSX üretemeyip yine ham CSF nesnesini
 * basıyor. Bu yüzden `storyDoc`'un ikinci argümanıyla kopyalanabilir kod
 * parçası AÇIKÇA verilir: `...storyDoc("açıklama", \`<Foo ... />\`)`
 * (bkz. `pagination/Pagination.stories.tsx`). `render`'sız, sadece `args`
 * kullanan story'lerde (Playground) buna gerek yok — orada dinamik JSX çalışır.
 */
