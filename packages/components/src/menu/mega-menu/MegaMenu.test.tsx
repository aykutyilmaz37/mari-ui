import { render, screen } from "@testing-library/react";
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
    await user.click(screen.getByRole("button", { name: "Ana Sayfa" }));
    expect(onNavigate).toHaveBeenCalledWith("/home");
  });

  it("üst öğe klavyeyle odaklanınca (mouse olmadan) alt panel açılır (Faz 13.5 kullanıcı bulgusu — eskiden sadece hover ile açılıyordu)", async () => {
    const user = userEvent.setup();
    render(<MegaMenu data={data} onNavigate={() => {}} />);
    expect(screen.queryByText("Web Geliştirme")).not.toBeInTheDocument();

    await user.tab();
    await user.tab();
    expect(await screen.findByText("Web Geliştirme")).toBeInTheDocument();
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
});
