import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("color verilmediyse dinlenme (işaretsiz) halinde nötr/gri kenarlık taşır, mavi değil (Faz 13 kullanıcı geri bildirimi)", () => {
    render(<Checkbox label="Kabul ediyorum" />);
    const checkbox = screen.getByRole("checkbox");
    const classes = checkbox.className.split(" ");
    expect(classes).toContain("border-mari-input");
    // Not: "checked:border-mari-primary-border" ayrı bir sınıf — burada
    // aranan tam olarak ÖNEKSİZ (dinlenme halindeki) sürüm.
    expect(classes).not.toContain("border-mari-primary-border");
  });

  it("işaretlenince kenarlık primary'e döner (checked: önekli, sadece işaretliyken uygulanır)", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Kabul ediyorum" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.className).toContain("checked:border-mari-primary-border");
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("color=\"error\" AÇIKÇA verildiyse dinlenme halinde de o renk kalıcıdır", () => {
    render(<Checkbox label="Zorunlu alan" color="error" />);
    expect(screen.getByRole("checkbox").className).toContain("border-mari-error-border");
  });

  it("label varsayılan olarak boyut ölçeğinden bir font-size taşır (eskiden ambient/büyük boyuttaydı)", () => {
    render(<Checkbox label="Kabul ediyorum" />);
    expect(screen.getByText("Kabul ediyorum").className).toContain("text-sm");
  });

  it("description rengi işaretli durumdan bağımsız hep nötr/muted (Radio ile tutarlı)", () => {
    render(<Checkbox label="Bildirimler" description="E-posta ile bilgilendirilirsiniz" />);
    expect(screen.getByText("E-posta ile bilgilendirilirsiniz").className).toContain("text-mari-muted");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Checkbox label="Kabul ediyorum" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
