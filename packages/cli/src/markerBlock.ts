/**
 * `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi dosyalar
 * tüketicinin KENDİ amacıyla da yazdığı, paylaşılan dosyalardır — özellikle
 * `AGENTS.md`. Bu yüzden `mari-ui`ın yazdığı her bölüm bu işaretler arasına
 * alınır; `sync` SADECE bu blok içeriğini değiştirir, öncesindeki/sonrasındaki
 * hiçbir şeye dokunmaz. Dosya hiç yoksa oluşturulur, varsa
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

const isTableRow = (line: string) => line.trimStart().startsWith("|");
const isSeparatorCell = (cell: string) => /^:?-+:?$/.test(cell);

/** Tablo satırını hücrelere böler (`\|` kaçışlı boru hücre içinde kalır). */
function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());
}

/** Prettier'ın saydığı gibi görünür genişlik: emoji iki sütun. */
function displayWidth(text: string): number {
  return [...text.replaceAll("️", "")].reduce((sum, ch) => sum + (/\p{Extended_Pictographic}/u.test(ch) ? 2 : 1), 0);
}

function formatTable(rows: string[][]): string[] {
  const columns = Math.max(...rows.map((r) => r.length));
  const widths = Array.from({ length: columns }, (_, c) =>
    Math.max(3, ...rows.filter((r) => !r.every(isSeparatorCell)).map((r) => displayWidth(r[c] ?? ""))),
  );
  return rows.map((row) => {
    const separator = row.every(isSeparatorCell);
    const cells = widths.map((width, c) => {
      const cell = row[c] ?? "";
      if (!separator) return cell + " ".repeat(width - displayWidth(cell));
      const left = cell.startsWith(":") ? ":" : "";
      const right = cell.length > 1 && cell.endsWith(":") ? ":" : "";
      return left + "-".repeat(width - left.length - right.length) + right;
    });
    return `| ${cells.join(" | ")} |`;
  });
}

/**
 * Markdown tablolarını Prettier'ın varsayılan biçimiyle hizalar. Prettier kullanan
 * projelerde `prettier --check` kırılmasın, düzeltilen dosyayı sonraki `sync` bozmasın.
 */
export function formatMarkdownTables(markdown: string): string {
  const out: string[] = [];
  let rows: string[][] = [];
  const flush = () => {
    if (rows.length) out.push(...formatTable(rows));
    rows = [];
  };
  for (const line of markdown.split("\n")) {
    if (isTableRow(line)) {
      rows.push(splitRow(line));
      continue;
    }
    flush();
    out.push(line);
  }
  flush();
  return out.join("\n");
}

/** İşaretli blok; işaretlerin çevresinde boş satır (Prettier'ın da yazdığı biçim). */
function renderBlock(blockBody: string): string {
  return `${MARKER_START}\n\n${formatMarkdownTables(blockBody.trim())}\n\n${MARKER_END}`;
}

/** `--check` için biçimden bağımsız karşılaştırma: boşluk/hizalama farkı bayatlık sayılmaz. */
function canonical(block: string): string {
  return block
    .split("\n")
    .map((line) => (isTableRow(line) ? splitRow(line).map((c) => (isSeparatorCell(c) ? c.replace(/-+/, "-") : c)).join("|") : line.trimEnd()))
    .filter((line) => line !== "")
    .join("\n");
}

/**
 * `existingContent`teki mari-ui işaretli bölümü `blockBody`yle değiştirir
 * (yoksa ekler). `filePath` sadece hata mesajı için.
 */
export function upsertMarkerBlock(existingContent: string, blockBody: string, filePath = "(bilinmiyor)"): string {
  const block = renderBlock(blockBody);
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
  return canonical(currentBlock) === canonical(renderBlock(blockBody));
}
