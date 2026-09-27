import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("Enter'a basınca onSearch değerle çağrılır (eskiden sadece tıklamada)", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Ürün ara" onSearch={onSearch} />);
    await user.type(screen.getByRole("textbox"), "kulaklık{Enter}");
    expect(onSearch).toHaveBeenCalledWith("kulaklık");
  });

  it("ara butonu adlandırılmış ve tıklanınca onSearch çağrılır", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Ürün ara" onSearch={onSearch} defaultValue="mouse" />);
    await user.click(screen.getByRole("button", { name: "Ara" }));
    expect(onSearch).toHaveBeenCalledWith("mouse");
  });

  it("mobil klavyede Enter 'Ara' etiketli; loading iken aria-busy", () => {
    render(<SearchInput aria-label="Ürün ara" loading />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("enterkeyhint", "search");
    expect(input).toHaveAttribute("aria-busy", "true");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<SearchInput aria-label="Ürün ara" allowClear defaultValue="a" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
