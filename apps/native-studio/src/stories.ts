import { createElement } from "react";
import type React from "react";
import { storyModules } from "@mari-ui/native/stories";
import type { PersonaName } from "@mari-ui/tokens";
import type { pickImages } from "./picker";

/**
 * @mari-ui/native içindeki TÜM `*.stories.tsx` dosyaları (paketin kendi
 * `stories/registry`si) — web Storybook'un okuduğu dosyaların aynısı. Yeni
 * story dosyası eklemek yeterli; burada liste tutulmaz.
 */

export interface StoryContext {
  args: Record<string, unknown>;
  globals: { theme: "light" | "dark"; fonts: "system" | "brand"; persona?: PersonaName; radius?: number; insets?: { top: number; bottom: number; left: number; right: number }; pickImages?: typeof pickImages };
}

type Decorator = (Story: () => React.ReactElement, context: StoryContext) => React.ReactElement;

export interface StoryObject {
  name?: string;
  args?: Record<string, unknown>;
  render?: (args: Record<string, unknown>, context: StoryContext) => React.ReactElement;
  decorators?: Decorator[];
  parameters?: { docs?: { description?: { story?: string } } };
}

export interface StoryMeta {
  title: string;
  /**
   * `studio.layout: "screen"`: story'ler tek tek, ScrollView'suz tam ekranda
   * (üstte story seçici). Kendi içinde kayan (FlatList) component'ler için —
   * aynı yönde ScrollView içinde sanal liste RN'de uyarı verir ve sanallaştırma bozulur.
   */
  parameters?: { studio?: { layout?: "scroll" | "screen" } };
  component?: React.ComponentType<Record<string, unknown>>;
  args?: Record<string, unknown>;
  decorators?: Decorator[];
}

export interface StoryEntry {
  /** Storybook grubu (Genel, Veri Girişi, Veri Gösterimi…). */
  category: string;
  /** "Native/Genel/Button" → "Button". */
  title: string;
  meta: StoryMeta;
  stories: Array<{ id: string; name: string; description?: string; story: StoryObject }>;
}

/** "ColorsAndVariants" → "Colors And Variants" (story'de `name` yoksa). */
const humanize = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2");

export const STORY_ENTRIES: StoryEntry[] = storyModules
  .map((mod) => {
    const meta = mod.default as StoryMeta;
    const stories = Object.entries(mod)
      .filter(([exportName]) => exportName !== "default")
      .map(([exportName, value]) => {
        const story = value as StoryObject;
        return { id: exportName, name: story.name ?? humanize(exportName), description: story.parameters?.docs?.description?.story, story };
      });
    const [, category = "Genel", ...nameParts] = meta.title.split("/");
    return { category, title: nameParts.join("/") || category, meta, stories };
  })
  .sort((a, b) => {
    const order = ["Genel", "Navigasyon", "Veri Girişi", "Veri Gösterimi", "Geri Bildirim"];
    return order.indexOf(a.category) - order.indexOf(b.category) || a.category.localeCompare(b.category, "tr") || a.title.localeCompare(b.title, "tr");
  });

export const STORY_CATEGORIES = [...new Set(STORY_ENTRIES.map((entry) => entry.category))];

/**
 * Storybook'un yaptığı gibi: args birleştirilir, `render` (yoksa component)
 * çağrılır, story + meta dekoratörleri sarar.
 */
export function renderStory(entry: StoryEntry, story: StoryObject, globals: StoryContext["globals"]): React.ReactElement {
  const args = { ...entry.meta.args, ...story.args };
  const context: StoryContext = { args, globals };
  const Component = entry.meta.component;
  let element: () => React.ReactElement = () => {
    if (story.render) return story.render(args, context);
    if (!Component) throw new Error(`${entry.title}: story'de render ya da meta'da component yok`);
    return createElement(Component, args);
  };
  for (const decorator of [...(story.decorators ?? []), ...(entry.meta.decorators ?? [])]) {
    const inner = element;
    element = () => decorator(inner, context);
  }
  return element();
}
