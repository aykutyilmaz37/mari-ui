import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("kök öğe role=\"separator\" taşır (Faz 13 — a11y audit'inde eksikti)", () => {
    render(<Divider>Bölüm</Divider>);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("yatay modda aria-orientation eklemez (separator zaten yatay varsayılır)", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-orientation");
  });

  it("dikey modda aria-orientation=\"vertical\" ekler", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("kendi varsayılan boşluğu var (yatay my-4, dikey mx-3) ve className ile ezilebilir", () => {
    const { rerender } = render(<Divider />);
    expect(screen.getByRole("separator").className).toContain("my-4");

    rerender(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator").className).toContain("mx-3");

    rerender(<Divider className="my-0" />);
    expect(screen.getByRole("separator").className).not.toContain("my-4");
  });

  it("dashed/dotted çizgi stili çizgiyi çizen elemana uygulanır (kapsayıcıya değil — border-style inherit edilmez)", () => {
    const { container } = render(<Divider lineStyle="dashed">Etiket</Divider>);
    const lines = container.querySelectorAll("span.border-dashed");
    expect(lines).toHaveLength(2);
  });

  it("erişilebilirlik ihlali içermez — etiketli ve etiketsiz (axe-core, Faz 9)", async () => {
    const withLabel = render(<Divider>Ayraç</Divider>);
    expect(await getA11yViolations(withLabel.container)).toEqual([]);

    const plain = render(<Divider orientation="vertical" />);
    expect(await getA11yViolations(plain.container)).toEqual([]);
  });
});
