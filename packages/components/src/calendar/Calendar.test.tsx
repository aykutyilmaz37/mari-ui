import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";
import { CalendarPanel } from "./_components/CalendarPanel";
import { isSameDay } from "../lib/date";
import { getA11yViolations } from "../testUtils/a11y";

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("Calendar", () => {
  it("APG date grid: sütun başlıkları, seçili ve bugün; tek sekme durağı", () => {
    render(<Calendar defaultValue={D(2026, 10, 14)} />);
    const grid = screen.getByRole("grid", { name: "Ekim 2026" });
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7);
    const cell = within(grid).getByRole("gridcell", { name: "14 Ekim 2026 Çarşamba" });
    expect(cell).toHaveAttribute("aria-selected", "true");
    expect(cell).toHaveAttribute("tabindex", "0");
    expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("klavye: ok tuşları odaklar, ay dışına çıkınca ay değişir, Enter seçer", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar defaultValue={D(2026, 10, 30)} onSelect={onSelect} fullscreen={false} />);
    screen.getByRole("gridcell", { name: /^30 Ekim 2026/ }).focus();
    await user.keyboard("{ArrowDown}");
    const grid = screen.getByRole("grid", { name: "Kasım 2026" });
    expect(within(grid).getByRole("gridcell", { name: /^6 Kasım 2026/ })).toHaveFocus();
    await user.keyboard("{PageDown}{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(D(2026, 12, 6), { source: "date" });
  });

  it("disabledDate ve validRange: seçilemez, aria-disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultValue={D(2026, 10, 14)} disabledDate={(d) => d.getDay() === 0} validRange={[D(2026, 10, 5), D(2026, 12, 31)]} onChange={onChange} />);
    const sunday = screen.getByRole("gridcell", { name: /^11 Ekim 2026/ });
    expect(sunday).toHaveAttribute("aria-disabled", "true");
    await user.click(sunday);
    await user.click(screen.getByRole("gridcell", { name: /^2 Ekim 2026/ }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Yıl" })).toHaveTextContent("2026");
  });

  it("yıl modu: aylar ızgarası, cellRender; ay seçimi", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar defaultValue={D(2026, 10, 14)} onSelect={onSelect} cellRender={(d, info) => (info.type === "month" && d.getMonth() === 9 ? "3 etkinlik" : null)} />);
    await user.click(screen.getByRole("radio", { name: "Yıl" }));
    const grid = screen.getByRole("grid", { name: "2026 ayları" });
    expect(within(grid).getByText("3 etkinlik")).toBeInTheDocument();
    await user.click(within(grid).getByRole("gridcell", { name: "Mart 2026" }));
    expect(onSelect).toHaveBeenCalledWith(D(2026, 3, 1), { source: "month" });
  });

  it("CalendarPanel: başlıktan ay ve yıl görünümü, oklarla gezinme", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CalendarPanel initialDate={D(2026, 10, 14)} isSelected={(d) => isSameDay(d, D(2026, 10, 14))} isDisabled={() => false} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Sonraki ay" }));
    expect(screen.getByRole("grid", { name: "Kasım 2026" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yıl seç, 2026" }));
    await user.click(screen.getByRole("gridcell", { name: "2028" }));
    await user.click(screen.getByRole("gridcell", { name: "Şubat 2028" }));
    await user.click(screen.getByRole("gridcell", { name: /^29 Şubat 2028/ }));
    expect(onSelect).toHaveBeenCalledWith(D(2028, 2, 29));
  });

  it("axe: tam ekran ve kart ihlalsiz", async () => {
    const { container, rerender } = render(<Calendar defaultValue={D(2026, 10, 14)} cellRender={() => "Not"} />);
    expect(await getA11yViolations(container)).toEqual([]);
    rerender(<Calendar defaultValue={D(2026, 10, 14)} fullscreen={false} showWeek />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
