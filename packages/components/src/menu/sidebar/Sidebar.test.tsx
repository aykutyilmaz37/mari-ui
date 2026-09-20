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
});
