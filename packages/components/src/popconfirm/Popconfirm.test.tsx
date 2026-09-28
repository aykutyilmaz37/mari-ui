import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popconfirm } from "./Popconfirm";
import { getA11yViolations } from "../testUtils/a11y";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

function renderDelete(props: Partial<React.ComponentProps<typeof Popconfirm>> = {}) {
  render(
    <Popconfirm title="Bu görevi sil?" description="Alt görevler de silinir." color="error" okText="Sil" {...props}>
      <button>Sil</button>
    </Popconfirm>
  );
  return screen.getByRole("button", { name: "Sil" });
}

describe("Popconfirm", () => {
  it("alertdialog: soru adı, açıklama aria-describedby", async () => {
    const user = userEvent.setup();
    await user.click(renderDelete());
    const dialog = screen.getByRole("alertdialog", { name: "Bu görevi sil?" });
    expect(dialog).toHaveAccessibleDescription("Alt görevler de silinir.");
  });

  it("yıkıcı onayda ilk odak Vazgeç'te; yıkıcı değilse onayda", async () => {
    const user = userEvent.setup();
    await user.click(renderDelete());
    await nextFrame();
    expect(screen.getByRole("button", { name: "Vazgeç" })).toHaveFocus();
  });

  it("yıkıcı değilse ilk odak onay düğmesinde", async () => {
    const user = userEvent.setup();
    render(
      <Popconfirm title="Taslağı yayınla?" color="primary" okText="Yayınla">
        <button>Yayınla</button>
      </Popconfirm>
    );
    await user.click(screen.getByRole("button", { name: "Yayınla" }));
    await nextFrame();
    expect(screen.getAllByRole("button", { name: "Yayınla" }).at(-1)).toHaveFocus();
  });

  it("Vazgeç: onCancel, kapanır, odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const trigger = renderDelete({ onCancel });
    await user.click(trigger);
    await nextFrame();
    await user.click(screen.getByRole("button", { name: "Vazgeç" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("async onayda düğme yükleniyor, panel açık; bitince kapanır", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const trigger = renderDelete({ onConfirm });
    await user.click(trigger);
    const dialog = screen.getByRole("alertdialog");
    const ok = screen.getAllByRole("button", { name: "Sil" }).find((b) => dialog.contains(b))!;
    await user.click(ok);
    expect(ok).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await act(async () => resolve());
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("onConfirm reddedilirse panel açık kalır", async () => {
    const user = userEvent.setup();
    const trigger = renderDelete({ onConfirm: () => Promise.reject(new Error("ağ hatası")) });
    await user.click(trigger);
    const dialog = screen.getByRole("alertdialog");
    await user.click(screen.getAllByRole("button", { name: "Sil" }).find((b) => dialog.contains(b))!);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("disabled: açılmaz, tetikleyici olduğu gibi", async () => {
    const user = userEvent.setup();
    await user.click(renderDelete({ disabled: true }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez — açıkken (axe-core)", async () => {
    const user = userEvent.setup();
    await user.click(renderDelete());
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
