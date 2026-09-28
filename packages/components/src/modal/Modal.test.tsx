import { useCallback, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { getA11yViolations } from "../testUtils/a11y";

afterEach(() => {
  document.body.style.overflow = "";
});

function Wrapper(props: Partial<React.ComponentProps<typeof Modal>>) {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  return (
    <>
      <button onClick={() => setOpen(true)}>Aç</button>
      <Modal open={open} onClose={handleClose} title="Başlık" cancelButtonText="Vazgeç" confirmButtonText="Kaydet" {...props}>
        <input aria-label="Ad" />
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("role=dialog + aria-modal + başlık erişilebilir ad, açıklama aria-describedby", () => {
    render(
      <Modal open onClose={() => {}} title="Örnek Başlık" description="Kısa açıklama">
        İçerik
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { name: "Örnek Başlık" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Kısa açıklama");
  });

  it("kapalıyken DOM'da değildir (eskiden inert ile DOM'da kalıyordu)", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Başlık" confirmButtonText="Onayla">
        İçerik
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("açılınca odak gövdedeki ilk alana gider; kapanınca tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.click(screen.getByRole("button", { name: "Aç" }));
    expect(screen.getByRole("textbox", { name: "Ad" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Aç" })).toHaveFocus();
  });

  it("Tab modalın içinde döner (eskiden odak tuzağı yoktu, Tab sayfaya kaçıyordu) ve sayfa kaydırması kilitlenir", async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.click(screen.getByRole("button", { name: "Aç" }));
    const dialog = screen.getByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("error/warning + onay düğmesi → alertdialog ve ilk odak Vazgeç'e gider (yıkıcı işlem Enter'la tetiklenmesin)", async () => {
    const user = userEvent.setup();
    render(<Wrapper color="error" title="Projeyi sil" confirmButtonText="Sil" />);
    await user.click(screen.getByRole("button", { name: "Aç" }));
    expect(screen.getByRole("alertdialog", { name: "Projeyi sil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vazgeç" })).toHaveFocus();
  });

  it("initialFocus=\"confirm\" — Vazgeç konumundaki düğme yıkıcıysa odak onaya gider", async () => {
    const user = userEvent.setup();
    render(<Wrapper color="warning" title="Oturum" cancelButtonText="Çıkış yap" confirmButtonText="Oturumu uzat" initialFocus="confirm" />);
    await user.click(screen.getByRole("button", { name: "Aç" }));
    expect(screen.getByRole("button", { name: "Oturumu uzat" })).toHaveFocus();
  });

  it("onConfirm Promise dönerse çözülene kadar onay düğmesi yükleniyor olur", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(
      <Modal open onClose={() => {}} title="Kaydet" confirmButtonText="Kaydet" onConfirm={onConfirm}>
        İçerik
      </Modal>
    );
    const confirm = screen.getByRole("button", { name: /Kaydet/ });
    await user.click(confirm);
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
    resolve();
    await vi.waitFor(() => expect(confirm).toBeEnabled());
  });

  it("footer={null} alt çubuğu kaldırır; özel footer düğmelerin yerine geçer", () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="A" confirmButtonText="Tamam" footer={null}>
        İçerik
      </Modal>
    );
    expect(screen.queryByRole("button", { name: "Tamam" })).not.toBeInTheDocument();
    rerender(
      <Modal open onClose={() => {}} title="A" footer={<button>Özel</button>}>
        İçerik
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Özel" })).toBeInTheDocument();
  });

  it("keyboard={false} ise Escape kapatmaz", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık" keyboard={false}>
        İçerik
      </Modal>
    );
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    render(
      <Modal open onClose={() => {}} title="Başlık" description="Açıklama" color="warning" cancelButtonText="Vazgeç" confirmButtonText="Tamam">
        İçerik
      </Modal>
    );
    expect(await getA11yViolations(document.body)).toEqual([]);
  });

  it("taşan ve odaklanabilir öğe içermeyen gövde Tab durağı olur (axe scrollable-region-focusable); sığan gövde olmaz", () => {
    // jsdom'da yerleşim ve ResizeObserver yok: ikisini de taklit et.
    const observe = vi.fn();
    vi.stubGlobal("ResizeObserver", class { observe = observe; disconnect() {} });
    const heights = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
    const { unmount } = render(
      <Modal open onClose={() => {}} title="Kullanım koşulları">
        <p>Uzun metin</p>
      </Modal>
    );
    expect(document.querySelector("[data-modal-body]")).toHaveAttribute("tabindex", "0");
    unmount();

    heights.mockReturnValue(300);
    render(
      <Modal open onClose={() => {}} title="Kısa">
        <p>Kısa metin</p>
      </Modal>
    );
    expect(document.querySelector("[data-modal-body]")).not.toHaveAttribute("tabindex");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("skeleton", () => {
    const renderSkeleton = (skeleton: boolean, extra: Partial<React.ComponentProps<typeof Modal>> = {}) => (
      <Modal open onClose={() => {}} title="Sipariş #42" description="Detaylar" cancelButtonText="Vazgeç" confirmButtonText="Kaydet" skeleton={skeleton} {...extra}>
        <input aria-label="Ad" />
      </Modal>
    );

    it("başlık/gövde/alt çubuk erişilebilirlik ağacından çıkar; ad, Kapat ve aria-busy kalır", async () => {
      render(renderSkeleton(true));
      const dialog = screen.getByRole("dialog", { name: "Sipariş #42" });
      expect(dialog).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByRole("textbox", { name: "Ad" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Kaydet" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Kapat" })).toBeInTheDocument();
      expect(await getA11yViolations(document.body)).toEqual([]);
    });

    it("iskelette odak Kapat'ta kalır ve Tab görünmez düğmelere takılmaz", async () => {
      const user = userEvent.setup();
      render(renderSkeleton(true));
      const close = screen.getByRole("button", { name: "Kapat" });
      expect(close).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
    });

    it("yıkıcı onayda initialFocus iskeletteki görünmez Vazgeç'e gitmez; veri gelince oraya taşınır", () => {
      const props = { color: "error" as const };
      const { rerender } = render(renderSkeleton(true, props));
      expect(screen.getByRole("button", { name: "Kapat" })).toHaveFocus();
      rerender(renderSkeleton(false, props));
      expect(screen.getByRole("button", { name: "Vazgeç" })).toHaveFocus();
    });

    it("veri gelince odak gövdedeki ilk alana taşınır", () => {
      const { rerender } = render(renderSkeleton(true));
      rerender(renderSkeleton(false));
      expect(screen.getByRole("textbox", { name: "Ad" })).toHaveFocus();
    });
  });
});
