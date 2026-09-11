import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("color=\"error\" iken otomatik aria-invalid=\"true\" ekler", () => {
    render(<Textarea aria-label="Açıklama" color="error" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("name/required/aria-label geçirir", () => {
    render(<Textarea aria-label="Açıklama" name="description" required />);
    const textarea = screen.getByRole("textbox", { name: "Açıklama" });
    expect(textarea).toHaveAttribute("name", "description");
    expect(textarea).toBeRequired();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Textarea aria-label="Mesaj" placeholder="Mesajınız..." />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
