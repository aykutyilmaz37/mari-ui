import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import type { TreeNode } from "../tree/types";
import { TreeSelect } from "./TreeSelect";
import { getA11yViolations } from "../testUtils/a11y";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

const data: TreeNode[] = [
  {
    key: "tr",
    title: "Türkiye",
    children: [
      { key: "ist", title: "İstanbul", children: [{ key: "kad", title: "Kadıköy" }, { key: "bes", title: "Beşiktaş" }] },
      { key: "ank", title: "Ankara", children: [{ key: "cank", title: "Çankaya" }] },
    ],
  },
  { key: "de", title: "Almanya", selectable: false, children: [{ key: "ber", title: "Berlin", disabled: true }] },
];

const activeName = (combo: HTMLElement) => document.getElementById(combo.getAttribute("aria-activedescendant")!)?.textContent;

describe("TreeSelect", () => {
  it("combobox + tree popup; klavye: ↓ açar, →/← dal, Enter seçer ve kapatır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TreeSelect aria-label="Konum" treeData={data} onChange={onChange} />);
    const combo = screen.getByRole("combobox", { name: "Konum" });
    expect(combo).toHaveAttribute("aria-haspopup", "tree");
    combo.focus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    const tree = screen.getByRole("tree");
    expect(combo).toHaveAttribute("aria-controls", tree.id);
    expect(activeName(combo)).toBe("Türkiye");
    await user.keyboard("{ArrowRight}");
    expect(within(tree).getByRole("treeitem", { name: "Türkiye" })).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(activeName(combo)).toBe("İstanbul");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeName(combo)).toBe("Beşiktaş");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("bes", expect.objectContaining({ title: "Beşiktaş" }));
    expect(screen.queryByRole("tree")).toBeNull();
    expect(combo).toHaveTextContent("Beşiktaş");
    expect(combo).toHaveFocus();
  });

  it("seçilemeyen düğümde Enter dalı açar; tıklama ile seçim", async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Konum" treeData={data} defaultValue="kad" />);
    await user.click(screen.getByRole("combobox"));
    await nextFrame();
    // Seçili düğümün ataları açık, aktif = seçili.
    expect(screen.getByRole("treeitem", { name: "Kadıköy" })).toHaveAttribute("aria-selected", "true");
    expect(activeName(screen.getByRole("combobox"))).toBe("Kadıköy");
    await user.keyboard("{End}{Enter}");
    expect(screen.getByRole("treeitem", { name: "Almanya" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("treeitem", { name: "Berlin" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("treeitem", { name: "Ankara" }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Ankara");
  });

  it("checkable: yayılım, kısmi durum, parent stratejisi; etiketten kaldırma", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TreeSelect aria-label="Bölgeler" treeData={data} mode="checkable" showCheckedStrategy="parent" treeDefaultExpandAll onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await nextFrame();
    await user.click(screen.getByRole("treeitem", { name: "Kadıköy" }));
    expect(screen.getByRole("treeitem", { name: "İstanbul" })).toHaveAttribute("aria-checked", "mixed");
    await user.click(screen.getByRole("treeitem", { name: "Beşiktaş" }));
    expect(onChange).toHaveBeenLastCalledWith(["ist"], [expect.objectContaining({ key: "ist" })]);
    expect(screen.getByRole("treeitem", { name: "İstanbul" })).toHaveAttribute("aria-checked", "true");
    // Panel çoklu modda açık kalır; etiket görünür.
    expect(screen.getByRole("tree")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "İstanbul seçimini kaldır" }));
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it("multiple: düğümler bağımsız; Backspace (aramada boşken) son etiketi siler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TreeSelect aria-label="Konum" treeData={data} mode="multiple" showSearch defaultValue={["tr", "kad"]} onChange={onChange} />);
    const combo = screen.getByRole("combobox");
    combo.focus();
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["tr"], expect.anything());
  });

  it("arama Türkçe harf duyarsız; eşleşmenin ataları açılır, vurgulanır; sonuç yoksa mesaj", async () => {
    const user = userEvent.setup();
    render(<TreeSelect aria-label="Konum" treeData={data} showSearch />);
    const combo = screen.getByRole("combobox");
    await user.type(combo, "KADI");
    await nextFrame();
    const tree = screen.getByRole("tree");
    // `<mark>` jsdom'da blok sayıldığından ad "Kadı köy" hesaplanıyor — tarayıcıda satır içi.
    expect(within(tree).getByRole("treeitem", { name: /^Kadı\s?köy$/ })).toBeInTheDocument();
    expect(within(tree).queryByRole("treeitem", { name: "Ankara" })).toBeNull();
    expect(tree.querySelector("mark")).toHaveTextContent("Kadı");
    expect(activeName(combo)).toBe("Kadıköy");
    await user.keyboard("{Enter}");
    expect(combo).toHaveValue("");
    await user.type(combo, "zzz");
    expect(screen.getByRole("status")).toHaveTextContent("Sonuç bulunamadı");
  });

  it("Field içinde adı etiketten; temizle; gizli alan", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Teslimat bölgesi">
        <TreeSelect treeData={data} defaultValue="cank" allowClear name="bolge" />
      </Field>
    );
    expect(screen.getByRole("combobox", { name: "Teslimat bölgesi" })).toHaveTextContent("Çankaya");
    expect(container.querySelector("input[name=bolge]")).toHaveValue("cank");
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(container.querySelector("input[name=bolge]")).toBeNull();
  });

  it("axe: kapalı ve açık ihlalsiz", async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeSelect aria-label="Bölgeler" treeData={data} mode="checkable" defaultValue={["kad"]} />);
    expect(await getA11yViolations(container)).toEqual([]);
    await user.click(screen.getByRole("combobox"));
    await nextFrame();
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
