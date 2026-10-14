/** Kabarcık metni: sayı `overflowCount`ı aşarsa "N+"; boş değerler `null` (gizli). */
export function displayCount(count: number | string | undefined, overflowCount: number): string | null {
  if (count == null || count === "") return null;
  if (typeof count === "number") return count > overflowCount ? `${overflowCount}+` : String(count);
  return count;
}

/** Nokta her zaman görünür; sayı boşsa ya da 0 iken `showZero` yoksa gizli. */
export function isBadgeHidden(dot: boolean, text: string | null, count: number | string | undefined, showZero: boolean): boolean {
  if (dot) return false;
  return text === null || (count === 0 && !showZero);
}
