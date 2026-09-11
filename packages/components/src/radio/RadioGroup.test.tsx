import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { RadioGroup } from "./RadioGroup";

const options = ["A", "B", "C"];

describe("RadioGroup", () => {
  it("role=\"radiogroup\" taşır (Faz 13 — eskiden gruplandığı ekran okuyucuya hiç duyurulmuyordu)", () => {
    render(<RadioGroup name="grp" options={options} aria-label="Seçenekler" />);
    expect(screen.getByRole("radiogroup", { name: "Seçenekler" })).toBeInTheDocument();
  });

  it("bir seçeneğe tıklamak onChange'i o değerle tetikler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup name="grp" options={options} onChange={onChange} aria-label="Seçenekler" />);
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("B");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<RadioGroup name="grp" options={options} aria-label="Seçenekler" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
