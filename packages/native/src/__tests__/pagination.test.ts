import { describe, expect, it } from "vitest";
import { fitSiblingCount, getPageAfterSizeChange, getPageItems } from "../Pagination/paginationUtils";

const E = (direction: "left" | "right") => ({ type: "ellipsis", direction });

describe("getPageItems", () => {
  it("az sayfada hepsini döner", () => {
    expect(getPageItems(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it("her sayfada SABİT sayıda slot üretir — genişlik zıplamaz (Faz 13.6 kullanıcı bulgusu)", () => {
    for (let page = 1; page <= 20; page++) expect(getPageItems(20, page)).toHaveLength(7);
    for (let page = 1; page <= 20; page++) expect(getPageItems(20, page, 2)).toHaveLength(9);
  });

  it("\"…\" asla tek bir sayfayı gizlemez", () => {
    expect(getPageItems(10, 4)).toEqual([1, 2, 3, 4, 5, E("right"), 10]);
    expect(getPageItems(10, 5)).toEqual([1, E("left"), 4, 5, 6, E("right"), 10]);
    expect(getPageItems(10, 7)).toEqual([1, E("left"), 6, 7, 8, 9, 10]);
  });

  it("sayfa boyutu değişince ilk görünen kayıt görünür kalır", () => {
    expect(getPageAfterSizeChange(3, 10, 20, 95)).toBe(2); // 21. kayıt → 20/sayfa'da 2. sayfa
    expect(getPageAfterSizeChange(10, 10, 100, 95)).toBe(1);
  });
});

describe("fitSiblingCount (Faz 15.5 — dar ekranda taşma)", () => {
  // md: 32px kare, 8px boşluk. 1 komşu = 7 sayfa slotu + 2 ok = 9 slot = 9*32 + 8*8 = 352px.
  it("sığarsa istenen komşu sayısını korur", () => {
    expect(fitSiblingCount(360, 32, 8, 20, 1)).toBe(1);
  });
  it("sığmazsa komşuları azaltır; hiç sığmazsa -1 (simple)", () => {
    expect(fitSiblingCount(343, 32, 8, 20, 2)).toBe(0); // 0 komşu: 7 slot = 272px
    expect(fitSiblingCount(200, 32, 8, 20, 1)).toBe(-1);
  });
  it("az sayfada slot sayısı toplam sayfayla sınırlı", () => {
    // 3 sayfa + 2 ok = 5 slot = 192px — 2 komşu istense de sığar.
    expect(fitSiblingCount(200, 32, 8, 3, 2)).toBe(2);
  });
});
