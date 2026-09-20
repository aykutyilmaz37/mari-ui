import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BasicMenu } from "./BasicMenu";
import type { MenuItemType } from "../types";
import { getA11yViolations } from "../../testUtils/a11y";

const data: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/home" },
  { key: "about", title: "Hakkımızda", route: "/about" },
  {
    key: "services",
    title: "Hizmetler",
    children: [{ key: "web-dev", title: "Web Geliştirme", route: "/services/web" }],
  },
];

describe("BasicMenu", () => {
  it("bir öğeye tıklayınca onNavigate kendi route'uyla çağrılır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<BasicMenu data={data} onNavigate={onNavigate} />);
    await user.click(screen.getByRole("button", { name: "Hakkımızda" }));
    expect(onNavigate).toHaveBeenCalledWith("/about");
  });

  it("currentPath verilirse eşleşen öğe başlangıçta aktiftir (Faz 13.5 kullanıcı bulgusu — eskiden currentPath hiç kullanılmıyordu)", () => {
    render(<BasicMenu data={data} onNavigate={() => {}} currentPath="/about" />);
    expect(screen.getByRole("button", { name: "Hakkımızda" }).className).toMatch(/text-mari/);
  });

  it("children'ı olan öğenin alt menü tetikleyicisi tek bir gerçek <button>dır (iç içe etkileşimli eleman yok)", () => {
    render(<BasicMenu data={data} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: /Hizmetler/ });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.querySelector('[role="menuitem"]')).toBeNull();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<BasicMenu data={data} onNavigate={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
