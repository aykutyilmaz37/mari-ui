import { foldForSearch } from "../lib/search";
import type { MentionOption } from "./types";

export interface MentionMatch {
  prefix: string;
  /** Tetik karakterinin metindeki konumu. */
  start: number;
  /** Tetik ile imleç arası. */
  query: string;
}

const isSpace = (ch: string | undefined) => ch !== undefined && /\s/.test(ch);

/**
 * İmleçten geriye: en yakın tetik karakteri, öncesi satır başı/boşluk ve
 * tetik ile imleç arasında boşluk yoksa eşleşme. (`e-posta@alan` gibi kelime
 * içi `@` tetiklemez.)
 */
export function findMention(text: string, caret: number, prefixes: readonly string[]): MentionMatch | null {
  const before = text.slice(0, caret);
  let best: MentionMatch | null = null;
  for (const prefix of prefixes) {
    const start = before.lastIndexOf(prefix);
    if (start === -1) continue;
    if (start > 0 && !isSpace(before[start - 1])) continue;
    const query = before.slice(start + prefix.length);
    if (/\s/.test(query)) continue;
    if (!best || start > best.start) best = { prefix, start, query };
  }
  return best;
}

/** `@sor` → `@ayse.demir ` ; imleç ayraçtan sonra. Ayraç zaten varsa ikincisi eklenmez. */
export function insertMention(text: string, match: MentionMatch, caret: number, value: string, split: string): { text: string; caret: number } {
  const head = text.slice(0, match.start) + match.prefix + value;
  const tail = text.slice(caret);
  const sep = split && !tail.startsWith(split) ? split : "";
  return { text: head + sep + tail, caret: head.length + (split ? split.length : 0) };
}

export function mentionText(option: MentionOption): string {
  if (option.searchText !== undefined) return option.searchText;
  const label = typeof option.label === "string" ? option.label : "";
  return `${option.value} ${label}`;
}

export function filterMentionOptions(
  options: readonly MentionOption[],
  query: string,
  filterOption?: false | ((query: string, option: MentionOption) => boolean)
): MentionOption[] {
  if (filterOption === false) return [...options];
  if (filterOption) return options.filter((o) => filterOption(query, o));
  const q = foldForSearch(query);
  return q ? options.filter((o) => foldForSearch(mentionText(o)).includes(q)) : [...options];
}
