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

  it("maxItems aşılınca ortadaki öğeler \"…\" düğmesine katlanır, basınca hepsi açılır", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb
        maxItems={3}
        items={[
          { title: "A", href: "/a" },
          { title: "B", href: "/b" },
          { title: "C", href: "/c" },
          { title: "D", href: "/d" },
          { title: "E" },
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: "B" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "C" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "D" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 gizli yolu göster" }));
    expect(screen.getByRole("link", { name: "B" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "C" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /gizli yolu/ })).not.toBeInTheDocument();
  });

  it("menu verilen öğe açılır menü tetikleyicisidir; kardeş sayfalar gerçek link olarak listelenir", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb
        items={[
          { title: "Elektronik", href: "/elektronik" },
          { title: "Bilgisayar", menu: { items: [{ title: "Telefon", href: "/telefon" }, { title: "TV", href: "/tv" }] } },
          { title: "Laptop" },
        ]}
      />
    );
    const trigger = screen.getByRole("button", { name: "Bilgisayar" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Telefon" })).toHaveAttribute("href", "/telefon");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("itemRender'a o öğeye kadar biriken path'ler verilir", () => {
    const seen: string[][] = [];
    render(
      <Breadcrumb
        items={[
          { title: "A", path: "a" },
          { title: "B", path: "b" },
          { title: "C", path: "c" },
        ]}
        itemRender={(route, _p, _r, paths) => {
          seen.push(paths);
          return <span>{route.title}</span>;
        }}
      />
    );
    expect(seen).toEqual([["a"], ["a", "b"], ["a", "b", "c"]]);
  });

  it("skeleton: öğeler aria-hidden ve etkileşimsiz, gerçek içerik görünmez olarak yerinde kalır", async () => {
    const { container } = render(
      <Breadcrumb
        skeleton
        items={[
          { title: "Ana Sayfa", href: "/" },
          { title: "Ürün" },
        ]}
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const slots = container.querySelectorAll("li > [aria-hidden].grid");
    expect(slots).toHaveLength(2);
    expect(container.querySelector("a")?.parentElement).toHaveClass("invisible");
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("target=_blank öğe güvenli rel taşır ve yeni sekmede açıldığını duyurur", () => {
    render(<Breadcrumb items={[{ title: "Yardım", href: "https://yardim.example.com", target: "_blank" }, { title: "SSS" }]} />);
    const link = screen.getByRole("link", { name: "Yardım (yeni sekmede açılır)" });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
