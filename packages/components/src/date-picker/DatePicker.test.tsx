import { useState } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import { getA11yViolations } from "../testUtils/a11y";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
const D = (y: number, m: number, d: number, H = 0, i = 0) => new Date(y, m - 1, d, H, i);

describe("DatePicker", () => {
  it("combobox + dialog; tıklayınca açılır, gün tıklaması seçer ve kapatır; odak alanda kalır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker aria-label="Doğum tarihi" defaultValue={D(2026, 10, 14)} onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Doğum tarihi" });
    expect(input).toHaveValue("14.10.2026");
    expect(input).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(input);
    await nextFrame();
    const dialog = screen.getByRole("dialog", { name: "Tarih seç" });
    expect(input).toHaveAttribute("aria-controls", dialog.id);
    await user.click(within(dialog).getByRole("gridcell", { name: /^20 Ekim 2026/ }));
    expect(onChange).toHaveBeenCalledWith(D(2026, 10, 20), "20.10.2026");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(input).toHaveFocus();
  });

  it("yazarak giriş: geçerli metin Enter'da uygulanır; geçersiz geri alınır; boş temizler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker aria-label="Tarih" defaultValue={D(2026, 1, 1)} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.clear(input);
    await user.type(input, "5/3/2026{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(D(2026, 3, 5), "05.03.2026");
    expect(input).toHaveValue("05.03.2026");
    await user.clear(input);
    await user.type(input, "31.02.2026{Enter}");
    expect(input).toHaveValue("05.03.2026");
    await user.clear(input);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(null, "");
  });

  it("klavye: ↓ odağı takvime taşır, ok + Enter seçer; Escape kapatıp alana döner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker aria-label="Tarih" defaultValue={D(2026, 10, 14)} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    expect(screen.getByRole("gridcell", { name: /^14 Ekim 2026/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenCalledWith(D(2026, 10, 15), "15.10.2026");
    expect(input).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(input).toHaveFocus();
  });

  it("disabledDate / minDate: seçilemez; yazılsa da kabul edilmez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker aria-label="Tarih" defaultValue={D(2026, 10, 14)} minDate={D(2026, 10, 10)} disabledDate={(d) => d.getDay() === 0} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await nextFrame();
    await user.click(screen.getByRole("gridcell", { name: /^18 Ekim 2026 Pazar/ }));
    await user.click(screen.getByRole("gridcell", { name: /^9 Ekim 2026/ }));
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "01.10.2026{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("aralık: iki alan, iki ay; başlangıç sonra bitiş; ters sırada yer değiştirir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker range aria-label="Konaklama" defaultValue={[D(2026, 10, 5), D(2026, 10, 8)]} onChange={onChange} />);
    const group = screen.getByRole("group", { name: "Konaklama" });
    const [start, end] = within(group).getAllByRole("combobox");
    expect(start).toHaveAccessibleName("Başlangıç");
    expect(end).toHaveValue("08.10.2026");
    await user.click(start!);
    await nextFrame();
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(screen.getByRole("gridcell", { name: /^6 Ekim 2026/ })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("gridcell", { name: /^20 Ekim 2026/ }));
    // Başlangıç bitişten sonra → bitiş yeniden seçilir.
    expect(end).toHaveValue("");
    await user.click(screen.getByRole("gridcell", { name: /^12 Ekim 2026/ }));
    expect(onChange).toHaveBeenCalledWith([D(2026, 10, 12), D(2026, 10, 20)], ["12.10.2026", "20.10.2026"]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("datetime: gün + saat taslakta kalır, 'Tamam' ile uygulanır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker mode="datetime" aria-label="Toplantı" defaultValue={D(2026, 10, 14, 9, 0)} minuteStep={15} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await nextFrame();
    await user.click(screen.getByRole("gridcell", { name: /^16 Ekim 2026/ }));
    const hours = screen.getByRole("listbox", { name: "Saat" });
    await user.click(within(hours).getByRole("option", { name: "14" }));
    const minutes = screen.getByRole("listbox", { name: "Dakika" });
    expect(within(minutes).getAllByRole("option")).toHaveLength(4);
    await user.click(within(minutes).getByRole("option", { name: "30" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox")).toHaveValue("16.10.2026 14:30");
    await user.click(screen.getByRole("button", { name: "Tamam" }));
    expect(onChange).toHaveBeenCalledWith(D(2026, 10, 16, 14, 30), "16.10.2026 14:30");
  });

  it("TimePicker: saat sütunları klavyeyle (seçim odağı izler); Escape taslağı atar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker aria-label="Başlangıç saati" defaultValue={D(2026, 1, 1, 9, 0)} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    expect(within(screen.getByRole("listbox", { name: "Saat" })).getByRole("option", { name: "09" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("11:00");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("09:00");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Field içinde ad etiketten; gizli alan ISO; temizle", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState<Date | null>(D(2026, 10, 14));
      return (
        <Field label="Teslim tarihi">
          <DatePicker value={v} onChange={setV} name="teslim" />
        </Field>
      );
    }
    const { container } = render(<Controlled />);
    expect(screen.getByRole("combobox", { name: "Teslim tarihi" })).toHaveValue("14.10.2026");
    expect(container.querySelector("input[name=teslim]")).toHaveValue("2026-10-14");
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(container.querySelector("input[name=teslim]")).toHaveValue("");
  });

  it("axe: açık panel (tekli ve aralık) ihlalsiz", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DatePicker aria-label="Tarih" defaultValue={D(2026, 10, 14)} />);
    await user.click(screen.getByRole("combobox"));
    await nextFrame();
    expect(await getA11yViolations(document.body)).toEqual([]);
    unmount();
    render(<DatePicker range mode="datetime" aria-label="Aralık" />);
    await user.click(screen.getAllByRole("combobox")[0]!);
    await nextFrame();
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
