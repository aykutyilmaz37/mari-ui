import { fireEvent, render, screen } from "@testing-library/react";
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
    await user.click(screen.getByRole("link", { name: "Hakkımızda" }));
    expect(onNavigate).toHaveBeenCalledWith("/about");
  });

  it("currentPath verilirse eşleşen öğe başlangıçta aktiftir (Faz 13.5 kullanıcı bulgusu — eskiden currentPath hiç kullanılmıyordu)", () => {
    render(<BasicMenu data={data} onNavigate={() => {}} currentPath="/about" />);
    expect(screen.getByRole("link", { name: "Hakkımızda" }).className).toMatch(/text-mari/);
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
    await user.click(await screen.findByRole("link", { name: "Web Geliştirme" }));
    expect(onNavigate).toHaveBeenCalledWith("/services/web");
    expect(screen.queryByRole("link", { name: "Web Geliştirme" })).not.toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Telefonlar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kadın" })).toBeInTheDocument();
  });

  it("alt menü göstergesi kenarlık değil primary renkli ayrı bir çubuktur", () => {
    render(<BasicMenu data={data} onNavigate={() => {}} currentPath="/about" />);
    const active = screen.getByRole("link", { name: "Hakkımızda" });
    expect(active.className).toContain("after:bg-mari-primary");
    expect(active.className).not.toMatch(/border-b-2/);
  });

  it("iç içe flyout kendi ÇOCUKLARINI gösterir (eskiden prop sırası yüzünden üst öğeyi tekrar ediyordu)", async () => {
    const user = userEvent.setup();
    const nestedData: MenuItemType[] = [
      {
        key: "products",
        title: "Ürünler",
        children: [
          { key: "list", title: "Ürün Listesi", route: "/products" },
          { key: "stock", title: "Stok", children: [{ key: "warehouses", title: "Depolar", route: "/warehouses" }] },
        ],
      },
    ];
    render(<BasicMenu data={nestedData} onNavigate={() => {}} />);
    await user.hover(screen.getByRole("button", { name: /Ürünler/ }));
    await user.hover(await screen.findByRole("button", { name: /Stok/ }));
    expect(await screen.findByRole("link", { name: /Depolar/ })).toBeInTheDocument();
    // Karışık veri gruplu görünüme geçmez: düz öğe kendi başlığıyla tekrar edilmez.
    expect(screen.getAllByText("Ürün Listesi")).toHaveLength(1);
  });

  describe("Faz 15.5", () => {
    it("öğeler <nav aria-label> içinde gerçek linklerdir; geçerli sayfa aria-current=page taşır", () => {
      render(<BasicMenu data={data} onNavigate={() => {}} currentPath="/about" />);
      const nav = screen.getByRole("navigation", { name: "Ana menü" });
      expect(nav.querySelectorAll("li")).toHaveLength(3);
      expect(screen.getByRole("link", { name: "Ana Sayfa" })).toHaveAttribute("href", "/home");
      expect(screen.getByRole("link", { name: "Hakkımızda" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Ana Sayfa" })).not.toHaveAttribute("aria-current");
    });

    it("değiştirici tuşlu tıklama (yeni sekme) onNavigate'e devredilmez, tarayıcıya bırakılır", () => {
      const onNavigate = vi.fn();
      render(<BasicMenu data={data} onNavigate={onNavigate} />);
      const link = screen.getByRole("link", { name: "Hakkımızda" });
      // jsdom gerçek sayfa geçişi yapamaz; tarayıcıya bırakılan tıklamanın varsayılanı burada susturulur.
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link, { metaKey: true });
      fireEvent.click(link, { ctrlKey: true });
      expect(onNavigate).not.toHaveBeenCalled();
      fireEvent.click(link);
      expect(onNavigate).toHaveBeenCalledWith("/about");
    });

    it("logo: logoHref → adlandırılmış link, onLogoClick → düğme, ikisi de yoksa etkileşimsiz", () => {
      const logo = <svg data-testid="logo" />;
      const { rerender } = render(<BasicMenu data={data} logo={logo} logoHref="/" onNavigate={() => {}} />);
      expect(screen.getByRole("link", { name: "Ana sayfa" })).toHaveAttribute("href", "/");

      const onLogoClick = vi.fn();
      rerender(<BasicMenu data={data} logo={logo} onLogoClick={onLogoClick} logoLabel="Mari'ye dön" onNavigate={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: "Mari'ye dön" }));
      expect(onLogoClick).toHaveBeenCalled();

      rerender(<BasicMenu data={data} logo={logo} onNavigate={() => {}} />);
      expect(screen.getByTestId("logo").closest("a, button")).toBeNull();
    });

    it("sticky/fixed konumda çubuk z-mari-sticky katmanındadır", () => {
      const { container, rerender } = render(<BasicMenu data={data} onNavigate={() => {}} />);
      expect(container.firstElementChild).not.toHaveClass("z-mari-sticky");
      rerender(<BasicMenu data={data} menuPosition="sticky" onNavigate={() => {}} />);
      expect(container.firstElementChild).toHaveClass("sticky", "z-mari-sticky");
    });

    it("skeleton: öğeler, logo ve actions yer tutucudur; hiçbiri odaklanılamaz", async () => {
      const { container } = render(
        <BasicMenu data={data} logo={<span>Logo</span>} logoHref="/" actions={<button type="button">Giriş</button>} skeleton onNavigate={() => {}} />
      );
      expect(container.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Giriş" })).not.toBeInTheDocument();
      expect(await getA11yViolations(container)).toEqual([]);
    });

    it("target, reloadDocument ve dış adresli öğeler onNavigate'e devredilmez; _blank güvenli rel + 'yeni sekmede' duyurusu taşır", () => {
      const onNavigate = vi.fn();
      render(
        <BasicMenu
          onNavigate={onNavigate}
          data={[
            { key: "docs", title: "Dokümanlar", route: "/docs", target: "_blank" },
            { key: "blog", title: "Blog", route: "/blog", reloadDocument: true },
            { key: "gh", title: "GitHub", route: "https://github.com" },
            { key: "about", title: "Hakkımızda", route: "/about" },
          ]}
        />
      );
      const docs = screen.getByRole("link", { name: /Dokümanlar/ });
      expect(docs).toHaveAttribute("target", "_blank");
      expect(docs).toHaveAttribute("rel", "noopener noreferrer");
      expect(docs).toHaveAccessibleName("Dokümanlar (yeni sekmede açılır)");
      expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("target");

      for (const name of [/Dokümanlar/, "Blog", "GitHub"]) {
        const link = screen.getByRole("link", { name });
        link.addEventListener("click", (event) => event.preventDefault());
        fireEvent.click(link);
      }
      expect(onNavigate).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("link", { name: "Hakkımızda" }));
      expect(onNavigate).toHaveBeenCalledWith("/about");
    });
  });
});
