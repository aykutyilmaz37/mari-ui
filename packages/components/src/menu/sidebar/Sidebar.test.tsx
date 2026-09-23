import { render, screen } from "@testing-library/react";
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
    await user.click(screen.getByRole("button", { name: "Panel" }));
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
    const heading = screen.getByText("Kategoriye Göre Alışveriş Yap");
    expect(heading.tagName).toBe("LI");
    expect(screen.queryByRole("button", { name: "Kategoriye Göre Alışveriş Yap" })).not.toBeInTheDocument();
  });

  it("header prop'u verilen ReactNode'u nav listesinin ÜSTÜNDE render eder", () => {
    render(<Sidebar data={data} onNavigate={() => {}} header={<div>Merhaba, aykut</div>} />);
    expect(screen.getByText("Merhaba, aykut")).toBeInTheDocument();
  });

  it("dropdown=true + 3 seviyelik veri MegaPanel içeriğini (ray + kolon başlığı) render eder", async () => {
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
    expect(await screen.findByText("Lenovo")).toBeInTheDocument();
  });
});
