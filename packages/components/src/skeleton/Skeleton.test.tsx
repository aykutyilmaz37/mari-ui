import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { SkeletonButton } from "./SkeletonButton";
import { SkeletonInput } from "./SkeletonInput";
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

  it("avatar iskeleti Avatar'la aynı geometri: md 2rem daire varsayılan, sm 1.5rem, kare → size'a göre radius", () => {
    const { container, rerender } = render(<Skeleton avatar />);
    let avatar = container.querySelector(".flex.gap-4 > div") as HTMLElement;
    expect(avatar.style.width).toBe("2rem");
    expect(avatar.className).toContain("rounded-full");
    rerender(<Skeleton avatar={{ size: "sm", shape: "square" }} />);
    avatar = container.querySelector(".flex.gap-4 > div") as HTMLElement;
    expect(avatar.style.width).toBe("1.5rem");
    expect(avatar.className).toContain("rounded-sm");
  });

  it("SkeletonButton/Input Button ile aynı: sm rounded-sm, circle kare-daire, pill/round tam yuvarlak", () => {
    const { container } = render(
      <>
        <SkeletonButton size="sm" />
        <SkeletonButton shape="circle" />
        <SkeletonButton shape="pill" />
        <SkeletonButton shape="round" />
        <SkeletonInput size="sm" />
      </>
    );
    const [sm, circle, pill, round, input] = Array.from(container.children) as HTMLElement[];
    expect(sm!.className).toContain("rounded-sm");
    expect(sm!.className).not.toContain("rounded-md");
    expect(circle!.className).toContain("size-8");
    expect(circle!.className).not.toContain("w-20");
    expect(pill!.className).toContain("rounded-full");
    expect(round!.className).toContain("rounded-full");
    expect(input!.className).toContain("rounded-sm");
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
