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
    // Faz 15: işaretliyken kenarlık dolguyla aynı (-solid); açık -border tonu <3:1'di.
    expect(checkbox.className).toContain("checked:border-mari-primary-solid");
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("color=\"error\" AÇIKÇA verildiyse dinlenme halinde de o renk kalıcıdır", () => {
    render(<Checkbox label="Zorunlu alan" color="error" />);
    expect(screen.getByRole("checkbox").className.split(" ")).toContain("border-mari-error");
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

  it("indeterminate iken kutu dolgulu (eskiden boş görünüyordu) ve yatay çizgi gösterir", () => {
    const { container } = render(<Checkbox label="Tümünü seç" indeterminate />);
    const box = screen.getByRole("checkbox");
    expect(box.className.split(" ")).toContain("bg-mari-primary-solid");
    expect((box as HTMLInputElement).indeterminate).toBe(true);
    expect(container.querySelector(".h-0\\.5")).not.toBeNull();
  });

  it("çentik ikonu kutu boyutuyla orantılı", () => {
    const { container } = render(<Checkbox label="A" size="sm" defaultChecked />);
    expect(container.querySelector("svg")).toHaveClass("size-2.5");
  });

  it("pill şekli yatay dolgu almaz (kutu ovale dönüşmüyor)", () => {
    render(<Checkbox label="A" shape="pill" />);
    expect(screen.getByRole("checkbox")).not.toHaveClass("px-4");
  });

  it("açıklama aria-describedby ile bağlı", () => {
    render(<Checkbox label="Bülten" description="Haftada bir e-posta" />);
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("Haftada bir e-posta");
  });

  it("skeleton: checkbox yok, gizli yer tutucu; etiket şeffaf yerinde", () => {
    const { container } = render(<Checkbox label="Bülten" skeleton />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Bülten")).toHaveClass("text-transparent");
  });

  it("dokunmatik hedef satıra uygulanır", () => {
    render(<Checkbox label="A" />);
    expect(screen.getByText("A").parentElement!.className).toContain("pointer-coarse:before:-inset-y-3");
  });
});
