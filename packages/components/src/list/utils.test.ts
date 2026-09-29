import { describe, expect, it } from "vitest";
import { getPageSlice, gridClassName, resolveRowKey } from "./utils";

describe("list/utils", () => {
  it("resolveRowKey: fonksiyon > alan > key/id > sıra", () => {
    expect(resolveRowKey({ slug: "a" }, 0, (item) => item.slug)).toBe("a");
    expect(resolveRowKey({ slug: "b" }, 0, "slug")).toBe("b");
    expect(resolveRowKey({ key: "k", id: 1 }, 5, undefined)).toBe("k");
    expect(resolveRowKey({ id: 7 }, 5, undefined)).toBe(7);
    expect(resolveRowKey("düz metin", 5, undefined)).toBe(5);
  });

  it("getPageSlice: dilimler, aralık dışı sayfayı son sayfaya çeker", () => {
    const data = Array.from({ length: 23 }, (_, i) => i);
    expect(getPageSlice(data, 1, 10)).toEqual({ items: data.slice(0, 10), page: 1, offset: 0 });
    expect(getPageSlice(data, 3, 10).items).toEqual([20, 21, 22]);
    expect(getPageSlice(data, 9, 10).page).toBe(3);
    expect(getPageSlice([], 4, 10)).toEqual({ items: [], page: 1, offset: 0 });
  });

  it("gridClassName: tek sayı ve kırılım nesnesi; base yoksa mobilde tek sütun", () => {
    expect(gridClassName({ columns: 3 })).toBe("grid gap-4 grid-cols-3");
    expect(gridClassName({ columns: { sm: 2, lg: 4 }, gap: "lg" })).toBe("grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
    expect(gridClassName({ columns: { base: 2, xl: 6 }, gap: "sm" })).toBe("grid gap-2 grid-cols-2 xl:grid-cols-6");
  });
});
