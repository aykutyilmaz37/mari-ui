import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Loading } from "./Loading";
import { getA11yViolations } from "../testUtils/a11y";

afterEach(() => vi.useRealTimers());

describe("Loading", () => {
  it("varsayılan satır içi: role=status, ad tip'ten (eskiden hep tam ekran ve duyurulmuyordu)", () => {
    render(<Loading tip="Kaydediliyor" />);
    const status = screen.getByRole("status", { name: "Kaydediliyor" });
    expect(status.className).not.toContain("fixed");
  });

  it("fullscreen: sabit örtü", () => {
    render(<Loading fullscreen />);
    expect(screen.getByRole("status", { name: "Yükleniyor" }).className).toContain("fixed");
  });

  it("spinning=false iken satır içi/tam ekran hiçbir şey render etmez", () => {
    const { container } = render(<Loading spinning={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("sarmalama: içerik yerinde kalır, yüklenirken inert + aria-busy; bitince etkileşime açılır", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <Loading spinning tip="Güncelleniyor">
        <button onClick={onClick}>Kaydet</button>
      </Loading>
    );
    const button = screen.getByText("Kaydet");
    expect(button.closest("[inert]")).not.toBeNull();
    expect(button.closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Güncelleniyor");

    rerender(
      <Loading spinning={false} tip="Güncelleniyor">
        <button onClick={onClick}>Kaydet</button>
      </Loading>
    );
    expect(button.closest("[inert]")).toBeNull();
    // Canlı bölge DOM'da kalır, sadece metni boşalır.
    expect(screen.getByRole("status")).toHaveTextContent("");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("delay: bu süreden kısa yüklemelerde spinner hiç görünmez (yanıp sönme yok)", () => {
    vi.useFakeTimers();
    const { rerender } = render(<Loading delay={300} tip="Yükleniyor" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender(<Loading delay={300} spinning={false} tip="Yükleniyor" />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<Loading delay={300} tip="Yükleniyor" />);
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("percent: progressbar + yüzde metni", () => {
    render(<Loading percent={64} tip="Yükleniyor" />);
    const bar = screen.getByRole("progressbar", { name: "Yükleniyor" });
    expect(bar).toHaveAttribute("aria-valuenow", "64");
    expect(bar).toHaveTextContent("%64");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Loading tip="Kaydediliyor" size="sm" />
        <Loading spinning tip="Güncelleniyor">
          <p>Kart içeriği</p>
        </Loading>
        <Loading percent={40} tip="Yükleniyor" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
