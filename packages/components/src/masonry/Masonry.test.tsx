import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Masonry } from ".";
import { computeLayout, resolveColumns, resolveGap } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

describe("masonry/utils", () => {
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

  it("resolveColumns: sayı ya da kırılım nesnesi (mobil önce)", () => {
    const cols = { base: 1, sm: 2, lg: 4 };
    expect(resolveColumns(3, 400)).toBe(3);
    expect(resolveColumns(cols, 375)).toBe(1);
    expect(resolveColumns(cols, 800)).toBe(2);
    expect(resolveColumns(cols, 1280)).toBe(4);
    expect(resolveColumns({ md: 3 }, 500)).toBe(1);
  });

  it("resolveGap: boyut ya da px", () => {
    expect(resolveGap("sm")).toBe(8);
    expect(resolveGap(12)).toBe(12);
  });
});

describe("Masonry", () => {
  const items = ["Sabah kahvesi", "Deniz kıyısı", "Kitap önerileri"].map((t) => ({ key: t, children: <p>{t}</p> }));

  it("liste semantiği; DOM sırası öğe sırası", () => {
    render(<Masonry aria-label="Pano" items={items} />);
    const list = screen.getByRole("list", { name: "Pano" });
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Sabah kahvesi", "Deniz kıyısı", "Kitap önerileri"]);
  });

  it("ölçüm yokken (jsdom) CSS columns ile çizilir", () => {
    render(<Masonry aria-label="Pano" columns={3} gutter="lg" items={items} />);
    expect(screen.getByRole("list")).toHaveStyle({ columnCount: "3", columnGap: "24px" });
  });

  it("skeleton: aria-hidden; veri yokken yer tutucular", () => {
    const { container, rerender } = render(<Masonry aria-label="Pano" skeleton items={items} />);
    expect(container.querySelector("ul")).toHaveAttribute("aria-hidden", "true");
    rerender(<Masonry aria-label="Pano" skeleton items={[]} />);
    expect(container.querySelectorAll("li")).toHaveLength(6);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Masonry aria-label="Pano" items={items} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
