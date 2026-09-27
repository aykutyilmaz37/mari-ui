import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card, CardMeta } from "./Card";
import { getA11yViolations } from "../testUtils/a11y";

describe("Card", () => {
  it("onClick verilmezse hiçbir interaktiflik semantiği eklemez (düz kapsayıcı)", () => {
    render(<Card>İçerik</Card>);
    const card = screen.getByText("İçerik").parentElement;
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("onClick verilince klavyeyle erişilebilir hale gelir (Faz 9 — jsx-a11y'nin yakaladığı gerçek bug'ın regresyon testi)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Tıklanabilir kart</Card>);

    const card = screen.getByRole("button", { name: /tıklanabilir kart/i });
    expect(card).toHaveAttribute("tabindex", "0");

    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("fare tıklaması da hâlâ çalışır (klavye desteği mevcut olanı bozmadı)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Tıklanabilir kart</Card>);
    await user.click(screen.getByRole("button", { name: /tıklanabilir kart/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("href verilince kartın tamamı bir link olur ve varsayılan olarak hoverable'dır", () => {
    render(
      <Card href="/urun/42" title="Kulaklık">
        2.499 ₺
      </Card>
    );
    const link = screen.getByRole("link", { name: /Kulaklık/ });
    expect(link).toHaveAttribute("href", "/urun/42");
    expect(link.className).toContain("hover:shadow-mari-md");
  });

  it("target=_blank iken rel=noopener noreferrer eklenir", () => {
    render(
      <Card href="https://example.com" target="_blank">
        Dış link
      </Card>
    );
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hoverable gölgeyi sadece üzerine gelince verir (eskiden her zaman veriyordu)", () => {
    const { container } = render(<Card hoverable>İçerik</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("hover:shadow-mari-md");
    expect(card.className.split(" ")).not.toContain("shadow-mari-sm");
  });

  it("actions eşit bölünmüş bir liste olarak render edilir", () => {
    render(<Card actions={[<button key="e">Düzenle</button>, <button key="s">Sil</button>]}>İçerik</Card>);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sil" })).toBeInTheDocument();
  });

  it("skeleton iken içerik yerine iskelet gösterilir, başlık korunur", () => {
    render(
      <Card title="Gelir" skeleton>
        Gizli içerik
      </Card>
    );
    expect(screen.getByText("Gelir")).toBeInTheDocument();
    expect(screen.queryByText("Gizli içerik")).not.toBeInTheDocument();
  });

  it("eski `loading` adı skeleton'ın takma adı olarak çalışmaya devam eder", () => {
    render(
      <Card title="Gelir" loading>
        Gizli içerik
      </Card>
    );
    expect(screen.queryByText("Gizli içerik")).not.toBeInTheDocument();
  });

  it("CardMeta avatar, başlık ve açıklama gösterir", () => {
    render(<CardMeta avatar={<span>AY</span>} title="Aykut Yılmaz" description="Geliştirici" />);
    expect(screen.getByText("Aykut Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("Geliştirici")).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez — ne düz ne tıklanabilir halde (axe-core, Faz 9)", async () => {
    const plain = render(<Card>İçerik</Card>);
    expect(await getA11yViolations(plain.container)).toEqual([]);
    plain.unmount();

    const clickable = render(<Card onClick={() => {}}>Tıklanabilir</Card>);
    expect(await getA11yViolations(clickable.container)).toEqual([]);
  });
});
