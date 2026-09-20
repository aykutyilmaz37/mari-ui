import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";
import { getA11yViolations } from "../testUtils/a11y";

describe("Pagination", () => {
  it("aktif sayfa düğmesi aria-current=\"page\" taşır (Faz 13.5 kullanıcı bulgusu — eskiden hiçbir düğme mevcut sayfayı ekran okuyucuya bildirmiyordu)", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={50} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "2. sayfa" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "1. sayfa" })).not.toHaveAttribute("aria-current");
  });

  it("bir sayfa numarasına tıklayınca onPageChange doğru sayfayla çağrılır", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={50} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "3. sayfa" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("showTotal iken kayıt aralığı bilgisi gösterilir", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={95} onPageChange={() => {}} showTotal />);
    expect(screen.getByText("11-20 / 95 kayıt")).toBeInTheDocument();
  });

  it("showTotal verilmezse (varsayılan) kayıt aralığı gösterilmez — eski davranışla uyumlu", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={95} onPageChange={() => {}} />);
    expect(screen.queryByText(/kayıt/)).not.toBeInTheDocument();
  });

  it("onPageSizeChange verilince sayfa başına seçici render edilir ve çalışır", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={95} onPageChange={() => {}} onPageSizeChange={onPageSizeChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Pagination currentPage={2} pageSize={10} totalItems={95} onPageChange={() => {}} showTotal onPageSizeChange={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
