// @vitest-environment node
import { readFileSync } from "node:fs";
import { twMerge } from "tailwind-merge";
import { describe, expect, it } from "vitest";
import { OUT, buildConfigSource, collectCandidates, recognizedBases } from "../../scripts/generate-merge-config.mjs";
import { cn } from "../cn";

/*
 * `cn`, tailwind-merge'ün indirgenmiş config'iyle çalışır (Faz 4a). Bu iki test
 * indirgemenin davranışı değiştirmediğini kilitler; bileşenlere yeni bir utility
 * grubu girerse ilki kırılır → `pnpm --filter @mari-ui/core generate:merge-config`.
 */
describe("mergeConfig.generated", () => {
  const candidates = collectCandidates();

  it("bileşen kaynağıyla güncel", () => {
    expect(readFileSync(OUT, "utf8")).toBe(buildConfigSource(candidates).source);
  });

  it("bileşen sınıfı çiftlerinin hepsinde (iki sırada) tam twMerge ile aynı sonucu verir", () => {
    const bases = recognizedBases(candidates);
    expect(bases.length).toBeGreaterThan(500);
    const mismatches: string[] = [];
    for (const a of bases) {
      for (const b of bases) {
        if (cn(a, b) !== twMerge(a, b)) mismatches.push(`${a} ${b} → ${cn(a, b)} (tam: ${twMerge(a, b)})`);
      }
    }
    expect(mismatches.slice(0, 20)).toEqual([]);
  }, 60_000);
});
