import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calendar } from "../calendar";
import { ColorPicker } from "../color-picker";
import { DatePicker } from "../date-picker";
import { Field } from "../field";
import { Input } from "../input";
import { Segmented } from "../segmented";
import { Transfer } from "../transfer";
import { TreeSelect } from "../tree-select";
import { FloatButton, FloatButtonGroup } from "../float-button";
import { Tour } from "../tour";
import { AutoComplete } from "../autocomplete";
import { Avatar, AvatarGroup } from "../avatar";
import { Popconfirm } from "../popconfirm";
import { Slider } from "../slider";
import { ToastProvider } from "../toast";
import { Upload } from "../upload";

/**
 * Faz 16 kalite turu — 16.1–16.5'te eklenen bileşenlerin iskeleti: tek
 * `skeleton` prop'u, yer tutucu erişilebilirlik ağacında değil, etkileşimli
 * öğe kalmıyor (Faz 15 sözleşmesi). Yerleşim kaymaması tarayıcıda ölçülür.
 */
// `invisible` (visibility:hidden) ata içindekiler tarayıcıda odaklanamaz — jsdom bunu hesaplamaz, elle dışla.
const noInteractive = (root: HTMLElement) =>
  [...root.querySelectorAll("button, input:not([type=hidden]), [tabindex='0'], [role=combobox], [role=gridcell]")].filter((el) => !el.closest(".invisible")).length;

describe("Faz 16 iskeletleri", () => {
  it("ColorPicker: metinli tetikleyici gerçek metni şeffaf çizer (genişlik birebir)", () => {
    const { container } = render(<ColorPicker defaultValue="#2f66a3" showText skeleton />);
    const box = container.querySelector("[data-skeleton]")!;
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveTextContent("#2F66A3");
    expect(box.className).toContain("text-transparent");
    expect(noInteractive(container)).toBe(0);
  });

  it("Transfer: iki liste yapısı korunur, satırlar ve düğmeler yer tutucu; grup gizli", () => {
    const { container } = render(<Transfer aria-label="Yetkiler" dataSource={[{ key: "a", title: "A" }]} showSearch skeleton footer={() => "Alt"} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("[role=group][aria-labelledby]")).toHaveLength(2);
    expect(container.querySelectorAll("li [data-skeleton]").length).toBeGreaterThan(0);
    expect(screen.queryByText("A")).toBeNull();
    expect(noInteractive(container)).toBe(0);
  });

  it("TreeSelect ve DatePicker: alan geometrisinde tek blok", () => {
    const { container } = render(
      <>
        <TreeSelect treeData={[]} skeleton />
        <DatePicker skeleton mode="datetime" />
      </>
    );
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-skeleton]")[1]!.className).toContain("max-w-60");
    expect(noInteractive(container)).toBe(0);
  });

  it("Calendar: başlık kontrolleri ve ızgara aynı yapıda, gün numaraları yer tutucu", () => {
    const { container } = render(<Calendar defaultValue={new Date(2026, 9, 14)} skeleton />);
    expect(container.querySelector("section")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("table")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("tbody td")).toHaveLength(42);
    expect(container.querySelectorAll("tbody [data-skeleton]")).toHaveLength(42);
    expect(noInteractive(container)).toBe(0);
  });

  it("Field skeleton: etiket/ipucu yer tutucu ve İÇİNDEKİ kontrol de iskelet (tek prop)", () => {
    const { container } = render(
      <>
        <Field label="Ad" hint="Tam adınız" skeleton>
          <Input />
        </Field>
        <Field label="Görünüm" skeleton>
          <Segmented options={["Liste", "Kart"]} />
        </Field>
      </>
    );
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    // Etiket + ipucu + kontrol (Input) + etiket + kontrol (Segmented)
    expect(container.querySelectorAll("[data-skeleton]").length).toBeGreaterThanOrEqual(5);
  });

  it("Field içinde kontrolün kendi skeleton=false'u kazanır", () => {
    render(
      <Field label="Ad" skeleton>
        <Input skeleton={false} />
      </Field>
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("FloatButtonGroup skeleton içindeki düğmelere geçer; menü grubunda ana düğme yer tutucu", () => {
    const { container, rerender } = render(
      <FloatButtonGroup skeleton>
        <FloatButton aria-label="A" />
        <FloatButton aria-label="B" />
      </FloatButtonGroup>
    );
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(2);
    expect(noInteractive(container)).toBe(0);
    rerender(
      <FloatButtonGroup trigger="click" skeleton>
        <FloatButton aria-label="A" />
      </FloatButtonGroup>
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("Tour skeleton: panel içeriği ve düğmeler yer tutucu, panel (dialog) yerinde", () => {
    render(<Tour open skeleton steps={[{ title: "Başlık", description: "Açıklama" }, { title: "İki" }]} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelectorAll("[data-skeleton]").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole("button", { name: "Sonraki" })).toBeNull();
    expect(screen.getByRole("button", { name: "Turu kapat" })).toBeInTheDocument();
  });
});

describe("İskelet testi eksik olanlar (Faz 15'ten)", () => {
  it("AvatarGroup: grup iskeleti avatarlara ve +N'e geçer; avatarın kendi değeri kazanır", () => {
    const { container, rerender } = render(
      <AvatarGroup max={2} skeleton>
        <Avatar alt="Ayşe" />
        <Avatar alt="Can" />
        <Avatar alt="Ece" />
      </AvatarGroup>
    );
    expect(screen.getByRole("group")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(3);
    expect(screen.queryByText("+1")).toBeNull();
    rerender(
      <AvatarGroup skeleton>
        <Avatar alt="Ayşe" skeleton={false} />
        <Avatar alt="Can" />
      </AvatarGroup>
    );
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(1);
  });

  it("AutoComplete ve Slider: alan/ray geometrisinde yer tutucu, etkileşim yok", () => {
    const { container } = render(
      <>
        <AutoComplete options={[]} skeleton />
        <Slider skeleton />
      </>
    );
    expect(container.querySelectorAll("[data-skeleton]").length).toBeGreaterThanOrEqual(3);
    expect(noInteractive(container)).toBe(0);
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("Upload: düğme, sürükle-bırak ve önizleme biçimlerinde yer tutucu", () => {
    const { container, rerender } = render(<Upload skeleton />, { wrapper: ToastProvider });
    expect(container.querySelector("[data-skeleton]")).toBeInTheDocument();
    expect(noInteractive(container)).toBe(0);
    rerender(<Upload skeleton inputType="dragDrop" />);
    expect(container.querySelector("[data-skeleton]")!.className).toContain("w-full");
    expect(noInteractive(container)).toBe(0);
  });

  it("Popconfirm: panel içeriği iskelet, onay düğmeleri yer tutucu", async () => {
    render(
      <Popconfirm title="Silinsin mi?" description="Geri alınamaz." open skeleton onConfirm={() => undefined}>
        <button>Sil</button>
      </Popconfirm>
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(dialog.querySelectorAll("[data-skeleton]").length).toBeGreaterThan(0);
  });
});

