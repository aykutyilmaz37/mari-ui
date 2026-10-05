/**
 * Web `Input`'un `mask` + `replacement` davranışı (@react-input/mask,
 * `showMask: false`) — native için saf karşılık (DOM'suz, ayrıca test edilir).
 *
 * `mask` içinde `replacement` anahtarı olan karakterler (varsayılan `_`)
 * kullanıcı girişiyle doldurulur; diğerleri sabit karakterlerdir ve yalnız
 * ardından bir giriş geldiğinde yazılır. Girişte sabit karakterler ve kurala
 * uymayan karakterler atlanır.
 *
 *   formatMask("5321234567", "0(5__) ___ __ __") → "0(532) 123 45 67"
 */
export function formatMask(input: string, mask: string, replacement: Record<string, RegExp> = { _: /\d/ }): string {
  // Kullanıcının yazdığı (sabitler hariç) karakterler; maskenin baştaki sabitlerini
  // yeniden yazmış olabilir ("0(5…") — onları ayıklamak için maskeyi adım adım yürüt.
  const chars = Array.from(input);
  let out = "";
  let ci = 0;
  for (const m of Array.from(mask)) {
    if (ci >= chars.length) break;
    const rule = replacement[m];
    if (!rule) {
      out += m;
      // Kullanıcı sabiti kendisi yazdıysa tüket.
      if (chars[ci] === m) ci++;
      continue;
    }
    // Kurala uyan ilk karakteri bul (sabitleri / geçersizleri atla).
    while (ci < chars.length && !rule.test(chars[ci]!)) ci++;
    if (ci >= chars.length) break;
    out += chars[ci];
    ci++;
  }
  return trimTrailingLiterals(out);
}

/** Sonda harf/rakam olmayan sabitler kaldıysa (giriş bitti) at: "0(53) " değil "0(53". Hepsi sabitse olduğu gibi. */
function trimTrailingLiterals(out: string): string {
  let end = out.length;
  while (end > 0 && !/[\p{L}\p{N}]/u.test(out[end - 1]!)) end--;
  return end === 0 ? out : out.slice(0, end);
}
