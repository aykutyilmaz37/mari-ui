/**
 * Bir "hedef dosya": `relativePath` tüketici projesinin köküne göre, `body`
 * mari-ui işaret bloğunun İÇİNE yazılacak içerik.
 *
 * `prefix` İSTİSNAİ bir alan: SADECE Claude Code'un SKILL.md'si ve Cursor'ın
 * `.mdc`si gibi, YAML frontmatter'ı dosyanın LİTERAL İLK BAYTLARI olmak
 * ZORUNDA olan formatlar için var. Marker bloğu frontmatter'DAN ÖNCE
 * gelirse (ilk denemede fiilen böyle oldu — bir smoke test'te yakalandı)
 * o araçların frontmatter parser'ı dosyayı okuyamaz. `prefix` bloktan ÖNCE,
 * HER ZAMAN sabit yazılır ve marker mekanizmasının dışında tutulur; diğer
 * üç yazıcı (`agents`/`gemini`/`copilot`) bunu hiç kullanmaz.
 */
export interface FileTarget {
  relativePath: string;
  body: string;
  prefix?: string;
}
