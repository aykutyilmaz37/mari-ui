import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";
import { nearestThumb, snap, valueFromKey } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

// jsdom'da PointerEvent yok — clientX/Y taşıyan bir MouseEvent alt sınıfı yeterli.
beforeAll(() => {
  if (typeof window.PointerEvent === "undefined") {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    // @ts-expect-error — test ortamı için polyfill
    window.PointerEvent = PointerEventPolyfill;
  }
});

/** Ray kutusunu 0-200px genişliğinde varsay. */
function mockTrackRect(thumb: HTMLElement) {
  const area = thumb.parentElement as HTMLElement;
  area.getBoundingClientRect = () => ({ left: 0, right: 200, top: 0, bottom: 24, width: 200, height: 24, x: 0, y: 0, toJSON: () => ({}) });
  return area;
}

describe("snap / nearestThumb / valueFromKey", () => {
  it("step ızgarasına oturtur ve sınırlar; ondalık adımda kayan nokta artığı bırakmaz", () => {
    expect(snap(47, 0, 100, 5)).toBe(45);
    expect(snap(130, 0, 100, 5)).toBe(100);
    // 0.1 + 0.2 artığı temizlenmiş olmalı — metin olarak karşılaştır.
    expect(String(snap(0.1 + 0.2, 0, 1, 0.1))).toBe("0.3");
  });

  it("en yakın tutamacı seçer; üst üste binmişlerse işaretçinin yönündekini", () => {
    expect(nearestThumb([20, 80], 30)).toBe(0);
    expect(nearestThumb([20, 80], 70)).toBe(1);
    expect(nearestThumb([50, 50], 60)).toBe(1);
    expect(nearestThumb([50, 50], 40)).toBe(0);
  });

  it("PageUp aralığın %10'u kadar artırır, Home/End tutamacın kendi sınırına gider", () => {
    expect(valueFromKey("PageUp", 10, 0, 100, 1, 0, 100)).toBe(20);
    expect(valueFromKey("Home", 60, 30, 100, 1, 0, 100)).toBe(30);
    expect(valueFromKey("x", 1, 0, 100, 1, 0, 100)).toBeNull();
  });
});

describe("Slider", () => {
  it("role=slider + aria-valuenow/min/max/orientation taşır", () => {
    render(<Slider defaultValue={40} aria-label="Ses" />);
    const s = screen.getByRole("slider", { name: "Ses" });
    expect(s).toHaveAttribute("aria-valuenow", "40");
    expect(s).toHaveAttribute("aria-valuemin", "0");
    expect(s).toHaveAttribute("aria-valuemax", "100");
    expect(s).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("klavye: oklar step kadar, Home/End uçlara; onChangeEnd tuş bırakılınca", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(<Slider defaultValue={50} step={5} aria-label="Değer" onChange={onChange} onChangeEnd={onChangeEnd} />);
    const s = screen.getByRole("slider");
    s.focus();
    await user.keyboard("{ArrowRight}");
    expect(s).toHaveAttribute("aria-valuenow", "55");
    expect(onChange).toHaveBeenLastCalledWith(55);
    expect(onChangeEnd).toHaveBeenLastCalledWith(55);
    await user.keyboard("{End}");
    expect(s).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{ArrowRight}"); // sınırda: değişmez
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("aralık: iki tutamaç çizilir (eskiden sadece ilk değer çiziliyordu), adları en az/en çok", () => {
    render(<Slider defaultValue={[20, 80]} aria-label="Fiyat" />);
    const [lo, hi] = screen.getAllByRole("slider");
    expect(lo).toHaveAccessibleName("Fiyat en az");
    expect(hi).toHaveAccessibleName("Fiyat en çok");
    expect(lo).toHaveAttribute("aria-valuemax", "80");
    expect(hi).toHaveAttribute("aria-valuemin", "20");
  });

  it("aralık: tutamaçlar birbirini geçemez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={[40, 50]} step={10} aria-label="Fiyat" onChange={onChange} />);
    const [lo] = screen.getAllByRole("slider");
    lo?.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{End}");
    expect(lo).toHaveAttribute("aria-valuenow", "50");
    expect(onChange).toHaveBeenLastCalledWith([50, 50]);
  });

  it("raya basıp sürükleme: en yakın tutamaç gelir, bırakınca onChangeEnd", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(<Slider defaultValue={[20, 80]} aria-label="Fiyat" onChange={onChange} onChangeEnd={onChangeEnd} />);
    const [, hi] = screen.getAllByRole("slider");
    const area = mockTrackRect(hi as HTMLElement);

    fireEvent.pointerDown(area, { clientX: 140, button: 0, pointerId: 1 }); // %70 → sağ tutamaç
    expect(onChange).toHaveBeenLastCalledWith([20, 70]);
    expect(hi).toHaveFocus();
    fireEvent.pointerMove(area, { clientX: 190, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith([20, 95]);
    fireEvent.pointerUp(area, { clientX: 190, pointerId: 1 });
    expect(onChangeEnd).toHaveBeenCalledWith([20, 95]);
  });

  it("disabled iken işaretçi ve klavye yok sayılır, tutamaç Tab sırasında değil", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={30} disabled aria-label="Değer" onChange={onChange} />);
    const s = screen.getByRole("slider");
    expect(s).toHaveAttribute("tabindex", "-1");
    fireEvent.pointerDown(mockTrackRect(s), { clientX: 100, button: 0 });
    s.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("formatValue ekran okuyucuya aria-valuetext olarak verilir", () => {
    render(<Slider defaultValue={2500} min={0} max={10000} aria-label="Fiyat" formatValue={(v) => `${v.toLocaleString("tr-TR")} ₺`} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "2.500 ₺");
  });

  it("dikeyde aria-orientation=vertical", () => {
    render(<Slider defaultValue={40} vertical aria-label="Parlaklık" />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("erişilebilirlik ihlali içermez — tekil ve aralık (axe-core)", async () => {
    const { container } = render(
      <>
        <Slider defaultValue={40} aria-label="Ses" />
        <Slider defaultValue={[10, 60]} aria-label="Fiyat" showInput marks={{ 0: "0", 100: "100" }} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
