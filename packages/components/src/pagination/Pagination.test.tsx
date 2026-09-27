import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";
import { getPageAfterSizeChange, getPageItems } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

const E = (direction: "left" | "right") => ({ type: "ellipsis", direction });

describe("getPageItems", () => {
  it("az sayfada hepsini döner", () => {
    expect(getPageItems(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it("her sayfada SABİT sayıda slot üretir — genişlik zıplamaz (Faz 13.6 kullanıcı bulgusu)", () => {
    for (let page = 1; page <= 20; page++) expect(getPageItems(20, page)).toHaveLength(7);
    for (let page = 1; page <= 20; page++) expect(getPageItems(20, page, 2)).toHaveLength(9);
  });

  it("\"…\" asla tek bir sayfayı gizlemez", () => {
    expect(getPageItems(10, 4)).toEqual([1, 2, 3, 4, 5, E("right"), 10]);
    expect(getPageItems(10, 5)).toEqual([1, E("left"), 4, 5, 6, E("right"), 10]);
    expect(getPageItems(10, 7)).toEqual([1, E("left"), 6, 7, 8, 9, 10]);
  });

  it("sayfa boyutu değişince ilk görünen kayıt görünür kalır", () => {
    expect(getPageAfterSizeChange(3, 10, 20, 95)).toBe(2); // 21. kayıt → 20/sayfa'da 2. sayfa
    expect(getPageAfterSizeChange(10, 10, 100, 95)).toBe(1);
  });
});

describe("Pagination", () => {
  it("aktif sayfa düğmesi aria-current=\"page\" taşır", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={50} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "2. sayfa" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "1. sayfa" })).not.toHaveAttribute("aria-current");
  });

  it("bir sayfa numarasına tıklayınca onPageChange (sayfa, boyut) ile çağrılır", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={50} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "3. sayfa" }));
    expect(onPageChange).toHaveBeenCalledWith(3, 10);
  });

  it("aktif sayfaya tekrar tıklamak onPageChange'i çağırmaz", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} pageSize={10} totalItems={50} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "2. sayfa" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("kayıt yokken Sonraki düğmesi pasif, onPageChange(0) çağrılmaz (eski hata)", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={0} onPageChange={onPageChange} />);
    const next = screen.getByRole("button", { name: "Sonraki sayfa" });
    expect(next).toHaveAttribute("aria-disabled", "true");
    await user.click(next);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("uncontrolled modda kendi sayfasını tutar", async () => {
    const user = userEvent.setup();
    render(<Pagination defaultPage={1} totalItems={95} />);
    await user.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    expect(screen.getByRole("button", { name: "2. sayfa" })).toHaveAttribute("aria-current", "page");
  });

  it("toplam azalıp sayfa aralık dışına düşerse son sayfaya çekilir ve tüketici bilgilendirilir", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination currentPage={10} pageSize={10} totalItems={100} onPageChange={onPageChange} />);
    rerender(<Pagination currentPage={10} pageSize={10} totalItems={35} onPageChange={onPageChange} />);
    expect(onPageChange).toHaveBeenCalledWith(4, 10);
    expect(screen.getByRole("button", { name: "4. sayfa" })).toHaveAttribute("aria-current", "page");
  });

  it("sayfa boyutu değişince sayfa aralıkta kalır ve kayıt bilgisi doğru olur", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [page, setPage] = useState(10);
      const [size, setSize] = useState(10);
      return <Pagination currentPage={page} pageSize={size} totalItems={95} onPageChange={setPage} onPageSizeChange={setSize} showTotal />;
    }
    render(<Controlled />);
    await user.selectOptions(screen.getByRole("combobox"), "50");
    expect(screen.getByText("51-95 / 95 kayıt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2. sayfa" })).toHaveAttribute("aria-current", "page");
  });

  it("ortadayken Sonraki'ye basınca aktif vurgu aynı DOM düğmesinde kalır — numaralar kaymaz (Faz 13.6 kullanıcı bulgusu)", async () => {
    const user = userEvent.setup();
    render(<Pagination defaultPage={6} totalItems={500} />);
    const activeBefore = screen.getByRole("button", { name: "6. sayfa" });
    await user.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    const activeAfter = screen.getByRole("button", { name: "7. sayfa" });
    expect(activeAfter).toHaveAttribute("aria-current", "page");
    expect(activeAfter).toBe(activeBefore);
  });

  it("\"…\" düğmesi 5 sayfa atlar", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={10} pageSize={10} totalItems={200} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "5 sayfa ileri" }));
    expect(onPageChange).toHaveBeenCalledWith(15, 10);
  });

  it("showTotal fonksiyonla özelleştirilebilir", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={95} showTotal={(total, [s, e]) => `Toplam ${total} (${s}-${e})`} />);
    expect(screen.getByText("Toplam 95 (11-20)")).toBeInTheDocument();
  });

  it("showTotal verilmezse kayıt aralığı gösterilmez", () => {
    render(<Pagination currentPage={2} pageSize={10} totalItems={95} />);
    expect(screen.queryByText(/kayıt$/)).not.toBeInTheDocument();
  });

  it("hızlı atlama alanı Enter ile sayfaya gider (aralık dışı değer sınırlanır)", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={95} onPageChange={onPageChange} showQuickJumper />);
    await user.type(screen.getByRole("textbox", { name: /Sayfaya git/ }), "99{Enter}");
    expect(onPageChange).toHaveBeenCalledWith(10, 10);
  });

  it("simple modda sayfa alanı ve toplam sayfa gösterilir", async () => {
    const user = userEvent.setup();
    render(<Pagination simple defaultPage={2} totalItems={95} />);
    const input = screen.getByRole("textbox", { name: /Sayfa/ });
    expect(input).toHaveValue("2");
    await user.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    expect(input).toHaveValue("3");
    expect(within(screen.getByRole("navigation")).getByText("10")).toBeInTheDocument();
  });

  it("hideOnSinglePage tek sayfada hiçbir şey render etmez", () => {
    const { container } = render(<Pagination totalItems={5} hideOnSinglePage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disabled iken tıklamalar yok sayılır", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} pageSize={10} totalItems={50} onPageChange={onPageChange} disabled />);
    screen.getByRole("button", { name: "3. sayfa" }).click();
    await user.keyboard("{Enter}");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <Pagination currentPage={6} pageSize={10} totalItems={195} onPageChange={() => {}} showTotal onPageSizeChange={() => {}} showQuickJumper />
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
