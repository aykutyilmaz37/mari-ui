/**
 * YALNIZ native-studio (Expo / Metro) İÇİN — paketteki tüm `*.stories.tsx`
 * modülleri. Studio bunu `@mari-ui/native/stories` adıyla alır; yol paketin
 * kendi içinde çözüldüğü için studio'da göreli `../../` yolu yok. Yeni story
 * dosyası eklemek yeterli (`require.context`, Metro). Web Storybook bunu
 * kullanmaz (kendi glob'u var), paket girişinden (`src/index.ts`) açılmaz.
 */
declare const require: {
  context: (dir: string, deep: boolean, pattern: RegExp) => { keys(): string[]; (id: string): Record<string, unknown> };
};

const context = require.context("..", true, /\.stories\.tsx$/);

/** Her story dosyasının modülü (default = meta, diğer export'lar = story'ler). */
export const storyModules: Array<Record<string, unknown>> = context.keys().map((key) => context(key));
