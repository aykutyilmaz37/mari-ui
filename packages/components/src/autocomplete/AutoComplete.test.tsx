import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { AutoComplete } from "./AutoComplete";
import type { Option } from "./types";

const options: Option[] = [
  { id: 1, value: "Ahmet" },
  { id: 2, value: "Aykut" },
  { id: 3, value: "Furkan" },
];

describe("AutoComplete", () => {
  it("input role=\"combobox\" taşır ve başlangıçta kapalıdır (Faz 13 — eskiden hiçbir ARIA rolü yoktu)", () => {
    render(<AutoComplete options={options} />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("Ok Aşağı ile listeyi açar ve seçenekleri vurgular, Enter ile seçer", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AutoComplete options={options} onSelect={onSelect} />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    await user.keyboard("{ArrowDown}");
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Ahmet" })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Aykut");
  });

  it("Escape listeyi kapatır", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    await user.keyboard("{ArrowDown}{Escape}");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("fare ile bir seçeneğe tıklamak da seçimi tetikler", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AutoComplete options={options} onSelect={onSelect} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Furkan" }));
    expect(onSelect).toHaveBeenCalledWith("Furkan");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<AutoComplete options={options} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("Türkçe ve aksansız arar: 'istanbul' → İstanbul, 'sisli' → Şişli", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[{ id: 1, value: "İstanbul" }, { id: 2, value: "Şişli" }, { id: 3, value: "Ankara" }]} />);
    const box = screen.getByRole("combobox");
    await user.type(box, "istanbul");
    expect(screen.getByRole("option", { name: "İstanbul" })).toBeInTheDocument();
    await user.clear(box);
    await user.type(box, "sisli");
    expect(screen.getByRole("option", { name: "Şişli" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Ankara" })).not.toBeInTheDocument();
  });

  it("eşleşen kısım vurgulanır", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[{ id: 1, value: "Kadıköy" }]} />);
    await user.type(screen.getByRole("combobox"), "köy");
    expect(screen.getByRole("option").querySelector("mark")).toHaveTextContent("köy");
  });

  it("temizle gerçek, adlandırılmış bir buton; alan boşken görünmez", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[]} defaultValue="Ada" />);
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByRole("button", { hidden: true, name: "Temizle" })).not.toHaveClass("visible");
  });

  it("notFoundContent eşleşme yokken gösterilir", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[{ id: 1, value: "Ankara" }]} notFoundContent="Sonuç bulunamadı" />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Sonuç bulunamadı")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });

  it("liste yüksekliği sınırlı ve kaydırılabilir", () => {
    render(<AutoComplete options={[{ id: 1, value: "Ankara" }]} />);
    expect(screen.getByRole("listbox", { hidden: true })).toHaveClass("max-h-64", "overflow-y-auto");
  });
});
