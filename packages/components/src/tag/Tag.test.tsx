import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";
import { getA11yViolations } from "../testUtils/a11y";

describe("Tag", () => {
  it("kapatma butonunun adı hangi etiketi kaldırdığını söyler (listede 5 tane \"Kaldır\" ayırt edilemiyordu)", () => {
    render(<Tag onClose={() => {}}>React</Tag>);
    expect(screen.getByRole("button", { name: "React etiketini kaldır" })).toBeInTheDocument();
  });

  it("closeLabel ile ad özelleştirilebilir; metin olmayan içerikte varsayılan \"Kaldır\"", () => {
    const { rerender } = render(<Tag onClose={() => {}} closeLabel="Filtreyi temizle">Aktif</Tag>);
    expect(screen.getByRole("button", { name: "Filtreyi temizle" })).toBeInTheDocument();
    rerender(<Tag onClose={() => {}}><b>Aktif</b></Tag>);
    expect(screen.getByRole("button", { name: "Kaldır" })).toBeInTheDocument();
  });

  it("uzun metin tek satırda kalır ve kısaltılır", () => {
    render(<Tag>Çok uzun bir etiket metni</Tag>);
    expect(screen.getByText("Çok uzun bir etiket metni")).toHaveClass("truncate");
  });

  it("skeleton: metin şeffaf yerinde kalır (aynı genişlik), buton yok, gizli", () => {
    const { container } = render(<Tag skeleton onClose={() => {}}>Beklemede</Tag>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("text-transparent");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("onClose verilmezse kapatma butonu render edilmez", () => {
    render(<Tag>Etiket</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("kapatma butonu klavyeyle tetiklenebilir", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tag onClose={onClose}>Etiket</Tag>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Etiket etiketini kaldır" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Tag onClose={() => {}}>Etiket</Tag>);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
