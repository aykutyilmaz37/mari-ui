import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Faz 15 — `density.radius` preset'i yalnızca `--mari-radius-*`'a bağlı
 * utility'leri (`rounded-sm/md/lg/xl`, `rounded-none`, `rounded-full`) ölçekler.
 * Çıplak `rounded` (sabit 0.25rem) ve `rounded-2xl/3xl/xs` Tailwind'in kendi
 * sabit değerlerine gider → preset'i sessizce yok sayar. Bu test onları yasaklar.
 */
const SRC = join(__dirname, "..");
const UNTOKENED = /(?<=[\s"'`:])rounded(?:-[tblrse]{1,2})?(?:-(?:xs|[234]xl))?(?=[\s"'`])/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

/**
 * QRCode'un nokta tipi `dotType: "rounded"` bir seçenek DEĞERİ, sınıf adı değil
 * (kaynak renderer'ın adı). Yalnız o klasörde, tek başına tırnaklı string olarak geçtiğinde muaf.
 */
function isQRDotTypeValue(file: string, source: string, index: number): boolean {
  if (!file.includes(`${join("qrcode", "")}`)) return false;
  const quote = source[index - 1];
  return (quote === '"' || quote === "'") && source[index + "rounded".length] === quote;
}

describe("radius token disiplini", () => {
  it("token'a bağlı olmayan rounded utility'si kullanılmaz", () => {
    const offenders = sourceFiles(SRC).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [...source.matchAll(UNTOKENED)]
        .filter((m) => !isQRDotTypeValue(file, source, m.index))
        .map((m) => `${file.slice(SRC.length + 1)}: ${m[0]}`);
    });
    expect(offenders).toEqual([]);
  });
});
