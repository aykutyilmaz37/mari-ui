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

  it("eylem yalnız actions ile çizilir; yoksa eylem alanı da yok", () => {
    const { rerender, container } = render(<Empty title="Boş" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.firstElementChild!.children).toHaveLength(2);
    rerender(<Empty title="Boş" actions={<button type="button">Tekrar dene</button>} />);
    expect(screen.getByRole("button", { name: "Tekrar dene" })).toBeInTheDocument();
  });

  it("skeleton: metin yok, gizli", () => {
    const { container } = render(<Empty title="Sipariş yok" skeleton />);
    expect(screen.queryByText("Sipariş yok")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Empty title="Sipariş yok" description="İlk siparişiniz burada listelenir." actions={<button type="button">Keşfet</button>} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
