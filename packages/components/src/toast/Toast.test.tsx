import { useRef } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./useToast";
import type { ToastOptions } from "./types";
import { getA11yViolations } from "../testUtils/a11y";

function Trigger({ options }: { options: ToastOptions }) {
  const { showToast, dismiss } = useToast();
  return (
    <>
      <button onClick={() => showToast(options)}>Göster</button>
      <button onClick={() => dismiss()}>Hepsini kapat</button>
    </>
  );
}

function setup(options: ToastOptions) {
  render(
    <ToastProvider>
      <Trigger options={options} />
    </ToastProvider>
  );
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Göster" }));
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Toast", () => {
  it("kalıcı canlı bölgeden duyurulur (eskiden hiç duyurulmuyordu); hata assertive", () => {
    setup({ title: "Kaydedildi", description: "Değişiklikler yayında." });
    expect(screen.getByRole("status")).toHaveTextContent("Kaydedildi. Değişiklikler yayında.");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Göster" }));
    });
  });

  it("error tipi role=alert bölgesine düşer", () => {
    setup({ title: "Ödeme reddedildi", type: "error" });
    expect(screen.getByRole("alert")).toHaveTextContent("Ödeme reddedildi");
  });

  it("kapat gerçek bir düğme; tıklanınca çıkış animasyonundan sonra kalkar", () => {
    const onClose = vi.fn();
    setup({ title: "Merhaba", onClose });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Bildirimi kapat" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByText("Merhaba", { selector: "p" })).not.toBeInTheDocument();
  });

  it("süre dolunca kapanır; üzerine gelince SAYAÇ DURUR (WCAG 2.2.1)", () => {
    setup({ title: "Geçici", duration: 3000 });
    const card = screen.getByText("Geçici", { selector: "p" }).closest("div.pointer-events-auto") as HTMLElement;
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    fireEvent.mouseEnter(card);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Geçici", { selector: "p" })).toBeInTheDocument();
    fireEvent.mouseLeave(card);
    act(() => {
      vi.advanceTimersByTime(1100 + 250);
    });
    expect(screen.queryByText("Geçici", { selector: "p" })).not.toBeInTheDocument();
  });

  it("aksiyon düğmesi çalışır ve toast'u kapatır", () => {
    const undo = vi.fn();
    setup({ title: "Silindi", action: { label: "Geri al", onClick: undo } });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Geri al" }));
    });
    expect(undo).toHaveBeenCalled();
  });

  it("duration=0 kendiliğinden kapanmaz; dismiss() hepsini kapatır", () => {
    setup({ title: "Kalıcı", duration: 0 });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Kalıcı", { selector: "p" })).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Hepsini kapat" }));
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByText("Kalıcı", { selector: "p" })).not.toBeInTheDocument();
  });

  describe("skeleton + update", () => {
    function Loader() {
      const { showToast, update } = useToast();
      const id = useRef("");
      return (
        <>
          <button onClick={() => (id.current = showToast({ title: "Rapor hazırlanıyor", skeleton: true, duration: 3000 }))}>Başlat</button>
          <button onClick={() => update(id.current, { skeleton: false, title: "Rapor hazır", type: "success" })}>Bitir</button>
        </>
      );
    }
    const toastText = (text: string) => within(screen.getByRole("region", { name: "Bildirimler" })).queryByText(text);

    function renderLoader() {
      render(
        <ToastProvider>
          <Loader />
        </ToastProvider>
      );
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Başlat" }));
      });
    }

    it("iskeletteyken duyurulmaz, kendiliğinden kapanmaz; Kapat çalışır ve meşgul bildirir", () => {
      renderLoader();
      expect(screen.getByRole("status")).toHaveTextContent("");
      expect(screen.getByRole("button", { name: "Bildirimi kapat" })).toBeInTheDocument();
      expect(toastText("Rapor hazırlanıyor")?.closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(toastText("Rapor hazırlanıyor")).toBeInTheDocument();
    });

    it("update ile içerik gelince duyurulur ve sayaç başlar", () => {
      renderLoader();
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Bitir" }));
      });
      expect(screen.getByRole("status")).toHaveTextContent("Rapor hazır");
      expect(toastText("Rapor hazır")?.closest("[aria-busy]")).toBeNull();
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      expect(screen.queryByRole("region", { name: "Bildirimler" })).not.toBeInTheDocument();
    });
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    vi.useRealTimers();
    render(
      <ToastProvider>
        <Trigger options={{ title: "Kaydedildi", type: "success", action: { label: "Görüntüle", onClick: () => {} } }} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Göster" }));
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
