import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import type { MenuItemType } from "../types";
import { getA11yViolations } from "../../testUtils/a11y";

const data: MenuItemType[] = [
  { key: "home", title: "Panel", route: "/dashboard" },
  {
    key: "services",
    title: "Hizmetler",
    children: [{ key: "web-dev", title: "Web Geliştirme", route: "/services/web" }],
  },
];

describe("Sidebar", () => {
  it("sarmalayıcı tam viewport genişliğini KAPLAMAZ — arkasındaki içerik tıklanabilir kalır (Faz 13.5 kritik bulgu — eskiden `w-full` görünmez bir tıklama-engelleyici katman oluşturuyordu)", () => {
    const { container } = render(<Sidebar data={data} onNavigate={() => {}} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/(^|\s)w-full(\s|$)/);
  });

  it("bir öğeye tıklayınca onNavigate kendi route'uyla çağrılır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar data={data} onNavigate={onNavigate} />);
    await user.click(screen.getByRole("link", { name: "Panel" }));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("variant=\"click\" iken tetikleyici düğme aria-label taşır (ikon-only düğme, Faz 13.5 bulgusu)", () => {
    render(<Sidebar data={data} onNavigate={() => {}} variant="click" />);
    expect(screen.getByRole("button", { name: /Kenar çubuğunu (aç|kapat)/ })).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Sidebar data={data} onNavigate={() => {}} variant="click" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("heading öğesi inert render edilir — tıklanamaz, buton değildir", () => {
    const headingData: MenuItemType[] = [{ key: "section-1", title: "Kategoriye Göre Alışveriş Yap", heading: true }, ...data];
    render(<Sidebar data={headingData} onNavigate={() => {}} />);
    // Daraltılmış rayda (varsayılan hover) görsel olarak ayraç, metin sr-only olarak DOM'da.
    const heading = screen.getByText("Kategoriye Göre Alışveriş Yap");
    expect(heading.closest("li")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Kategoriye Göre Alışveriş Yap" })).not.toBeInTheDocument();
  });

  it("header prop'u verilen ReactNode'u nav listesinin ÜSTÜNDE render eder", () => {
    render(<Sidebar data={data} onNavigate={() => {}} header={<div>Merhaba, aykut</div>} />);
    expect(screen.getByText("Merhaba, aykut")).toBeInTheDocument();
  });

  it("dropdown=true + 3 seviyelik veri: satırın yanında gruplu panel açılır, iç seviye kendi flyout'uyla", async () => {
    const user = userEvent.setup();
    const richData: MenuItemType[] = [
      {
        key: "products",
        title: "Ürünler",
        children: [{ key: "computers", title: "Bilgisayarlar", children: [{ key: "laptop", title: "Laptop", children: [{ key: "lenovo", title: "Lenovo" }] }] }],
      },
    ];
    render(<Sidebar data={richData} onNavigate={() => {}} dropdown />);
    await user.hover(screen.getByRole("button", { name: "Ürünler" }));
    expect(await screen.findByText("Bilgisayarlar")).toBeInTheDocument();
    await user.hover(await screen.findByRole("button", { name: /Laptop/ }));
    expect(await screen.findByText("Lenovo")).toBeInTheDocument();
  });

  const nested: MenuItemType[] = [
    { key: "home", title: "Panel", route: "/dashboard" },
    {
      key: "products",
      title: "Ürünler",
      children: [
        { key: "list", title: "Ürün Listesi", route: "/products" },
        { key: "cats", title: "Kategoriler", route: "/products/categories" },
      ],
    },
  ];

  it("akordeon: üst öğe aria-expanded taşır, kapalıyken alt satırlar Tab sırasının dışındadır", async () => {
    const user = userEvent.setup();
    render(<Sidebar data={nested} onNavigate={() => {}} variant="click" />);
    const parent = screen.getByRole("button", { name: "Ürünler" });
    const child = screen.getByRole("link", { name: "Ürün Listesi", hidden: true });
    expect(parent).toHaveAttribute("aria-expanded", "false");
    expect(child).toHaveAttribute("tabindex", "-1");

    await user.click(parent);
    expect(parent).toHaveAttribute("aria-expanded", "true");
    expect(child).not.toHaveAttribute("tabindex");
  });

  it("currentPath: aktif yaprak aria-current='page', grubu başlangıçta açık", () => {
    render(<Sidebar data={nested} onNavigate={() => {}} variant="click" currentPath="/products/categories" />);
    expect(screen.getByRole("link", { name: "Kategoriler" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Ürünler" })).toHaveAttribute("aria-expanded", "true");
  });

  it("iç seviyedeki bir öğeye tıklamak üst grubun aktifliğini de günceller (aktif anahtar tek yerde)", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar data={nested} onNavigate={onNavigate} variant="click" />);
    await user.click(screen.getByRole("button", { name: "Ürünler" }));
    await user.click(screen.getByRole("link", { name: "Kategoriler" }));
    expect(onNavigate).toHaveBeenCalledWith("/products/categories");
    expect(screen.getByRole("link", { name: "Kategoriler" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Ürünler" }).className).toMatch(/text-mari-primary/);
  });

  it("hover rayı klavye odağıyla da genişler (eskiden Tab'la gezen kullanıcı kesik etiketler görüyordu)", async () => {
    const user = userEvent.setup();
    const { container } = render(<Sidebar data={nested} onNavigate={() => {}} variant="hover" />);
    const aside = container.querySelector("aside") as HTMLElement;
    expect(aside.className).toMatch(/\bw-16\b/);
    await user.tab();
    expect(aside.className).toMatch(/\bw-64\b/);
  });

  it("variant='click': sekme aria-expanded/aria-controls ile sidebar'ı açar", async () => {
    const user = userEvent.setup();
    const { container } = render(<Sidebar data={nested} onNavigate={() => {}} variant="click" />);
    const toggle = screen.getByRole("button", { name: "Kenar çubuğunu aç" });
    expect(toggle).toHaveAttribute("aria-controls", container.querySelector("aside")?.id);
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Kenar çubuğunu kapat" })).toHaveAttribute("aria-expanded", "true");
  });

  it("mega: 3 seviyeli veride gruplar doğrudan kolon olur (ray değil); Escape paneli kapatır", async () => {
    const user = userEvent.setup();
    const megaData: MenuItemType[] = [
      {
        key: "products",
        title: "Ürünler",
        children: [
          { key: "catalog", title: "Katalog", children: [{ key: "brands", title: "Markalar", route: "/brands" }] },
          { key: "inventory", title: "Envanter", children: [{ key: "stock", title: "Stok Durumu", route: "/stock" }] },
        ],
      },
    ];
    render(<Sidebar data={megaData} onNavigate={() => {}} variant="click" mega />);
    await user.hover(screen.getByRole("button", { name: "Ürünler" }));
    const panel = await screen.findByRole("region", { name: "Ürünler" });
    // Kolon başlığı + bağlantılar görünür; rayın "seçili değilse gizli" davranışı yok.
    expect(within(panel).getByText("Katalog")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Markalar" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Stok Durumu" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: "Ürünler" })).not.toBeInTheDocument();
  });

  it("mega: satırda Enter odağı panelin ilk öğesine taşır", async () => {
    const user = userEvent.setup();
    const flat: MenuItemType[] = [{ key: "orders", title: "Siparişler", children: [{ key: "all", title: "Tüm Siparişler", route: "/orders" }] }];
    render(<Sidebar data={flat} onNavigate={() => {}} variant="click" mega />);
    screen.getByRole("button", { name: "Siparişler" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("link", { name: /Tüm Siparişler/ })).toHaveFocus();
  });

  it("variant='drawer': kontrollü dialog — header, bölüm başlıkları; Escape onOpenChange(false) çağırır", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const drawerData: MenuItemType[] = [{ key: "h", title: "Trendler", heading: true }, ...nested];
    const { rerender } = render(<Sidebar data={drawerData} onNavigate={() => {}} variant="drawer" open={false} onOpenChange={onOpenChange} header={<span>Merhaba, aykut</span>} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Sidebar data={drawerData} onNavigate={() => {}} variant="drawer" open onOpenChange={onOpenChange} header={<span>Merhaba, aykut</span>} />);
    const dialog = screen.getByRole("dialog", { name: "Ana menü" });
    expect(within(dialog).getByText("Merhaba, aykut")).toBeInTheDocument();
    expect(within(dialog).getByText("Trendler")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe("Faz 15.5", () => {
    const megaData: MenuItemType[] = [
      { key: "orders", title: "Siparişler", children: [{ key: "all", title: "Tüm Siparişler", route: "/orders" }] },
      { key: "reports", title: "Raporlar", route: "/reports" },
    ];

    it("mega: Tab ile odaklanınca panel açılmaz; → açar ve odağı panele taşır, Escape satıra döndürür", async () => {
      const user = userEvent.setup();
      render(<Sidebar data={megaData} onNavigate={() => {}} variant="click" mega />);
      const row = screen.getByRole("button", { name: "Siparişler" });
      row.focus();
      expect(row).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("region")).not.toBeInTheDocument();

      await user.keyboard("{ArrowRight}");
      expect(await screen.findByRole("link", { name: "Tüm Siparişler" })).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(row).toHaveFocus();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("mega: dışarı tıklamak paneli kapatır", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Sidebar data={megaData} onNavigate={() => {}} variant="click" mega />
          <button type="button">Dışarı</button>
        </div>
      );
      await user.hover(screen.getByRole("button", { name: "Siparişler" }));
      expect(await screen.findByRole("region", { name: "Siparişler" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Dışarı" }));
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("satırlar arasında ↓/↑/End ile gezilir", async () => {
      const user = userEvent.setup();
      render(<Sidebar data={megaData} onNavigate={() => {}} variant="click" />);
      screen.getByRole("button", { name: "Siparişler" }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("link", { name: "Raporlar" })).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: "Siparişler" })).toHaveFocus();
    });

    it("yaprak satırlar gerçek link; target=_blank güvenli rel taşır ve onNavigate'e devredilmez", async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();
      render(<Sidebar onNavigate={onNavigate} variant="click" data={[{ key: "docs", title: "Dokümanlar", route: "https://docs.example.com", target: "_blank" }]} />);
      const link = screen.getByRole("link", { name: "Dokümanlar (yeni sekmede açılır)" });
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      link.addEventListener("click", (event) => event.preventDefault());
      await user.click(link);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("logoHref → adlandırılmış link; logo tek başına etkileşimsiz", () => {
      const { rerender } = render(<Sidebar data={data} onNavigate={() => {}} variant="click" logo={<svg data-testid="logo" />} logoHref="/" />);
      expect(screen.getByRole("link", { name: "Ana sayfa" })).toHaveAttribute("href", "/");
      rerender(<Sidebar data={data} onNavigate={() => {}} variant="click" logo={<svg data-testid="logo" />} />);
      expect(screen.getByTestId("logo").closest("a, button")).toBeNull();
    });

    it("skeleton: satırlar ve logo yer tutucudur, odaklanılamaz; nav aria-busy", async () => {
      const { container } = render(<Sidebar data={data} onNavigate={() => {}} variant="click" logo={<span>Logo</span>} logoHref="/" skeleton />);
      expect(screen.getByRole("navigation", { name: "Ana menü" })).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hizmetler" })).not.toBeInTheDocument();
      expect(await getA11yViolations(container)).toEqual([]);
    });
  });
});
