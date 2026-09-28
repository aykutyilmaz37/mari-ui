import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";
import { getA11yViolations } from "../testUtils/a11y";

afterEach(() => vi.useRealTimers());

describe("Alert", () => {
  it("error/warning role=alert (hemen okunur), diğerleri role=status; none ile duyurusuz", () => {
    const { rerender } = render(<Alert color="error" title="Ödeme alınamadı" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Ödeme alınamadı");
    rerender(<Alert color="warning" title="Kotanın %90'ı doldu" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<Alert color="success" title="Kaydedildi" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Alert color="info" title="Bilgi" role="none" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ikon görsel; icon={false} gizler", () => {
    const { container, rerender } = render(<Alert title="Bilgi" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    rerender(<Alert title="Bilgi" icon={false} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("kapat: onClose çağrılır, solma sonrası DOM'dan kalkar", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Alert title="Yeni sürüm hazır" closable onClose={onClose} />);
    act(() => {
      screen.getByRole("button", { name: "Uyarıyı kapat" }).click();
    });
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByText("Yeni sürüm hazır")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByText("Yeni sürüm hazır")).not.toBeInTheDocument();
  });

  it("eylem alanı erişilebilir", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<Alert color="error" title="Bağlantı koptu" action={<button onClick={retry}>Yeniden dene</button>} />);
    await user.click(screen.getByRole("button", { name: "Yeniden dene" }));
    expect(retry).toHaveBeenCalled();
  });

  it("skeleton: duyurulmaz, içerik erişilebilirlik ağacından çıkar, Kapat çalışır", () => {
    render(<Alert color="error" title="Ödeme alınamadı" description="Kartınızı kontrol edin" closable skeleton />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Ödeme alınamadı").closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Uyarıyı kapat" })).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Alert color="success" title="Profil güncellendi" description="Değişiklikler tüm cihazlarda görünür." closable />
        <Alert color="error" title="Ödeme alınamadı" description="Kartınızın limiti yetersiz." action={<button>Başka kart</button>} />
        <Alert color="warning" banner description="Deneme sürenizin bitmesine 3 gün kaldı." />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
