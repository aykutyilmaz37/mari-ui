/**
 * `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi dosyalar
 * tüketicinin KENDİ amacıyla da yazdığı, paylaşılan dosyalardır — özellikle
 * `AGENTS.md`. Bu yüzden `mari-ui`ın yazdığı her bölüm bu işaretler arasına
 * alınır; `sync` SADECE bu blok içeriğini değiştirir, öncesindeki/sonrasındaki
 * hiçbir şeye dokunmaz (bkz. plan Faz 7). Dosya hiç yoksa oluşturulur, varsa
 * ve markerı taşımıyorsa blok SONA eklenir (mevcut içerik korunur), zaten
 * taşıyorsa sadece iki işaret arası DEĞİŞTİRİLİR.
 */
export const MARKER_START = "<!-- mari-ui:start -->";
export const MARKER_END = "<!-- mari-ui:end -->";

export class MalformedMarkerBlockError extends Error {
  constructor(filePath: string) {
    super(`[@mari-ui/cli] "${filePath}" içinde "${MARKER_START}" var ama eşleşen "${MARKER_END}" yok (ya da sırası ters). Dosyayı elle kontrol edin.`);
    this.name = "MalformedMarkerBlockError";
  }
}

/**
 * `existingContent`teki mari-ui işaretli bölümü `blockBody`yle değiştirir
 * (yoksa ekler). `filePath` sadece hata mesajı için.
 */
export function upsertMarkerBlock(existingContent: string, blockBody: string, filePath = "(bilinmiyor)"): string {
  const block = `${MARKER_START}\n${blockBody.trim()}\n${MARKER_END}`;
  const startIndex = existingContent.indexOf(MARKER_START);

  if (startIndex === -1) {
    if (existingContent.trim().length === 0) return `${block}\n`;
    return `${existingContent.trimEnd()}\n\n${block}\n`;
  }

  const endIndex = existingContent.indexOf(MARKER_END, startIndex);
  if (endIndex === -1) throw new MalformedMarkerBlockError(filePath);

  const before = existingContent.slice(0, startIndex);
  const after = existingContent.slice(endIndex + MARKER_END.length);
  return `${before}${block}${after}`;
}

/** `--check` modu için: dosyanın GÜNCEL hâli, taze üretilen blokla birebir aynı mı? */
export function isMarkerBlockUpToDate(existingContent: string, blockBody: string): boolean {
  const startIndex = existingContent.indexOf(MARKER_START);
  const endIndex = existingContent.indexOf(MARKER_END, startIndex === -1 ? 0 : startIndex);
  if (startIndex === -1 || endIndex === -1) return false;
  const currentBlock = existingContent.slice(startIndex, endIndex + MARKER_END.length);
  const freshBlock = `${MARKER_START}\n${blockBody.trim()}\n${MARKER_END}`;
  return currentBlock === freshBlock;
}
