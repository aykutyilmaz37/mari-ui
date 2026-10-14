import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";
import { getA11yViolations } from "../testUtils/a11y";

function Harness(props: Readonly<Partial<React.ComponentProps<typeof Drawer>>>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Sepeti aç</button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Sepetim"
        description="2 ürün"
        footer={<button>Ödemeye geç</button>}
        {...props}
      >
        <input aria-label="Kupon kodu" />
      </Drawer>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
  document.body.style.overflow = "";
});

describe("Drawer", () => {
  it("kapalıyken DOM'da değildir (eskiden kapalı çekmecenin düğmeleri Tab ile odaklanabiliyordu)", () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ödemeye geç" })).not.toBeInTheDocument();
  });

  it("açılınca dialog olarak duyurulur: başlık = erişilebilir ad, açıklama = aria-describedby", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Sepeti aç" }));
    const dialog = screen.getByRole("dialog", { name: "Sepetim" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("2 ürün");
  });

  it("açılınca odak içeri taşınır, Tab içeride döner, sayfa kaydırması kilitlenir", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Sepeti aç" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(document.body.style.overflow).toBe("hidden");

    // Kapat → Kupon → Ödemeye geç → (başa) Kapat
    for (let i = 0; i < 4; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("Escape kapatır, odak tetikleyiciye döner ve kaydırma kilidi kalkar", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Sepeti aç" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("keyboard={false} iken Escape kapatmaz", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Başlık" keyboard={false}>
        İçerik
      </Drawer>
    );
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("kapat düğmesi onClose çağırır; kapanış animasyonundan sonra unmount olur", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Sepeti aç" }));
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    // Çıkış animasyonu süresince hâlâ DOM'da (kayarak çıkıyor)…
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
  });

  it("ilk odak extra'daki aksiyona gitmez; yükleme bitince forma taşınır (Faz 13.6: yükleniyor açılışta odak \"Sil\"e gidiyordu)", async () => {
    const extra = <button>Sil</button>;
    const body = (
      <label data-autofocus>
        Ad <input />
      </label>
    );
    const { rerender } = render(
      <Drawer open onClose={() => {}} title="Düzenle" extra={extra} skeleton>
        {body}
      </Drawer>
    );
    expect(screen.getByRole("button", { name: "Kapat" })).toHaveFocus();
    rerender(
      <Drawer open onClose={() => {}} title="Düzenle" extra={extra} skeleton={false}>
        {body}
      </Drawer>
    );
    expect(screen.getByRole("textbox", { name: "Ad" })).toHaveFocus();
  });

  it("title yoksa aria-label erişilebilir ad olur", () => {
    render(
      <Drawer open onClose={() => {}} aria-label="Filtreler">
        İçerik
      </Drawer>
    );
    expect(screen.getByRole("dialog", { name: "Filtreler" })).toBeInTheDocument();
  });

  it("skeleton başlık/extra/alt çubuğu da gizler; dialog adını ve Kapat'ı korur, meşgul bildirir", () => {
    render(
      <Drawer open onClose={() => {}} title="Sipariş #42" extra={<button>Sil</button>} footer={<button>Kaydet</button>} skeleton>
        Gizli içerik
      </Drawer>
    );
    const dialog = screen.getByRole("dialog", { name: "Sipariş #42" });
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Gizli içerik").closest('[data-skeleton][aria-hidden="true"]')).not.toBeNull();
    // Görünmez kopyalar aria-hidden bölgede: erişilebilirlik ağacında yoklar.
    expect(screen.queryByRole("button", { name: "Sil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kaydet" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kapat" })).toBeInTheDocument();
  });

  it("iskelette Tab görünmez extra/alt çubuk düğmelerine takılmaz", async () => {
    const user = userEvent.setup();
    render(
      <Drawer open onClose={() => {}} title="Sipariş" extra={<button>Sil</button>} footer={<button>Kaydet</button>} skeleton>
        İçerik
      </Drawer>
    );
    const close = screen.getByRole("button", { name: "Kapat" });
    expect(close).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(close).toHaveFocus();
  });

  it("iskelette erişilebilirlik ihlali içermez (axe-core)", async () => {
    render(
      <Drawer open onClose={() => {}} title="Sepetim" description="2 ürün" extra={<button>Temizle</button>} footer={<button>Ödemeye geç</button>} skeleton>
        <p>İçerik</p>
      </Drawer>
    );
    expect(await getA11yViolations(document.body)).toEqual([]);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    render(
      <Drawer open onClose={() => {}} title="Sepetim" description="2 ürün" footer={<button>Ödemeye geç</button>}>
        <p>İçerik</p>
      </Drawer>
    );
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
