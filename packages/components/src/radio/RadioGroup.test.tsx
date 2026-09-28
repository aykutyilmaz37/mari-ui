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

  it("name verilmese de radyolar tek grup (ortak otomatik ad) — ok tuşlarıyla gezinme için", () => {
    render(<RadioGroup aria-label="Kargo" options={["Standart", "Hızlı"]} />);
    const [a, b] = screen.getAllByRole("radio");
    expect(a!.getAttribute("name")).toBeTruthy();
    expect(a!.getAttribute("name")).toBe(b!.getAttribute("name"));
  });

  it("dikey yerleşim ve seçenek açıklaması", () => {
    render(<RadioGroup aria-label="Kargo" orientation="vertical" options={[{ label: "Hızlı", value: "h", description: "Yarın kapında" }]} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByRole("radio")).toHaveAccessibleDescription("Yarın kapında");
  });

  it("solid varyantta SEÇİLMEMİŞ radio dolu değil (eskiden hepsi seçili görünüyordu)", () => {
    render(<RadioGroup aria-label="Plan" variant="solid" options={["Aylık", "Yıllık"]} defaultValue="Aylık" />);
    const unchecked = screen.getByRole("radio", { name: "Yıllık" });
    const classes = unchecked.className.split(" ");
    expect(classes).not.toContain("bg-mari-primary-solid");
    expect(classes).toContain("checked:bg-mari-primary-solid");
  });

  it("skeleton: radyolar yerine yer tutucular, grup aria-busy", () => {
    render(<RadioGroup aria-label="Kargo" options={["Standart", "Hızlı"]} skeleton />);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-busy", "true");
  });
});
