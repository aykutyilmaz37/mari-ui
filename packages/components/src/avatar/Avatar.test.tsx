import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";
import { getA11yViolations } from "../testUtils/a11y";

describe("Avatar", () => {
  it("src=\"\" iken img render etmez, doğrudan baş harf yedeğine düşer (Faz 13.4 — Storybook'ta gözlemlenen gerçek bug: boş src taşan alt metni gösteriyordu)", () => {
    render(<Avatar alt="Aykut Yılmaz" src="" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("geçerli bir src iken img render eder", () => {
    render(<Avatar alt="Kullanıcı" src="/avatar.png" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/avatar.png");
  });

  it("boyutla orantılı baş harf font-size'ı kullanır (ant.design ile getComputedStyle kıyası: sm→text-sm, md→text-lg, lg→text-2xl)", () => {
    const { rerender } = render(<Avatar alt="Ada" size="sm" />);
    expect(screen.getByText("A")).toHaveClass("text-sm");

    rerender(<Avatar alt="Ada" size="md" />);
    expect(screen.getByText("A")).toHaveClass("text-lg");

    rerender(<Avatar alt="Ada" size="lg" />);
    expect(screen.getByText("A")).toHaveClass("text-2xl");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Avatar alt="Ada Lovelace" src="/avatar.png" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
