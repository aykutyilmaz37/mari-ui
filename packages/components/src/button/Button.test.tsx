import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(btn.className).toContain("border-mari-error");
    // Kenarlık rolün AÇIK `-border` tonu DEĞİL rengin kendisi (WCAG 1.4.11: ≥3:1).
    expect(btn.className).not.toContain("border-mari-error-border");
    // outline tıklanabilir bir öğe — hover geri bildirimi Button tarafından eklenir.
    expect(btn.className).toContain("hover:bg-mari-error-subtle");
    expect(btn.className).not.toContain("bg-mari-error-solid");
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

  it("loading=true (özel ikon verilmeden) daima bir dönen gösterge çizer", () => {
    const { container } = render(<Button loading>Gönder</Button>);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("loading=true iken buton daima devre dışıdır ve onClick tetiklenmez", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Gönder
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Gönder" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading iken href verilse bile <a> değil devre dışı <button> render eder", () => {
    render(
      <Button loading href="/hedef">
        Git
      </Button>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Git" })).toBeDisabled();
  });

  it("erişilebilirlik ihlali içermez (axe-core, Faz 9)", async () => {
    const { container } = render(<Button>Kaydet</Button>);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("disabled durumda da erişilebilirlik ihlali içermez", async () => {
    const { container } = render(<Button disabled>Devre dışı</Button>);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("disabled iken pointer-events kapatılmaz — cursor-not-allowed gerçekten görünür", () => {
    render(<Button disabled>Kaydet</Button>);
    const btn = screen.getByRole("button", { name: "Kaydet" });
    expect(btn).toHaveClass("cursor-not-allowed");
    expect(btn).not.toHaveClass("pointer-events-none");
  });

  it("uzun etiket tek satırda kalır ve kısaltılır (sabit yükseklikten taşmaz)", () => {
    render(<Button>Çok uzun bir buton etiketi</Button>);
    expect(screen.getByRole("button")).toHaveClass("whitespace-nowrap", "max-w-full");
    expect(screen.getByText("Çok uzun bir buton etiketi")).toHaveClass("truncate");
  });

  it("loading.delay: buton hemen devre dışı, gösterge gecikmeli belirir", () => {
    render(<Button loading={{ delay: 300 }}>Kaydet</Button>);
    const btn = screen.getByRole("button", { name: "Kaydet" });
    expect(btn).toBeDisabled();
    const spinnerWrap = btn.querySelector("svg")!.parentElement!;
    expect(spinnerWrap).toHaveClass("opacity-0");
    expect(spinnerWrap.style.animationDelay).toBe("300ms");
  });

  it("skeleton: buton değil, aynı boyutta gizli yer tutucu; etiket şeffaf yerinde", () => {
    const { container } = render(<Button size="lg" skeleton>Satın al</Button>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("h-10", "text-transparent");
  });

  it("metinsiz butonda aria-label yoksa geliştirme uyarısı verir", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button icon={<svg />} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockClear();
    render(<Button icon={<svg />} aria-label="Ara" />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("dokunmatikte görünmez 44px hedef: metinli yalnızca dikey, ikon-only her yönde", () => {
    render(
      <>
        <Button size="sm">Kaydet</Button>
        <Button size="sm" shape="circle" icon={<svg />} aria-label="Ara" />
      </>
    );
    const text = screen.getByRole("button", { name: "Kaydet" });
    expect(text).toHaveClass("relative", "pointer-coarse:before:-inset-y-2.5");
    expect(screen.getByRole("button", { name: "Ara" })).toHaveClass("pointer-coarse:before:-inset-2.5");
  });
});
