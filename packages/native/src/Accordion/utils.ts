/** Accordion'un saf mantığı — web `accordion/utils.ts` ile aynı (testli). */

/** `activeKey` tek anahtar ya da dizi olabilir → her zaman dizi. */
export function toKeys(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

/** Bir bölümü aç/kapat. Tekli modda açılan bölüm diğerlerini kapatır. */
export function toggleKey(active: string[], key: string, single: boolean): string[] {
  if (active.includes(key)) return active.filter((k) => k !== key);
  return single ? [key] : [...active, key];
}
