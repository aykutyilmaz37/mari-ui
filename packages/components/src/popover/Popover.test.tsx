import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";
import { getA11yViolations } from "../testUtils/a11y";

// jsdom'da rAF yok sayılır → konum ölçümü (ve odak taşıma) gerçekleşsin diye bir kare ilerlet.
const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

afterEach(() => vi.useRealTimers());

function Harness(props: Readonly<Partial<React.ComponentProps<typeof Popover>>>) {
  return (
    <>
      <button>Önceki</button>
      <Popover
        title="Paylaş"
        content={
          <div>
            <input aria-label="Bağlantı" defaultValue="https://mari-ui.com/p/42" readOnly />
            <button>Kopyala</button>
          </div>
        }
        {...props}
      >
        <button>Paylaş</button>
      </Popover>
      <button>Sonraki</button>
    </>
  );
}

describe("Popover", () => {
  it("tetikleyici aria-expanded/haspopup; açılınca aria-controls → role=dialog, başlık adı", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Paylaş" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Paylaş" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
  });

  it("tıklamayla açılınca odak paneldeki ilk öğeye; Escape kapatır ve odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    await nextFrame();
    expect(screen.getByRole("textbox", { name: "Bağlantı" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paylaş" })).toHaveFocus();
  });

  it("son öğeden Tab kapatır ve odak doğal akışla tetikleyiciden SONRAKİ öğeye geçer", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    await nextFrame();
    await user.tab();
    expect(screen.getByRole("button", { name: "Kopyala" })).toHaveFocus();
    await user.tab();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sonraki" })).toHaveFocus();
  });

  it("ilk öğeden Shift+Tab kapatır, odak tetikleyicide", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    await nextFrame();
    await user.tab({ shift: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paylaş" })).toHaveFocus();
  });

  it("dışarı tıklama kapatır; panele tıklama kapatmaz", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    await user.click(screen.getByRole("button", { name: "Kopyala" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Önceki" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hover: gecikmeyle açılır, panele geçerken kapanmaz; klavye odağı da açar", () => {
    vi.useFakeTimers();
    render(<Harness trigger="hover" />);
    const trigger = screen.getByRole("button", { name: "Paylaş" });
    fireEvent.mouseEnter(trigger.parentElement!);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseLeave(trigger.parentElement!);
    fireEvent.mouseEnter(dialog);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.mouseLeave(dialog);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => trigger.focus());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("focus: odak tetikleyicide kalır", () => {
    render(<Harness trigger="focus" />);
    const trigger = screen.getByRole("button", { name: "Paylaş" });
    act(() => trigger.focus());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("içindeki bir düğmeyle kapanınca (kontrollü open) odak tetikleyiciye döner — body'ye düşmez", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover open={open} onOpenChange={setOpen} title="Filtre" content={<button onClick={() => setOpen(false)}>Uygula</button>}>
          <button>Durum</button>
        </Popover>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Durum" }));
    await nextFrame();
    await user.click(screen.getByRole("button", { name: "Uygula" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Durum" })).toHaveFocus();
  });

  it("skeleton: içerik yer tutucu, meşgul bildirir", async () => {
    const user = userEvent.setup();
    render(<Harness skeleton />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("textbox", { name: "Bağlantı" })).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez — açıkken (axe-core)", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Paylaş" }));
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
