import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListIcon } from "lucide-react";
import { Segmented } from "./Segmented";
import { getA11yViolations } from "../testUtils/a11y";

describe("Segmented", () => {
  it("radiogroup + radyolar; varsayılan ilk etkin seçenek seçili", () => {
    render(<Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} />);
    expect(screen.getByRole("radiogroup", { name: "Dönem" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gün" })).toBeChecked();
  });

  it("tıklayınca seçer, onChange değerle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} onChange={onChange} />);
    await user.click(screen.getByText("Ay"));
    expect(onChange).toHaveBeenCalledWith("Ay");
    expect(screen.getByRole("radio", { name: "Ay" })).toBeChecked();
  });

  it("ok tuşları seçimi taşır, disabled atlanır; Tab gruba tek durakla girer", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Segmented
          aria-label="Plan"
          options={[{ value: "free", label: "Ücretsiz" }, { value: "pro", label: "Pro", disabled: true }, { value: "team", label: "Ekip" }]}
          onChange={onChange}
        />
        <button>Sonraki</button>
      </>
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "Ücretsiz" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Ekip" })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith("team");
    await user.tab();
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
  });

  it("native form: name ile seçili değer gönderilir", () => {
    const { container } = render(
      <form>
        <Segmented aria-label="Görünüm" name="view" options={["liste", "kart"]} defaultValue="kart" />
      </form>
    );
    expect(new FormData(container.querySelector("form")!).get("view")).toBe("kart");
  });

  it("yalnız ikonlu seçenek aria-label ile adlanır", () => {
    render(<Segmented aria-label="Görünüm" options={[{ value: "list", icon: <ListIcon />, "aria-label": "Liste görünümü" }, "Kart"]} />);
    expect(screen.getByRole("radio", { name: "Liste görünümü" })).toBeInTheDocument();
  });

  it("disabled: hiçbir seçenek seçilemez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented aria-label="Dönem" options={["Gün", "Hafta"]} disabled onChange={onChange} />);
    await user.click(screen.getByText("Hafta"));
    expect(onChange).not.toHaveBeenCalled();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("skeleton: etkileşimsiz, gerçek dilimler görünmez yer tutucu", () => {
    const { container } = render(<Segmented aria-label="Dönem" options={["Gün", "Hafta"]} skeleton />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Segmented aria-label="Dönem" options={["Gün", "Hafta", "Ay"]} defaultValue="Hafta" />
        <Segmented aria-label="Görünüm" options={[{ value: "list", icon: <ListIcon />, "aria-label": "Liste" }, { value: "grid", label: "Kart" }]} size="sm" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
