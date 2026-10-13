import { describe, expect, it } from "vitest";
import { computeLayout, resolveColumns, resolveGap } from "../Masonry/masonryUtils";

describe("masonry utils", () => {
  it("computeLayout: her öğe en kısa sütuna, eşitlikte soldaki; toplam yükseklik", () => {
    const { positions, height } = computeLayout([100, 50, 80, 30], 2, 10, 210);
    expect(positions.map((p) => p.column)).toEqual([0, 1, 1, 0]);
    expect(positions[0]).toEqual({ left: 0, top: 0, width: 100, column: 0 });
    expect(positions[1]).toMatchObject({ left: 110, top: 0 });
    expect(positions[2]).toMatchObject({ top: 60 });
    expect(positions[3]).toMatchObject({ top: 110 });
    expect(height).toBe(140);
    expect(computeLayout([], 3, 16, 300).height).toBe(0);
  });

  it("resolveColumns: sayı ya da kırılım nesnesi (mobil önce, native kırılımlar); varsayılan taban 2", () => {
    const cols = { base: 2, sm: 3, md: 4 };
    expect(resolveColumns(3, 400)).toBe(3);
    expect(resolveColumns(cols, 375)).toBe(2);
    expect(resolveColumns(cols, 600)).toBe(3);
    expect(resolveColumns(cols, 1024)).toBe(4);
    expect(resolveColumns({ md: 3 }, 500)).toBe(2);
  });

  it("resolveGap: boyut ya da pt", () => {
    expect(resolveGap("sm")).toBe(8);
    expect(resolveGap(12)).toBe(12);
  });
});
