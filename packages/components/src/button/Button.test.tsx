import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { getA11yViolations } from "../testUtils/a11y";

describe("Button", () => {
  it("varsayılan color=primary, variant=solid render eder", () => {
    render(<Button>Kaydet</Button>);
    const btn = screen.getByRole("button", { name: "Kaydet" });
    expect(btn.className).toContain("bg-mari-primary-solid");
  });

  it("color+variant kombinasyonuna göre doğru class'ları üretir", () => {
    render(
      <Button color="error" variant="outline">
        Sil
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Sil" });
    expect(btn.className).toContain("text-mari-error");
    expect(btn.className).toContain("border-mari-error-border");
    expect(btn.className).not.toContain("bg-mari-error-solid");
  });

  it("eski `type` prop'unu yeni `color`'a çevirir (deprecated alias çalışıyor)", () => {
    render(<Button type="secondary">Eski API</Button>);
    const btn = screen.getByRole("button", { name: "Eski API" });
    // secondary -> neutral
    expect(btn.className).toContain("bg-mari-neutral-solid");
  });

  it('eski `type="text"` prop\'unu variant="ghost"a çevirir', () => {
    render(<Button type="text">Ghost</Button>);
    const btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).not.toContain("bg-mari-primary-solid");
    expect(btn.className).toContain("text-mari-primary");
  });

  it("eski `variant=\"outlined\"` değerini `outline`a çevirir", () => {
    render(<Button variant="outlined">Eski Variant</Button>);
    const btn = screen.getByRole("button", { name: "Eski Variant" });
    expect(btn.className).toContain("border-mari-primary-border");
  });

  it("disabled iken onClick tetiklenmez", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Devre dışı
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Devre dışı" });
    expect(btn).toBeDisabled();
  });

  it("href verildiğinde <a> render eder", () => {
    render(
      <Button href="/hedef" target="_blank">
        Git
      </Button>
    );
    const link = screen.getByRole("link", { name: "Git" });
    expect(link).toHaveAttribute("href", "/hedef");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("loading=true iken children yerine loading ikonunu gösterir", () => {
    render(
      <Button loading={{ icon: <span data-testid="spinner" /> }}>Gönder</Button>
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core, Faz 9)", async () => {
    const { container } = render(<Button>Kaydet</Button>);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("disabled durumda da erişilebilirlik ihlali içermez", async () => {
    const { container } = render(<Button disabled>Devre dışı</Button>);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
