import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { getA11yViolations } from "../testUtils/a11y";

describe("Skeleton", () => {
  it("active=false iken animasyon YOK (eskiden animate-pulse her zaman vardı)", () => {
    const { container } = render(<Skeleton />);
    expect(container.innerHTML).not.toContain("animate-");
  });

  it("active iken parıltı animasyonu", () => {
    const { container } = render(<Skeleton active />);
    expect(container.innerHTML).toContain("mari-skeleton-shimmer");
  });

  it("varsayılan olarak ekran okuyucudan gizli; label verilince role=status", () => {
    const { container, rerender } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<Skeleton label="Ürünler yükleniyor" />);
    expect(screen.getByRole("status", { name: "Ürünler yükleniyor" })).toBeInTheDocument();
  });

  it("loading=false iken çocukları render eder", () => {
    render(
      <Skeleton loading={false}>
        <p>Gerçek içerik</p>
      </Skeleton>
    );
    expect(screen.getByText("Gerçek içerik")).toBeInTheDocument();
  });

  it("SkeletonBlock sayısal ölçüleri px'e çevirir", () => {
    const { container } = render(<SkeletonBlock width={120} height={16} radius="full" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.className).toContain("rounded-full");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Skeleton active avatar />
        <Skeleton label="Yükleniyor" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
