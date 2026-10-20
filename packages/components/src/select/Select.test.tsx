import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";
import type { SelectOption, SelectOptionGroup } from "./types";
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
const activeOptionName = () => {
  const id = combobox().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : null;
};

describe("Select", () => {
  it("kapalıyken listbox yok ve aria-controls verilmez; açılınca listbox'a bağlanır", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Şehir" options={cities} />);
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
    expect(combobox()).not.toHaveAttribute("aria-controls");
    await user.click(combobox());
    const listbox = screen.getByRole("listbox", { name: "Şehir" });
    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    expect(combobox()).toHaveAttribute("aria-controls", listbox.id);
  });

  it("klavye: ↓ açar, ↓/↑ disabled'ı atlar, Enter seçer ve kapatır, odak tetikleyicide kalır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Şehir" options={cities} onChange={onChange} />);
    combobox().focus();
    await user.keyboard("{ArrowDown}");
    expect(activeOptionName()).toBe("İstanbul");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    // İzmir'den sonra Bursa (disabled) atlanır.
    expect(activeOptionName()).toBe("Antalya");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("ant", cities[4]);
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
    expect(combobox()).toHaveTextContent("Antalya");
    expect(combobox()).toHaveFocus();
  });

  it("açarken seçili seçenek aktif olur; Escape seçmeden kapatır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Şehir" options={cities} defaultValue="izm" onChange={onChange} />);
    combobox().focus();
    await user.keyboard("{Enter}");
    expect(activeOptionName()).toBe("İzmir");
    expect(screen.getByRole("option", { name: "İzmir" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
  });

  it("harfle atlama: Türkçe/aksansız ('i' → İstanbul, tekrar 'i' → İzmir)", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Şehir" options={cities} />);
    combobox().focus();
    await user.keyboard("i");
    expect(activeOptionName()).toBe("İstanbul");
    await user.keyboard("i");
    expect(activeOptionName()).toBe("İzmir");
  });

  it("Tab tekli seçimde aktif seçeneği onaylar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Select aria-label="Şehir" options={cities} onChange={onChange} />
        <button>Sonraki</button>
      </>
    );
    combobox().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith("ank", cities[1]);
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
  });

  it("arama: yazdıkça Türkçe/aksansız süzer, ilk eşleşme aktif, bulunamayınca duyurur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Şehir" options={cities} showSearch onChange={onChange} />);
    await user.type(combobox(), "izmi");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["İzmir"]);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("izm", cities[2]);
    await user.type(combobox(), "xyz");
    expect(screen.getByRole("status")).toHaveTextContent("Sonuç bulunamadı");
  });

  it("gruplar role=group ve başlık adıyla", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Ürün" options={grouped} />);
    await user.click(combobox());
    const fruit = screen.getByRole("group", { name: "Meyve" });
    expect(within(fruit).getAllByRole("option").map((o) => o.textContent)).toEqual(["Elma", "Armut"]);
  });

  it("temizle: değeri boşaltır, odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Şehir" options={cities} defaultValue="ank" allowClear onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(onChange).toHaveBeenCalledWith(null, null);
    expect(combobox()).toHaveFocus();
    expect(combobox()).toHaveTextContent("Seçin");
  });

  it("native form: name ile gizli alan gönderilir", () => {
    const { container } = render(
      <form>
        <Select aria-label="Şehir" name="city" options={cities} defaultValue="ank" />
      </form>
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("city")).toEqual(["ank"]);
  });

  it("disabled: odaklanamaz ve açılmaz", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Şehir" options={cities} disabled />);
    await user.click(combobox());
    expect(combobox()).toBeDisabled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("label htmlFor ile adlanır (tetikleyici etiketlenebilir bir <button>)", () => {
    render(
      <>
        <label htmlFor="city">Şehir</label>
        <Select id="city" options={cities} />
      </>
    );
    expect(screen.getByRole("combobox", { name: "Şehir" })).toBeInTheDocument();
  });

  it("skeleton: etkileşimsiz yer tutucu, Input'la aynı geometri", () => {
    const { container } = render(<Select aria-label="Şehir" options={cities} skeleton size="lg" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild!.className).toContain("h-10");
  });

  it("erişilebilirlik ihlali içermez — kapalı ve açık (axe-core)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select aria-label="Şehir" options={cities} defaultValue="ank" allowClear />
        <Select aria-label="Ürün" showSearch options={grouped} defaultValue="elma" />
      </>
    );
    expect(await getA11yViolations(document.body)).toEqual([]);
    await user.click(screen.getAllByRole("combobox")[0]!);
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
