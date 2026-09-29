import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tree } from ".";
import type { TreeNode } from ".";
import { getA11yViolations } from "../testUtils/a11y";

const data: TreeNode[] = [
  {
    key: "src",
    title: "src",
    children: [
      { key: "app", title: "App.tsx" },
      { key: "lib", title: "lib", children: [{ key: "utils", title: "utils.ts" }, { key: "api", title: "api.ts" }] },
    ],
  },
  { key: "readme", title: "README.md" },
];

const item = (name: string) => screen.getByRole("treeitem", { name });

describe("Tree", () => {
  it("APG yapısı: tree + treeitem, seviye/konum/açık durumu; tek Tab durağı", () => {
    render(<Tree aria-label="Dosyalar" treeData={data} defaultExpandedKeys={["src"]} />);
    expect(screen.getByRole("tree", { name: "Dosyalar" })).toBeInTheDocument();
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    expect(item("lib")).toHaveAttribute("aria-expanded", "false");
    expect(item("App.tsx")).not.toHaveAttribute("aria-expanded");
    expect(item("App.tsx")).toHaveAttribute("aria-level", "2");
    expect(item("lib")).toHaveAttribute("aria-posinset", "2");
    expect(item("lib")).toHaveAttribute("aria-setsize", "2");
    expect(screen.getAllByRole("treeitem").filter((el) => el.tabIndex === 0)).toHaveLength(1);
    expect(screen.queryByRole("treeitem", { name: "utils.ts" })).not.toBeInTheDocument();
  });

  it("klavye: ↓ → ← Home End * ve harfle atlama", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Dosyalar" treeData={data} />);
    await user.tab();
    expect(item("src")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(item("App.tsx")).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}{ArrowRight}");
    expect(item("utils.ts")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("lib")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("lib")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{End}");
    expect(item("README.md")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("src")).toHaveFocus();
    await user.keyboard("r");
    expect(item("README.md")).toHaveFocus();
  });

  it("kapanan ebeveynin altındaki odak ebeveyne taşınır", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Dosyalar" treeData={data} defaultExpandAll />);
    await user.click(screen.getByText("utils.ts"));
    expect(item("utils.ts")).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(item("lib")).toHaveAttribute("aria-expanded", "false");
    expect(item("lib")).toHaveAttribute("tabindex", "0");
  });

  it("seçim: tıklama/Enter tekli seçer; multiple'da birikir", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(<Tree aria-label="Dosyalar" treeData={data} onSelect={onSelect} />);
    await user.click(screen.getByText("README.md"));
    expect(item("README.md")).toHaveAttribute("aria-selected", "true");
    expect(onSelect).toHaveBeenLastCalledWith(["readme"], expect.objectContaining({ selected: true }));
    await user.keyboard("{Home}{Enter}");
    expect(item("src")).toHaveAttribute("aria-selected", "true");
    expect(item("README.md")).toHaveAttribute("aria-selected", "false");

    rerender(<Tree aria-label="Dosyalar" treeData={data} multiple onSelect={onSelect} />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    await user.click(screen.getByText("README.md"));
    expect(onSelect).toHaveBeenLastCalledWith(["src", "readme"], expect.anything());
  });

  it("onay kutuları: Space işaretler, üst/alt yayılım ve mixed", async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(<Tree aria-label="İzinler" checkable treeData={data} defaultExpandAll onCheck={onCheck} />);
    await user.click(screen.getByText("api.ts"));
    // Tıklama seçer; işaret Space ile.
    await user.keyboard(" ");
    expect(item("api.ts")).toHaveAttribute("aria-checked", "true");
    expect(item("lib")).toHaveAttribute("aria-checked", "mixed");
    expect(item("src")).toHaveAttribute("aria-checked", "mixed");
    await user.keyboard("{ArrowUp} ");
    expect(item("lib")).toHaveAttribute("aria-checked", "true");
    expect(onCheck).toHaveBeenLastCalledWith(["lib", "utils", "api"], expect.objectContaining({ checked: true, halfCheckedKeys: ["src"] }));
  });

  it("tembel yükleme: açınca loadData çağrılır, bu sırada aria-busy", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    function Lazy() {
      const [tree, setTree] = useState<TreeNode[]>([{ key: "root", title: "Bölgeler" }]);
      const loadData = () =>
        new Promise<void>((r) => {
          resolve = () => {
            setTree([{ key: "root", title: "Bölgeler", children: [{ key: "marmara", title: "Marmara", isLeaf: true }] }]);
            r();
          };
        });
      return <Tree aria-label="Bölgeler" treeData={tree} loadData={loadData} />;
    }
    render(<Lazy />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(item("Bölgeler")).toHaveAttribute("aria-busy", "true");
    await act(async () => resolve());
    expect(item("Bölgeler")).not.toHaveAttribute("aria-busy");
    expect(item("Marmara")).toBeInTheDocument();
  });

  it("arama: eşleşmeyenler gizlenir, atalar açılır, eşleşme vurgulanır; sonuç yoksa mesaj", () => {
    const { rerender, container } = render(<Tree aria-label="Dosyalar" treeData={data} searchValue="API" />);
    expect(screen.getAllByRole("treeitem").map((el) => el.textContent)).toEqual(["src", "lib", "api.ts"]);
    expect(container.querySelector("mark")).toHaveTextContent("api");
    rerender(<Tree aria-label="Dosyalar" treeData={data} searchValue="yokyok" />);
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(screen.getByText("Sonuç bulunamadı")).toBeInTheDocument();
  });

  it("devre dışı düğüm seçilemez", async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="x" treeData={[{ key: "a", title: "Arşiv", disabled: true }]} />);
    await user.click(screen.getByText("Arşiv"));
    expect(item("Arşiv")).toHaveAttribute("aria-disabled", "true");
    expect(item("Arşiv")).toHaveAttribute("aria-selected", "false");
  });

  it("skeleton: ağaç rolü yok, aria-hidden; veri yokken yer tutucu", () => {
    const { container, rerender } = render(<Tree aria-label="x" skeleton treeData={data} />);
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<Tree aria-label="x" skeleton treeData={[]} />);
    expect(container.querySelector("[data-skeleton]")).not.toBeNull();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Tree aria-label="Dosyalar" treeData={data} defaultExpandAll showLine defaultSelectedKeys={["app"]} />
        <Tree aria-label="İzinler" checkable treeData={data} defaultExpandAll defaultCheckedKeys={["utils"]} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
    expect(within(screen.getByRole("tree", { name: "İzinler" })).getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-checked", "mixed");
  });
});
