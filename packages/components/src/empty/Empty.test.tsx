import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Empty } from "./Empty";

describe("Empty", () => {
  it("başlık varsayılan olarak başlık etiketi değil (kart/tablo içinde hiyerarşiyi bozmasın); titleAs ile değişir", () => {
    const { rerender } = render(<Empty title="Sipariş yok" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    rerender(<Empty title="Sipariş yok" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "Sipariş yok" })).toBeInTheDocument();
  });

  it("onClick/href olmadan buttonText devre dışı bir buton ÇİZMEZ", () => {
    render(<Empty title="Boş" buttonText="Tekrar dene" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("href verilince eylem bir bağlantıdır", () => {
    render(<Empty title="Boş" buttonText="Alışverişe başla" href="/urunler" />);
    expect(screen.getByRole("link", { name: "Alışverişe başla" })).toHaveAttribute("href", "/urunler");
  });

  it("actions verilince buttonText yok sayılır", () => {
    render(<Empty title="Boş" buttonText="Tek" onClick={() => {}} actions={<button type="button">Özel</button>} />);
    expect(screen.getByRole("button", { name: "Özel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tek" })).not.toBeInTheDocument();
  });

  it("skeleton: metin yok, gizli", () => {
    const { container } = render(<Empty title="Sipariş yok" skeleton />);
    expect(screen.queryByText("Sipariş yok")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Empty title="Sipariş yok" description="İlk siparişiniz burada listelenir." buttonText="Keşfet" onClick={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
