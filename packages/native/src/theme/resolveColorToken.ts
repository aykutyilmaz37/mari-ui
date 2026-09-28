import type { ColorTokenRef } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";

/**
 * `@mari-ui/core`'un platformdan bağımsız `ColorTokenRef`ini (`{ role, slot }`)
 * somut bir hex renge çözer. `@mari-ui/tokens`'taki `Theme.color[role]`
 * (`SemanticColorRole`) şekli `ColorTokenRef["slot"]` ile BİREBİR aynı
 * anahtarları taşıyacak şekilde tasarlandı — bu yüzden çözümleme tek satırlık
 * bir property erişimi, ayrı bir eşleme tablosuna gerek yok. Web tarafının
 * `--mari-{role}-{slot}` CSS değişkeni okumasının native karşılığı budur.
 */
export function resolveColorToken(theme: Theme, ref: ColorTokenRef): string {
  return theme.color[ref.role][ref.slot];
}
