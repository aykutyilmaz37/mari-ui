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

  it("düz (1 seviyelik) children'ı olan öğe satır listesi açar; satıra tıklamak gider ve paneli kapatır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<BasicMenu data={data} onNavigate={onNavigate} />);
    await user.click(screen.getByRole("button", { name: "Hizmetler" }));
    await user.click(await screen.findByRole("button", { name: "Web Geliştirme" }));
    expect(onNavigate).toHaveBeenCalledWith("/services/web");
    expect(screen.queryByRole("button", { name: "Web Geliştirme" })).not.toBeInTheDocument();
  });

  it("alt menü tetikleyicisi açıkken aria-expanded=true taşır (gösterge + chevron bu duruma bağlı)", async () => {
    const user = userEvent.setup();
    render(<BasicMenu data={data} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Hizmetler" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("çocukların kendi çocukları varsa panel başlıklı gruplar olarak açılır (grup başlığı + satır)", async () => {
    const user = userEvent.setup();
    const groupedData: MenuItemType[] = [
      {
        key: "products",
        title: "Ürünler",
        children: [
          { key: "electronics", title: "Elektronik", children: [{ key: "phones", title: "Telefonlar", route: "/phones" }] },
          { key: "clothing", title: "Giyim", children: [{ key: "women", title: "Kadın", route: "/women" }] },
        ],
      },
    ];
    render(<BasicMenu data={groupedData} onNavigate={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Ürünler" }));
    expect(await screen.findByText("Elektronik")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Telefonlar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kadın" })).toBeInTheDocument();
  });

  it("alt menü göstergesi kenarlık değil primary renkli ayrı bir çubuktur", () => {
    render(<BasicMenu data={data} onNavigate={() => {}} currentPath="/about" />);
    const active = screen.getByRole("button", { name: "Hakkımızda" });
    expect(active.className).toContain("after:bg-mari-primary");
    expect(active.className).not.toMatch(/border-b-2/);
  });
});
