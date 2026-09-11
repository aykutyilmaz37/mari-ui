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
});
