import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MegaPanel } from "./MegaPanel";
import type { MenuItemType } from "../types";
import { getA11yViolations } from "../../testUtils/a11y";

const richItems: MenuItemType[] = [
  {
    key: "computers",
    title: "Bilgisayarlar",
    children: [{ key: "laptop", title: "Laptop", children: [{ key: "lenovo", title: "Lenovo" }, { key: "asus", title: "Asus" }] }],
    promoTiles: [{ title: "Monitörler", image: "/monitor.png", href: "/promo/monitors" }],
  },
  { key: "phones", title: "Telefonlar", children: [{ key: "smartphones", title: "Akıllı Telefonlar", children: [{ key: "iphone", title: "iPhone" }] }] },
];

describe("MegaPanel", () => {
  it("ray öğesi seçilince (hover) kolonlar seçili öğenin children'ına göre değişir", async () => {
    const user = userEvent.setup();
    render(<MegaPanel items={richItems} layout="full" color="primary" onNavigate={() => {}} />);

    expect(screen.getByText("Lenovo")).toBeInTheDocument();
    expect(screen.queryByText("iPhone")).not.toBeInTheDocument();

    await user.hover(screen.getByRole("button", { name: "Telefonlar" }));
    expect(await screen.findByText("iPhone")).toBeInTheDocument();
    expect(screen.queryByText("Lenovo")).not.toBeInTheDocument();
  });

  it('layout="full" iken seçili ray öğesinde promoTiles varsa promosyon render edilir', () => {
    render(<MegaPanel items={richItems} layout="full" color="primary" onNavigate={() => {}} />);
    expect(screen.getByRole("button", { name: "Monitörler" })).toBeInTheDocument();
  });

  it('layout="compact" iken promoTiles OLSA BİLE promosyon hiç render edilmez', () => {
    render(<MegaPanel items={richItems} layout="compact" color="primary" onNavigate={() => {}} />);
    expect(screen.queryByRole("button", { name: "Monitörler" })).not.toBeInTheDocument();
  });

  it("seçili ray öğesinin children'ı yoksa kolon alanı hiç render edilmez, sadece ray görünür", () => {
    const leafOnly: MenuItemType[] = [{ key: "campaigns", title: "Kampanyalar", route: "/campaigns" }];
    render(<MegaPanel items={leafOnly} layout="full" color="primary" onNavigate={() => {}} />);
    expect(screen.getByText("Kampanyalar")).toBeInTheDocument();
  });

  it("ray öğesine tıklamak kendi route'uyla onNavigate'i çağırır", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const leafOnly: MenuItemType[] = [{ key: "campaigns", title: "Kampanyalar", route: "/campaigns" }];
    render(<MegaPanel items={leafOnly} layout="full" color="primary" onNavigate={onNavigate} />);
    await user.click(screen.getByRole("button", { name: "Kampanyalar" }));
    expect(onNavigate).toHaveBeenCalledWith("/campaigns");
  });

  it('kolonda 6dan fazla leaf varsa "Daha Fazla Gör" ile kapatılır, tıklanınca tümü görünür', async () => {
    const user = userEvent.setup();
    const many: MenuItemType[] = [
      {
        key: "rail",
        title: "Ray",
        children: [{ key: "col", title: "Kolon", children: Array.from({ length: 9 }, (_, i) => ({ key: `leaf-${i}`, title: `Leaf ${i}` })) }],
      },
    ];
    render(<MegaPanel items={many} layout="full" color="primary" onNavigate={() => {}} />);
    expect(screen.queryByText("Leaf 8")).not.toBeInTheDocument();
    expect(screen.getByText("Leaf 5")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Daha Fazla Gör" }));
    expect(screen.getByText("Leaf 8")).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<MegaPanel items={richItems} layout="full" color="primary" onNavigate={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
