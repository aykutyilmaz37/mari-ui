/**
 * OTP metnini temizler: `numeric` ise yalnız rakamlar, her hane `formatter`dan
 * geçer (ör. büyük harf), uzunluk `length` ile kesilir. Saf — testli.
 */
export function normalizeOtp(text: string, length: number, numeric: boolean, formatter?: (char: string) => string): string[] {
  const chars = [...text].filter((c) => (numeric ? /\d/.test(c) : /\S/.test(c)));
  return chars.slice(0, length).map((c) => (formatter ? formatter(c) : c));
}

/** Odaktaki (yazılacak) hane: ilk boş yuva; hepsi doluysa sonuncusu. */
export function activeOtpIndex(filled: number, length: number): number {
  return Math.min(filled, length - 1);
}
