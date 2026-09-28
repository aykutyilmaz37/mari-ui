import { describe, expect, it } from "vitest";
import { radius } from "@mari-ui/tokens";
import { buildComponentSize, componentSize } from "../variants/sizeScale";

describe("buildComponentSize", () => {
  it("varsayılan (density='md') çağrı, önceden hesaplanmış `componentSize` sabitiyle BİREBİR aynıdır (regresyon)", () => {
    expect(buildComponentSize("md")).toEqual(componentSize);
    expect(buildComponentSize()).toEqual(componentSize);
  });

  it("density='sm' her boyutu bir adım keskinleştirir (md tabanına göre)", () => {
    const sharp = buildComponentSize("sm");
    expect(sharp.md.radius).toBe(radius.sm);
    expect(sharp.lg.radius).toBe(radius.sm);
    expect(sharp.xl.radius).toBe(radius.md);
  });

  it("density='full': md tabanlı boyutlar (md/lg) tam yuvarlanır, offset korunduğu için xs/sm sadece bir adım artar (full'a kırpılmaz — henüz sınırda değiller)", () => {
    const pill = buildComponentSize("full");
    expect(pill.md.radius).toBe(radius.full);
    expect(pill.lg.radius).toBe(radius.full);
    expect(pill.xl.radius).toBe(radius.full); // lg tabanlı + offset skalanın sonuna kırpılır
    expect(pill.xs.radius).toBe(radius.xl); // sm tabanlı + offset — henüz "full" değil, oran korunuyor
  });

  it("density='none' skalanın başına kırpılır, negatife taşmaz", () => {
    const sharp = buildComponentSize("none");
    expect(sharp.xs.radius).toBe(radius.none);
    expect(sharp.md.radius).toBe(radius.none);
  });

  it("height/padding/fontSize/gap yoğunluktan ETKİLENMEZ — sadece radius değişir", () => {
    const base = buildComponentSize("md");
    const dense = buildComponentSize("full");
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      expect(dense[size].height).toBe(base[size].height);
      expect(dense[size].paddingX).toBe(base[size].paddingX);
      expect(dense[size].fontSize).toBe(base[size].fontSize);
    }
  });
});
