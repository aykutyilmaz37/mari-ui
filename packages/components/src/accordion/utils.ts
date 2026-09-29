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

/**
 * APG accordion klavyesi: başlıklar arasında ↑/↓ (döngülü), Home/End.
 * Devre dışı başlıklar listeye verilmez. Diğer tuşlarda `null`.
 */
export function getHeaderTarget(headers: HTMLElement[], current: Element | null, key: string): HTMLElement | null {
  if (headers.length === 0) return null;
  const index = current ? headers.indexOf(current as HTMLElement) : -1;
  switch (key) {
    case "ArrowDown":
      return headers[(index + 1) % headers.length] ?? null;
    case "ArrowUp":
      return headers[index <= 0 ? headers.length - 1 : index - 1] ?? null;
    case "Home":
      return headers[0] ?? null;
    case "End":
      return headers[headers.length - 1] ?? null;
    default:
      return null;
  }
}
