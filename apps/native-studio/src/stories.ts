import { createElement } from "react";
import type React from "react";

/**
 * packages/native içindeki TÜM `*.stories.tsx` dosyaları — web Storybook'un
 * okuduğu dosyaların aynısı. Yeni story dosyası eklemek yeterli; burada liste
 * tutulmaz (`require.context`, Metro).
 */

export interface StoryContext {
  args: Record<string, unknown>;
  globals: { theme: "light" | "dark"; fonts: "system" | "brand" };
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
  component?: React.ComponentType<Record<string, unknown>>;
  args?: Record<string, unknown>;
  decorators?: Decorator[];
}

export interface StoryEntry {
  /** "Native/Button" → "Button". */
  title: string;
  meta: StoryMeta;
  stories: Array<{ id: string; name: string; description?: string; story: StoryObject }>;
}

declare const require: {
  context: (dir: string, deep: boolean, pattern: RegExp) => { keys(): string[]; (id: string): Record<string, unknown> };
};

const ctx = require.context("../../../packages/native/src", true, /\.stories\.tsx$/);

/** "ColorsAndVariants" → "Colors And Variants" (story'de `name` yoksa). */
const humanize = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2");

export const STORY_ENTRIES: StoryEntry[] = ctx
  .keys()
  .map((key) => {
    const mod = ctx(key);
    const meta = mod.default as StoryMeta;
    const stories = Object.entries(mod)
      .filter(([exportName]) => exportName !== "default")
      .map(([exportName, value]) => {
        const story = value as StoryObject;
        return { id: exportName, name: story.name ?? humanize(exportName), description: story.parameters?.docs?.description?.story, story };
      });
    return { title: meta.title.replace(/^Native\//, ""), meta, stories };
  })
  .sort((a, b) => a.title.localeCompare(b.title, "tr"));

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

