import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";
import { getA11yViolations } from "../testUtils/a11y";

describe("Tag", () => {
  it("kapatma butonu erişilebilir bir isme sahiptir (Faz 13.4 — eskiden ikon-only, isimsizdi)", () => {
    render(<Tag onClose={() => {}}>Etiket</Tag>);
    expect(screen.getByRole("button", { name: "Kaldır" })).toBeInTheDocument();
  });

  it("onClose verilmezse kapatma butonu render edilmez", () => {
    render(<Tag>Etiket</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("kapatma butonu klavyeyle tetiklenebilir", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tag onClose={onClose}>Etiket</Tag>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Kaldır" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Tag onClose={() => {}}>Etiket</Tag>);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
