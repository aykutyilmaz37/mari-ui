import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("color verilmediyse dinlenme (seçilmemiş) halinde nötr/gri kenarlık taşır, mavi değil (Faz 13 kullanıcı geri bildirimi)", () => {
    render(<Radio label="Seçenek A" name="grp" />);
    const radio = screen.getByRole("radio");
    const classes = radio.className.split(" ");
    expect(classes).toContain("border-mari-input");
    expect(classes).not.toContain("border-mari-primary-border");
  });

  it("color=\"error\" AÇIKÇA verildiyse dinlenme halinde de o renk kalıcıdır", () => {
    render(<Radio label="Seçenek A" name="grp" color="error" />);
    expect(screen.getByRole("radio").className.split(" ")).toContain("border-mari-error");
  });

  it("label varsayılan olarak boyut ölçeğinden bir font-size taşır (eskiden ambient/büyük boyuttaydı)", () => {
    render(<Radio label="Seçenek A" name="grp" />);
    expect(screen.getByText("Seçenek A").className).toContain("text-sm");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Radio label="Seçenek A" name="grp" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
