import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect";
import type { SelectOption, SelectOptionGroup } from "../select/types";
import { getA11yViolations } from "../testUtils/a11y";

const cities: SelectOption[] = [
  { value: "ist", label: "İstanbul" },
  { value: "ank", label: "Ankara" },
  { value: "izm", label: "İzmir" },
  { value: "brs", label: "Bursa", disabled: true },
  { value: "ant", label: "Antalya" },
];

const grouped: SelectOptionGroup[] = [
  { label: "Meyve", options: [{ value: "elma", label: "Elma" }, { value: "armut", label: "Armut" }] },
  { label: "Sebze", options: [{ value: "havuc", label: "Havuç" }] },
];

const combobox = () => screen.getByRole("combobox");

describe("MultiSelect", () => {
  it("seçim listeyi açık tutar, etiket olur, etiket kaldırılır, Backspace son etiketi siler", async () => {
    const user = userEvent.setup();
    function Multi() {
      const [value, setValue] = useState<(string | number)[]>([]);
      return <MultiSelect aria-label="Şehirler" showSearch options={cities} value={value} onChange={(v) => setValue(v)} />;
    }
    render(<Multi />);
    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "Ankara" }));
    await user.click(screen.getByRole("option", { name: "İzmir" }));
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "Ankara" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: "Ankara seçimini kaldır" }));
    expect(screen.queryByRole("button", { name: "Ankara seçimini kaldır" })).not.toBeInTheDocument();
    combobox().focus();
    await user.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "İzmir seçimini kaldır" })).not.toBeInTheDocument();
  });

  it("onChange değer dizisi ve seçenek nesneleriyle çağrılır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect aria-label="Şehirler" options={cities} defaultValue={["ist"]} onChange={onChange} />);
    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "Ankara" }));
    expect(onChange).toHaveBeenCalledWith(["ist", "ank"], [cities[0], cities[1]]);
  });

  it("maxTagCount: fazlası +N etiketi olur", () => {
    render(<MultiSelect aria-label="Şehirler" options={cities} defaultValue={["ist", "ank", "izm"]} maxTagCount={1} />);
    expect(screen.getByText("İstanbul")).toBeInTheDocument();
    expect(screen.queryByText("Ankara")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("disabled: etiketlerde kaldırma düğmesi yok", () => {
    render(<MultiSelect aria-label="Şehirler" options={cities} defaultValue={["ist"]} disabled />);
    expect(screen.queryByRole("button", { name: "İstanbul seçimini kaldır" })).not.toBeInTheDocument();
  });

  it("native form: name ile her değer için gizli alan gönderilir", () => {
    const { container } = render(
      <form>
        <MultiSelect aria-label="Şehirler" name="city" options={cities} defaultValue={["ist", "ank"]} />
      </form>
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("city")).toEqual(["ist", "ank"]);
  });

  it("erişilebilirlik ihlali içermez — kapalı ve açık (axe-core)", async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="Ürünler" showSearch options={grouped} defaultValue={["elma"]} />);
    expect(await getA11yViolations(document.body)).toEqual([]);
    await user.click(combobox());
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
