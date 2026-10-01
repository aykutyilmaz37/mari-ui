import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tour } from "./Tour";
import type { TourStep } from "./types";
import { isFullyVisible, spotlightPath, stepFromKey } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

function Harness(props: { steps?: TourStep[]; mask?: boolean; onClose?: (c: number) => void; onFinish?: () => void }) {
  const [open, setOpen] = useState(false);
  const steps: TourStep[] = props.steps ?? [
    { title: "Hoş geldiniz", description: "Kısa bir tur." },
    { title: "Yeni proje", description: "Buradan proje oluşturun.", target: () => document.getElementById("new") },
    { title: "Ayarlar", target: () => document.getElementById("settings") },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)}>Turu başlat</button>
      <button id="new">Yeni</button>
      <button id="settings">Ayarlar</button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} mask={props.mask} onClose={props.onClose} onFinish={props.onFinish} />
    </>
  );
}

describe("Tour", () => {
  it("modal dialog; açılışta odak 'Sonraki'de; adım içeriği aria-live bölgesinde", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Turu başlat" }));
    await nextFrame();
    const dialog = screen.getByRole("dialog", { name: "Tanıtım turu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
    expect(dialog.querySelector("[aria-live]")).toHaveTextContent("Adım 1 / 3: Hoş geldiniz");
    expect(dialog).toHaveAccessibleDescription(/Hoş geldiniz.*Kısa bir tur/);
  });

  it("Sonraki/Geri ve ←/→; odak düğmede kalır; son adımda Bitir → onFinish, odak geri döner", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />);
    const start = screen.getByRole("button", { name: "Turu başlat" });
    await user.click(start);
    await nextFrame();
    await user.click(screen.getByRole("button", { name: "Sonraki" }));
    expect(screen.getByRole("heading")).toHaveTextContent("Yeni proje");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("heading")).toHaveTextContent("Ayarlar");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("heading")).toHaveTextContent("Yeni proje");
    await user.click(screen.getByRole("button", { name: "Geri" }));
    expect(screen.getByRole("heading")).toHaveTextContent("Hoş geldiniz");
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    await user.click(screen.getByRole("button", { name: "Bitir" }));
    expect(onFinish).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(start).toHaveFocus();
  });

  it("Escape ve × yarıda kapatır, onClose o anki adımı verir; Tab panelde döner", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Turu başlat" }));
    await nextFrame();
    await user.keyboard("{ArrowRight}");
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole("button", { name: "Turu başlat" }));
    await nextFrame();
    await user.click(screen.getByRole("button", { name: "Turu kapat" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("mask=false: modal değil, sayfa kullanılabilir; Escape yine kapatır", async () => {
    const user = userEvent.setup();
    render(<Harness mask={false} />);
    await user.click(screen.getByRole("button", { name: "Turu başlat" }));
    await nextFrame();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-modal");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("yardımcılar", () => {
    expect(spotlightPath(100, 50, null, 4, 8)).toBe("M0 0H100V50H0Z");
    const p = spotlightPath(100, 50, { top: 10, left: 10, width: 20, height: 10 }, 2, 4);
    expect(p.startsWith("M0 0H100V50H0Z")).toBe(true);
    expect(p).toContain("M12 8");
    expect(isFullyVisible({ top: -1, left: 0, width: 10, height: 10 }, 100, 100)).toBe(false);
    expect(stepFromKey("ArrowRight", 2, 3, false)).toBeNull();
    expect(stepFromKey("ArrowLeft", 2, 3, false)).toBe(1);
    expect(stepFromKey("ArrowLeft", 2, 3, true)).toBeNull();
  });

  it("axe: açık tur ihlalsiz", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Turu başlat" }));
    await nextFrame();
    await user.keyboard("{ArrowRight}");
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
