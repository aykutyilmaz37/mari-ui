/** "Ayşe Nur Demir" → "AD" (ilk ve son kelime, Türkçe büyük harf: i → İ). */
export function getInitials(alt: string): string {
  const words = alt.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toLocaleUpperCase("tr");
}
