import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./Breadcrumb";
import { getA11yViolations } from "../testUtils/a11y";

describe("Breadcrumb", () => {
  it("son öğe aria-current=\"page\" taşır (Faz 13.5 — plan denetiminde bulunan eksiklik)", () => {
    render(
      <Breadcrumb
        items={[
          { title: "Ana Sayfa", href: "/" },
          { title: "Ürün", href: "/urun" },
        ]}
      />
    );
    const last = screen.getByRole("link", { name: "Ürün" });
    expect(last).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Ana Sayfa" })).not.toHaveAttribute("aria-current");
  });

  it("ayırıcı aria-hidden taşır (ekran okuyucu okumamalı)", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { title: "A", href: "/a" },
          { title: "B", href: "/b" },
        ]}
      />
    );
    const separator = container.querySelector('[aria-hidden="true"]');
    expect(separator).toHaveTextContent("/");
  });

  it("href olmayan ama onClick olan öğe gerçek bir button olarak render edilir ve klavyeyle tetiklenebilir (Faz 13.5 kullanıcı bulgusu — eskiden klavyeyle erişilemeyen bir span role=none idi)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ title: "Panel", onClick }]} />);

    const button = screen.getByRole("button", { name: "Panel" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { title: "Ana Sayfa", href: "/" },
          { title: "Panel", onClick: () => {} },
          { title: "Ürün" },
        ]}
      />
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
