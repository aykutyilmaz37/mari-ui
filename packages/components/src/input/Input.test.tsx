import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Input } from "./Input";

describe("Input", () => {
  it("varsayılan olarak aria-invalid taşımaz", () => {
    render(<Input placeholder="Ad" aria-label="Ad" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("color=\"error\" iken otomatik aria-invalid=\"true\" ekler (Faz 13 — doğrulama durumu ekran okuyucuya da bildirilir)", () => {
    render(<Input placeholder="E-posta" aria-label="E-posta" color="error" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("tüketici kendi aria-invalid'ini verirse o kazanır", () => {
    render(<Input placeholder="Ad" aria-label="Ad" color="error" aria-invalid={false} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false");
  });

  it("name/required/aria-label gibi native attribute'ları geçirir (eskiden Input bunları hiç desteklemiyordu)", () => {
    render(<Input aria-label="Kullanıcı adı" name="username" required />);
    const input = screen.getByRole("textbox", { name: "Kullanıcı adı" });
    expect(input).toHaveAttribute("name", "username");
    expect(input).toBeRequired();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Input aria-label="Arama" placeholder="Ara..." />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
