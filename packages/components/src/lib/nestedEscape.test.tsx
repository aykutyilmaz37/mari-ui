import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../date-picker";
import { Modal } from "../modal";
import { Popover } from "../popover";
import { Select } from "../select";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

/**
 * Faz 16 kalite turu — Modal içindeki açılır parça Escape'i işlerse yalnız o
 * kapanır; ikinci Escape Modal'ı kapatır (Modal `defaultPrevented`ı dikkate alır).
 */
function InModal({ children, onClose }: Readonly<{ children: React.ReactNode; onClose: () => void }>) {
  return (
    <Modal open title="Form" onClose={onClose}>
      {children}
    </Modal>
  );
}

describe("Modal içinde Escape", () => {
  it("Select listesi: önce liste, sonra pencere", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <InModal onClose={onClose}>
        <Select aria-label="Şehir" options={[{ value: "a", label: "Ankara" }]} />
      </InModal>
    );
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Popover: panel kapanır, pencere açık kalır", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <InModal onClose={onClose}>
        <Popover content={<button>İçerik</button>} aria-label="Bilgi">
          <button>Aç</button>
        </Popover>
      </InModal>
    );
    await user.click(screen.getByRole("button", { name: "Aç" }));
    await nextFrame();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Bilgi" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("DatePicker paneli (odak takvimdeyken): panel kapanır, pencere açık kalır", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <InModal onClose={onClose}>
        <DatePicker aria-label="Tarih" defaultValue={new Date(2026, 9, 14)} />
      </InModal>
    );
    screen.getByRole("combobox", { name: "Tarih" }).focus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    expect(screen.getByRole("gridcell", { name: /^14 Ekim 2026/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Tarih seç" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Tarih" })).toHaveFocus();
  });
});
