import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MenuItemType } from "../types";
import { getA11yViolations } from "../../testUtils/a11y";
import { MobileNav } from "./MobileNav";

const data: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/home" },
  {
    key: "electronics",
    title: "Elektronik",
    route: "/c/elektronik",
    children: [
      {
        key: "computers",
        title: "Bilgisayar",
        children: [{ key: "laptop", title: "Laptop", route: "/c/laptop" }],
        promoTiles: [{ title: "Monitörler", image: "/m.png", href: "/c/monitor" }],
      },
      { key: "phones", title: "Telefon", route: "/c/telefon" },
    ],
  },
];

function renderNav(props: Partial<React.ComponentProps<typeof MobileNav>> = {}) {
  const onNavigate = vi.fn();
  render(<MobileNav data={data} color="primary" breakpoint="lg" onNavigate={onNavigate} {...props} />);
  return { onNavigate, user: userEvent.setup() };
}

describe("MobileNav", () => {
  it("hamburger çekmeceyi açar: aria-expanded güncellenir, odak çekmeceye taşınır", async () => {
    const { user } = renderNav();
    const toggle = screen.getByRole("button", { name: "Menüyü aç" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(toggle);
    const dialog = screen.getByRole("dialog", { name: "Ana menü" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("çocuğu olan satır bir seviye içeri girer; geri düğmesi önceki seviyeye döner ve odağı girilen satıra verir", async () => {
    const { user } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Elektronik" }));
    expect(within(dialog).getByRole("button", { name: "Bilgisayar" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: "Ana Sayfa" })).not.toBeInTheDocument();
    const back = within(dialog).getByRole("button", { name: "Ana Menü" });
    expect(back).toHaveFocus();

    await user.click(back);
    expect(within(dialog).getByRole("button", { name: "Elektronik" })).toHaveFocus();
  });

  it("derin seviyede geri etiketi bir önceki seviyenin başlığıdır ve promosyon kartları gösterilir", async () => {
    const { user } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Elektronik" }));
    await user.click(within(dialog).getByRole("button", { name: "Bilgisayar" }));

    expect(within(dialog).getByRole("button", { name: "Elektronik" })).toHaveFocus();
    expect(within(dialog).getByRole("button", { name: "Monitörler" })).toBeInTheDocument();
  });

  it("yaprak öğe onNavigate'i çağırır ve çekmeceyi kapatır; odak hamburger'e döner", async () => {
    const { user, onNavigate } = renderNav();
    const toggle = screen.getByRole("button", { name: "Menüyü aç" });
    await user.click(toggle);
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Ana Sayfa" }));

    expect(onNavigate).toHaveBeenCalledWith("/home");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("route'u olan üst seviyede 'Tümünü gör' o route'a gider", async () => {
    const { user, onNavigate } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Elektronik" }));
    await user.click(within(dialog).getByRole("link", { name: "Tümünü gör" }));
    expect(onNavigate).toHaveBeenCalledWith("/c/elektronik");
  });

  it("Escape çekmeceyi kapatır ve sayfa kaydırma kilidini geri alır", async () => {
    const { user } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Menüyü aç" })).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("Tab odağı çekmecenin içinde döndürür", async () => {
    const { user } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = screen.getByRole("dialog");
    const buttons = within(dialog).getAllByRole("button");
    buttons[buttons.length - 1]?.focus();

    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.tab({ shift: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();
  });

  it("currentPath'e karşılık gelen yaprak aria-current='page' taşır", async () => {
    const { user } = renderNav({ currentPath: "/home" });
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(within(screen.getByRole("dialog")).getByRole("link", { name: "Ana Sayfa" })).toHaveAttribute("aria-current", "page");
  });

  it("açık çekmecede axe ihlali yok", async () => {
    const { user } = renderNav();
    await user.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
