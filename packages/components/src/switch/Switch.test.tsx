import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("label metnine tıklamak switch'i değiştirir (Faz 13 — eskiden label sadece dekoratifti)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Bildirimler" onChange={onChange} />);
    await user.click(screen.getByText("Bildirimler"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("label, switch'in erişilebilir adı olarak bağlıdır", () => {
    render(<Switch label="Bildirimler" />);
    expect(screen.getByRole("switch", { name: "Bildirimler" })).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Switch label="Bildirimler" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
