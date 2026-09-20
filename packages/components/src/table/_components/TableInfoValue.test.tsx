import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TableInfoValue } from "./TableInfoValue";

/** jsdom hiçbir zaman gerçek layout hesaplamaz — `scrollHeight`/`clientHeight` sahte değerlerle simüle ediliyor. */
function mockOverflow(scrollHeight: number, clientHeight: number) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(scrollHeight);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(clientHeight);
}

describe("TableInfoValue", () => {
  it("metin gerçekten kırpıldığında (scrollHeight > clientHeight) info verilmese bile otomatik tooltip'e düşer (Faz 13.4 kullanıcı bulgusu — bir telefon numarası '...' ile kesilip okunamaz hâle geliyordu)", async () => {
    mockOverflow(40, 20);
    const user = userEvent.setup();
    render(<TableInfoValue value="0532 111 22 33" />);

    const trigger = screen.getByText("0532 111 22 33");
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(await screen.findAllByRole("tooltip")).toHaveLength(1);
  });

  it("metin kırpılmadığında (scrollHeight === clientHeight) tooltip render edilmez", async () => {
    mockOverflow(20, 20);
    const user = userEvent.setup();
    render(<TableInfoValue value="Aktif" />);

    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("info=true iken kırpılmasa bile her zaman tooltip'e düşer", async () => {
    mockOverflow(20, 20);
    const user = userEvent.setup();
    render(<TableInfoValue value="Aktif" info />);

    await user.tab();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
