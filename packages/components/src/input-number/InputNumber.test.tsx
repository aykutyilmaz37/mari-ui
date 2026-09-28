import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InputNumber } from "./InputNumber";
import { getA11yViolations } from "../testUtils/a11y";

const spin = () => screen.getByRole("spinbutton");

afterEach(() => vi.useRealTimers());

describe("InputNumber", () => {
  it("odak dışında tr-TR biçimli, odakta ayraçsız düzenlenebilir; aria-valuetext önek/sonekle", async () => {
    const user = userEvent.setup();
    render(<InputNumber aria-label="Tutar" defaultValue={1234.5} precision={2} suffix="₺" />);
    expect(spin()).toHaveValue("1.234,50");
    expect(spin()).toHaveAttribute("aria-valuenow", "1234.5");
    expect(spin()).toHaveAttribute("aria-valuetext", "1.234,50 ₺");
    await user.click(spin());
    expect(spin()).toHaveValue("1234,50");
  });

  it("yazarken onChange ayrıştırılmış sayıyla; harf girmez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Adet" onChange={onChange} />);
    await user.type(spin(), "12a,5");
    expect(spin()).toHaveValue("12,5");
    expect(onChange).toHaveBeenLastCalledWith(12.5);
  });

  it("\"12.5\" alışkanlığı ondalık, \"1.234\" binlik anlaşılır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Değer" onChange={onChange} />);
    await user.type(spin(), "12.5");
    expect(onChange).toHaveBeenLastCalledWith(12.5);
    await user.clear(spin());
    await user.type(spin(), "1.234");
    expect(onChange).toHaveBeenLastCalledWith(1234);
  });

  it("min/max yazarken engellemez, alandan çıkınca sınıra çeker", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Yaş" min={18} max={99} onChange={onChange} />);
    await user.type(spin(), "150");
    expect(onChange).toHaveBeenLastCalledWith(150);
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(99);
    expect(spin()).toHaveValue("99");
  });

  it("anlamsız metin blur'da son geçerli değere döner; boşaltmak null", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Değer" defaultValue={5} onChange={onChange} />);
    await user.clear(spin());
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.type(spin(), ",,");
    await user.tab();
    expect(spin()).toHaveValue("");
  });

  it("klavye: ↑/↓ adım, Shift ×10, PageUp ×10, Home/End min/max, kayan nokta artığı yok", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Oran" defaultValue={0.2} step={0.1} min={0} max={5} onChange={onChange} />);
    await user.click(spin());
    await user.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenLastCalledWith(0.3);
    expect(spin()).toHaveValue("0,3");
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith(1.3);
    await user.keyboard("{PageDown}");
    expect(onChange).toHaveBeenLastCalledWith(0.3);
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith(5);
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("düğmeler: bir basış bir adım, basılı tutunca tekrarlar; sınırda devre dışı", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Kişi" defaultValue={1} min={1} max={20} onChange={onChange} />);
    const inc = screen.getByRole("button", { name: "Artır" });
    expect(screen.getByRole("button", { name: "Azalt" })).toBeDisabled();
    fireEvent.pointerDown(inc);
    expect(onChange).toHaveBeenLastCalledWith(2);
    act(() => {
      vi.advanceTimersByTime(400 + 70 * 3);
    });
    fireEvent.pointerUp(inc);
    const last = onChange.mock.calls.at(-1)![0] as number;
    expect(last).toBeGreaterThanOrEqual(5);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChange.mock.calls.at(-1)![0]).toBe(last);
    vi.useRealTimers();
  });

  it("düğmeler Tab sırasında değil (↑/↓ var); odağı alandan almaz", async () => {
    const user = userEvent.setup();
    render(
      <>
        <InputNumber aria-label="Adet" defaultValue={1} />
        <button>Sonraki</button>
      </>
    );
    await user.click(spin());
    await user.tab();
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
  });

  it("disabled / readOnly: adım atılamaz", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber aria-label="Adet" defaultValue={3} readOnly onChange={onChange} />);
    await user.click(spin());
    await user.keyboard("{ArrowUp}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Artır" })).toBeDisabled();
  });

  it("native form: name ile biçimli değer gönderilir; color=error → aria-invalid", () => {
    const { container } = render(
      <form>
        <InputNumber name="qty" aria-label="Adet" defaultValue={3} color="error" />
      </form>
    );
    expect(new FormData(container.querySelector("form")!).get("qty")).toBe("3");
    expect(spin()).toHaveAttribute("aria-invalid", "true");
  });

  it("skeleton: etkileşimsiz, Input'la aynı yükseklik", () => {
    const { container } = render(<InputNumber aria-label="Adet" skeleton size="lg" />);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain("h-10");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <InputNumber aria-label="Fiyat" defaultValue={1499.9} precision={2} prefix="₺" min={0} />
        <InputNumber aria-label="İndirim" defaultValue={15} suffix="%" min={0} max={100} controls={false} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
