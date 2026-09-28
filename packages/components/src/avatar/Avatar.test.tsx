import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "./Avatar";
import { getInitials } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

describe("Avatar", () => {
  it("src=\"\" iken img etiketi render etmez, baş harf yedeğine düşer (Faz 13.4 bug'ı)", () => {
    const { container } = render(<Avatar alt="Aykut Yılmaz" src="" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AY")).toBeInTheDocument();
  });

  it("geçerli bir src iken img render eder", () => {
    render(<Avatar alt="Kullanıcı" src="/avatar.png" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/avatar.png");
  });

  it("baş harf yedeği ekran okuyucuya harfleri değil alt metni okutur", () => {
    render(<Avatar alt="Aykut Yılmaz" />);
    expect(screen.getByRole("img", { name: "Aykut Yılmaz" })).toBeInTheDocument();
  });

  it("boyutla orantılı baş harf font-size'ı kullanır", () => {
    const { rerender } = render(<Avatar alt="Ada" size="sm" />);
    expect(screen.getByText("A")).toHaveClass("text-[0.625rem]");
    rerender(<Avatar alt="Ada" size="md" />);
    expect(screen.getByText("A")).toHaveClass("text-sm");
    rerender(<Avatar alt="Ada" size="lg" />);
    expect(screen.getByText("A")).toHaveClass("text-base");
  });

  it("color verilince soft tonlu zemin kullanır", () => {
    render(<Avatar alt="Ada" color="success" />);
    expect(screen.getByRole("img").className).toMatch(/bg-mari-success/);
  });

  it("skeleton: aynı boyutta, ekran okuyucudan gizli yer tutucu", () => {
    const { container } = render(<Avatar alt="Ada" size="lg" skeleton />);
    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveAttribute("data-skeleton");
    expect(box.style.width).toBe("2.5rem");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Avatar alt="Ada Lovelace" src="/avatar.png" />
        <Avatar alt="Grace Hopper" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});

describe("getInitials", () => {
  it("ilk ve son kelimenin baş harfi, Türkçe büyük harf", () => {
    expect(getInitials("Aykut Yılmaz")).toBe("AY");
    expect(getInitials("ilker ahmet işık")).toBe("İİ");
    expect(getInitials("  Ada  ")).toBe("A");
    expect(getInitials("")).toBe("");
  });
});

describe("AvatarGroup", () => {
  it("max'ı aşanları +N avatarında toplar ve boyutu çocuklara iletir", () => {
    render(
      <AvatarGroup max={2} size="sm">
        <Avatar alt="Ada Lovelace" />
        <Avatar alt="Grace Hopper" />
        <Avatar alt="Alan Turing" />
        <Avatar alt="Linus Torvalds" />
      </AvatarGroup>
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 kişi daha" })).toHaveTextContent("+2");
    expect(screen.queryByRole("img", { name: "Alan Turing" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ada Lovelace" }).style.width).toBe("1.5rem");
  });
});
