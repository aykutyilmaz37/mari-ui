import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";
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

  it("erişilebilirlik ihlali içermez — ne düz ne tıklanabilir halde (axe-core, Faz 9)", async () => {
    const plain = render(<Card>İçerik</Card>);
    expect(await getA11yViolations(plain.container)).toEqual([]);
    plain.unmount();

    const clickable = render(<Card onClick={() => {}}>Tıklanabilir</Card>);
    expect(await getA11yViolations(clickable.container)).toEqual([]);
  });
});
