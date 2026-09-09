import type { Meta } from "@storybook/react";

/**
 * Faz 13 (madde 18 — tasarım geçişi): Storybook düzeni ant.design/components
 * yapısına oturtuldu. Her component sayfası aynı iskelete sahip olsun diye
 * `makeMeta` bunu tek yerden zorlar:
 *
 *  - `title` → `<Kategori>/<Ad>` (sidebar Genel / Navigasyon / Veri Girişi /
 *    Veri Gösterimi / Geri Bildirim gruplarına düşer — `preview.tsx` storySort).
 *  - autodocs sayfası: özet + **Ne Zaman Kullanılır** / **Ne Zaman Kullanılmaz**
 *    madde listeleri (ant'ın "When To Use" bölümü).
 *  - `Playground` her zaman ilk story; `argTypes` ortak parçalarla birleşir.
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

interface MakeMetaInput {
  /** ant kategorisi — sidebar grubu. */
  category: StoryCategory;
  /** Component'in görünen adı (sidebar + sayfa başlığı). */
  name: string;
  /** `React` component'i. */
  component: Meta["component"];
  /** Tek-iki cümlelik tanım — ne işe yarar. Markdown desteklenir. */
  summary: string;
  /** "Ne Zaman Kullanılır" maddeleri. */
  whenToUse?: string[];
  /** "Ne Zaman Kullanılmaz" maddeleri — hangi durumda başka bir component tercih edilmeli. */
  whenNotToUse?: string[];
  /** Erişilebilirlik notu (klavye, ARIA, odak). */
  a11y?: string;
  /** Ortak + component'e özel argType'lar. */
  argTypes?: Meta["argTypes"];
  /** Ek `parameters` (nadiren — layout override vb.). */
  parameters?: Meta["parameters"];
  /** Meta seviyesinde decorator (ör. Provider sarmalayıcı). */
  decorators?: Meta["decorators"];
  /** Meta seviyesinde `args` varsayılanları. */
  args?: Meta["args"];
}

function bulletList(heading: string, items?: string[]): string {
  if (!items || items.length === 0) return "";
  const bullets = items.map((i) => "- " + i).join("\n");
  return `\n\n### ${heading}\n\n${bullets}`;
}

export function makeMeta(input: MakeMetaInput): Meta {
  const description =
    input.summary +
    bulletList("Ne Zaman Kullanılır", input.whenToUse) +
    bulletList("Ne Zaman Kullanılmaz", input.whenNotToUse) +
    (input.a11y ? `\n\n### Erişilebilirlik\n\n${input.a11y}` : "");

  return {
    title: `${input.category}/${input.name}`,
    component: input.component,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: { component: description },
      },
      ...input.parameters,
    },
    argTypes: input.argTypes,
    decorators: input.decorators,
    args: input.args,
  };
}

/**
 * Tek bir story'nin autodocs açıklaması (ant'ın her demo'sunun altındaki
 * başlık + paragraf). `export const Foo: Story = { ...storyDoc("...") }`.
 */
export function storyDoc(description: string): { parameters: { docs: { description: { story: string } } } } {
  return { parameters: { docs: { description: { story: description } } } };
}
