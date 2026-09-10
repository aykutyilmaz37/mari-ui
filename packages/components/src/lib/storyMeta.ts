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
 * Tek bir story'nin autodocs açıklaması (ant'ın her demo'sunun altındaki
 * başlık + paragraf). `export const Foo: Story = { ...storyDoc("...") }`.
 */
export function storyDoc(description: string): { parameters: { docs: { description: { story: string } } } } {
  return { parameters: { docs: { description: { story: description } } } };
}
