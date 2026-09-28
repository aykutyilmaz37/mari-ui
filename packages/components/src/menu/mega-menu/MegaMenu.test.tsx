import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MegaMenu } from "./MegaMenu";
import type { MenuItemType } from "../types";
import { getA11yViolations } from "../../testUtils/a11y";

const data: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/home" },
  {
    key: "services",
    title: "Hizmetler",
    children: [{ key: "web-dev", title: "Web Geliştirme", route: "/services/web", description: "Açıklama" }],
  },
];

describe("MegaMenu", () => {
  it("bir öğeye tıklayınca onNavigate kendi route'uyla çağrılır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<MegaMenu data={data} onNavigate={onNavigate} />);
    await user.click(screen.getByRole("link", { name: "Ana Sayfa" }));
    expect(onNavigate).toHaveBeenCalledWith("/home");
  });

  it("Tab ile gezerken panel kendiliğinden açılmaz; Enter açar ve odağı panelin ilk öğesine taşır, Escape odağı tetikleyiciye döndürür", async () => {
    const user = userEvent.setup();
    render(<MegaMenu data={data} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Hizmetler" });
    trigger.focus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Web Geliştirme")).not.toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = await screen.findByRole("region", { name: "Hizmetler" });
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    await waitFor(() => expect(within(panel).getAllByRole("link")[0]).toHaveFocus());

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("↓ paneli açar; panelin son öğesinden Tab bir sonraki üst öğeye geçip paneli kapatır", async () => {
    const user = userEvent.setup();
    const twoMenus: MenuItemType[] = [...data, { key: "contact", title: "İletişim", route: "/contact" }];
    render(<MegaMenu data={twoMenus} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Hizmetler" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const panel = await screen.findByRole("region", { name: "Hizmetler" });
    const links = within(panel).getAllByRole("link");
    await waitFor(() => expect(links[0]).toHaveFocus());
    links.at(-1)?.focus();
    await user.tab();
    expect(screen.getByRole("link", { name: "İletişim" })).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("fareyle hover'da açılan panel, ardından tetikleyiciye tıklayınca KAPANMAZ; dışarı tıklamak kapatır", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MegaMenu data={data} onNavigate={() => {}} />
        <button type="button">Dışarı</button>
      </div>
    );
    const trigger = screen.getByRole("button", { name: "Hizmetler" });
    await user.hover(trigger);
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Dışarı" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("currentPath: üst öğe vurgulanır, panel açılınca ray o kategoriyle gelir ve link aria-current taşır", async () => {
    const user = userEvent.setup();
    const rich: MenuItemType[] = [
      {
        key: "electronics",
        title: "Elektronik",
        children: [
          { key: "phones", title: "Telefonlar", children: [{ key: "ios", title: "iOS", children: [{ key: "iphone", title: "iPhone", route: "/iphone" }] }] },
          { key: "computers", title: "Bilgisayarlar", children: [{ key: "laptop", title: "Laptop", children: [{ key: "lenovo", title: "Lenovo", route: "/lenovo" }] }] },
        ],
      },
    ];
    render(<MegaMenu data={rich} onNavigate={() => {}} currentPath="/lenovo" />);
    const trigger = screen.getByRole("button", { name: "Elektronik" });
    expect(trigger.className).toContain("after:scale-x-100");
    await user.hover(trigger);
    expect(await screen.findByRole("link", { name: "Lenovo" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByText("iPhone")).not.toBeInTheDocument();
  });

  it("klavyeyle açınca odak aktif sayfanın ray kategorisine gider (ilk öğeye değil — ön seçimi ezmesin)", async () => {
    const user = userEvent.setup();
    const rich: MenuItemType[] = [
      {
        key: "electronics",
        title: "Elektronik",
        children: [
          { key: "phones", title: "Telefonlar", children: [{ key: "ios", title: "iOS", children: [{ key: "iphone", title: "iPhone", route: "/iphone" }] }] },
          { key: "computers", title: "Bilgisayarlar", children: [{ key: "laptop", title: "Laptop", children: [{ key: "lenovo", title: "Lenovo", route: "/lenovo" }] }] },
        ],
      },
    ];
    render(<MegaMenu data={rich} onNavigate={() => {}} currentPath="/lenovo" />);
    screen.getByRole("button", { name: "Elektronik" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: "Bilgisayarlar" })).toHaveFocus());
    expect(screen.getByRole("link", { name: "Lenovo" })).toBeInTheDocument();
  });

  it("kapalı panel görünmezdir (invisible) — linkleri Tab sırasına girmez", async () => {
    const user = userEvent.setup();
    render(<MegaMenu data={data} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Hizmetler" });
    await user.click(trigger);
    const panel = await screen.findByRole("region", { name: "Hizmetler" });
    await user.keyboard("{Escape}");
    expect(panel).toHaveClass("invisible");
  });

  it("skeleton: öğeler yer tutucudur, panel açılamaz", () => {
    render(<MegaMenu data={data} onNavigate={() => {}} skeleton />);
    expect(screen.queryByRole("button", { name: "Hizmetler" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("üst öğe düğmesi gerçek bir <button>dır, iç içe etkileşimli eleman yok", () => {
    render(<MegaMenu data={data} onNavigate={() => {}} />);
    const trigger = screen.getByRole("button", { name: /Hizmetler/ });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.closest('[role="menuitem"]')).toBeNull();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<MegaMenu data={data} onNavigate={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("3 seviyelik veri MegaPanel'i (ray + kolon leaf'i) render eder", async () => {
    const user = userEvent.setup();
    const richData: MenuItemType[] = [
      {
        key: "electronics",
        title: "Elektronik",
        children: [{ key: "computers", title: "Bilgisayarlar", children: [{ key: "laptop", title: "Laptop", children: [{ key: "lenovo", title: "Lenovo" }] }] }],
      },
    ];
    render(<MegaMenu data={richData} onNavigate={() => {}} />);
    await user.hover(screen.getByRole("button", { name: "Elektronik" }));
    expect(await screen.findByText("Bilgisayarlar")).toBeInTheDocument();
    expect(await screen.findByText("Lenovo")).toBeInTheDocument();
  });

  it("promosyon kartına tıklamak onNavigate'i kendi href'iyle çağırır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const richData: MenuItemType[] = [
      {
        key: "electronics",
        title: "Elektronik",
        children: [{ key: "computers", title: "Bilgisayarlar", promoTiles: [{ title: "Monitörler", image: "/monitor.png", href: "/promo/monitors" }] }],
      },
    ];
    render(<MegaMenu data={richData} onNavigate={onNavigate} />);
    await user.hover(screen.getByRole("button", { name: "Elektronik" }));
    await user.click(await screen.findByRole("link", { name: "Monitörler" }));
    expect(onNavigate).toHaveBeenCalledWith("/promo/monitors");
  });
});
