import { useCallback, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { getA11yViolations } from "../testUtils/a11y";

describe("Modal (Faz 9 — üç gerçek a11y hatasının düzeltmesi, bkz. Modal.tsx'teki not)", () => {
  it("role=dialog + aria-modal + aria-labelledby taşır (eskiden role=none ile TAMAMEN siliniyordu)", () => {
    render(
      <Modal open onClose={() => {}} title="Örnek Başlık">
        İçerik
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { name: "Örnek Başlık" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("open=false iken kök kapsayıcı `inert` olur (jsdom `inert`in gerçek odak/AT-gizleme davranışını UYGULAMIYOR — bkz. not, bu yüzden sadece attribute'un VARLIĞI doğrulanıyor; gerçek odak-engelleme davranışı Storybook'ta GERÇEK bir tarayıcıda ayrıca doğrulandı, bkz. ACCESSIBILITY.md)", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Başlık" confirmButtonText="Onayla">
        İçerik
      </Modal>
    );
    expect(container.firstElementChild).toHaveAttribute("inert");
  });

  it("open=true iken kök kapsayıcıda `inert` YOKTUR", () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="Başlık" confirmButtonText="Onayla">
        İçerik
      </Modal>
    );
    expect(container.firstElementChild).not.toHaveAttribute("inert");
  });

  it("open=true iken açılınca odak diyalog paneline taşınır", () => {
    render(
      <Modal open onClose={() => {}} title="Başlık">
        İçerik
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("Escape tuşuna basınca onClose çağrılır", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık">
        İçerik
      </Modal>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("açılınca odak diyaloğa gider, kapanınca tetikleyici elemana geri döner", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [open, setOpen] = useState(false);
      const handleClose = useCallback(() => setOpen(false), []);
      return (
        <>
          <button onClick={() => setOpen(true)}>Aç</button>
          <Modal open={open} onClose={handleClose} title="Başlık">
            İçerik
          </Modal>
        </>
      );
    }
    render(<Wrapper />);

    await user.click(screen.getByRole("button", { name: "Aç" }));
    expect(screen.getByRole("dialog")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Aç" })).toHaveFocus();
  });

  it("erişilebilirlik ihlali içermez, açıkken de kapalıyken de (axe-core)", async () => {
    const open = render(
      <Modal open onClose={() => {}} title="Başlık" confirmButtonText="Tamam">
        İçerik
      </Modal>
    );
    expect(await getA11yViolations(open.container)).toEqual([]);
    open.unmount();

    const closed = render(
      <Modal open={false} onClose={() => {}} title="Başlık">
        İçerik
      </Modal>
    );
    expect(await getA11yViolations(closed.container)).toEqual([]);
  });
});
