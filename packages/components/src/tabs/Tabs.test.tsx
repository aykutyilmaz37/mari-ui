import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";
import type { TabsProps } from "./types";
import { getA11yViolations } from "../testUtils/a11y";

function setup(props: Partial<TabsProps> = {}, { disableSecond = false } = {}) {
  return render(
    <Tabs defaultActiveTab="tab1" {...props}>
      <TabsList aria-label="Örnek">
        <TabsTrigger value="tab1">Sekme 1</TabsTrigger>
        <TabsTrigger value="tab2" disabled={disableSecond}>
          Sekme 2
        </TabsTrigger>
        <TabsTrigger value="tab3" count={4}>
          Sekme 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
      <TabsContent value="tab3">Sekme 3 içeriği</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("bir sekmeye tıklayınca ilgili panel gösterilir, diğeri kaldırılır", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText("Sekme 1 içeriği")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Sekme 2" }));
    expect(screen.getByText("Sekme 2 içeriği")).toBeInTheDocument();
    expect(screen.queryByText("Sekme 1 içeriği")).not.toBeInTheDocument();
  });

  it("ARIA sekme semantiği: tablist/tab/tabpanel + aria-selected + aria-labelledby", () => {
    setup();
    expect(screen.getByRole("tablist", { name: "Örnek" })).toHaveAttribute("aria-orientation", "horizontal");
    const tab1 = screen.getByRole("tab", { name: "Sekme 1" });
    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Sekme 2" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tab1.id);
  });

  it("roving tabindex: yalnız aktif sekme Tab durağıdır", () => {
    setup();
    expect(screen.getByRole("tab", { name: "Sekme 1" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Sekme 2" })).toHaveAttribute("tabindex", "-1");
  });

  it("ok tuşları + Home/End ile gezinir (automatic: odaklanan sekme etkinleşir), disabled sekme atlanır", async () => {
    const user = userEvent.setup();
    setup({}, { disableSecond: true });
    await user.tab();
    expect(screen.getByRole("tab", { name: "Sekme 1" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    const tab3 = screen.getByRole("tab", { name: /Sekme 3/ });
    expect(tab3).toHaveFocus();
    expect(tab3).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}"); // döngüsel
    expect(screen.getByRole("tab", { name: "Sekme 1" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(tab3).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Sekme 1" })).toHaveFocus();
  });

  it("activationMode=\"manual\": ok tuşu sadece odağı taşır, Enter etkinleştirir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    setup({ activationMode: "manual", onChange });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Sekme 2" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("aynı sayfada iki Tabs aynı value'ları kullansa da id'ler çakışmaz", () => {
    render(
      <>
        <Tabs defaultActiveTab="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs defaultActiveTab="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
      </>
    );
    const [first, second] = screen.getAllByRole("tab");
    expect(first?.id).not.toBe(second?.id);
  });

  it("keepMounted: pasif paneller DOM'da gizli kalır", async () => {
    const user = userEvent.setup();
    setup({ keepMounted: true });
    expect(screen.getByText("Sekme 2 içeriği").closest("[role=tabpanel]")).toHaveAttribute("hidden");
    await user.click(screen.getByRole("tab", { name: "Sekme 2" }));
    expect(screen.getByText("Sekme 1 içeriği").closest("[role=tabpanel]")).toHaveAttribute("hidden");
  });

  it("defaultActiveTab verilmezse ilk etkin sekme seçilir", () => {
    setup({ defaultActiveTab: undefined });
    expect(screen.getByRole("tab", { name: "Sekme 1" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Sekme 1 içeriği")).toBeInTheDocument();
  });

  it("dikey Tabs dar kapsayıcıda yataya döner (responsive)", async () => {
    class NarrowObserver {
      constructor(private cb: ResizeObserverCallback) {}
      observe() {
        this.cb([{ contentRect: { width: 360 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", NarrowObserver);
    try {
      setup({ orientation: "vertical" });
      await vi.waitFor(() => expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal"));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("count rozeti sekme adının parçası olarak okunur", () => {
    setup();
    expect(screen.getByRole("tab", { name: "Sekme 3 4" })).toBeInTheDocument();
  });

  it.each([
    ["line", {}],
    ["card", { variant: "card" as const }],
    ["pills", { variant: "pills" as const }],
    ["dikey", { orientation: "vertical" as const }],
  ])("erişilebilirlik ihlali içermez — %s", async (_, props) => {
    const { container } = setup(props);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("skeleton: sekmeler odaklanamaz ve seçilemez, panel içeriği görünmez kopyada, aria-busy", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = setup({ skeleton: true, onChange });
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    const tabs = container.querySelectorAll('[role="tab"]');
    for (const tab of tabs) expect(tab).toHaveAttribute("tabindex", "-1");
    (tabs[1] as HTMLElement).click();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Sekme 1 içeriği").closest(".invisible")).not.toBeNull();
    expect(container.querySelector('[role="tabpanel"]')).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("aria-controls yalnız DOM'daki panele işaret eder (axe aria-valid-attr-value: panelsiz filtre çubuğu, pasif paneller)", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const [first, second] = screen.getAllByRole("tab");
    expect(first).toHaveAttribute("aria-controls", screen.getByRole("tabpanel").id);
    expect(second).not.toHaveAttribute("aria-controls");
    await user.click(second!);
    expect(second).toHaveAttribute("aria-controls", screen.getByRole("tabpanel").id);
    expect(first).not.toHaveAttribute("aria-controls");
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("paneli olmayan Tabs (filtre çubuğu) aria-controls vermez ve ihlal içermez", async () => {
    const { container } = render(
      <Tabs defaultActiveTab="week">
        <TabsList>
          <TabsTrigger value="day">Gün</TabsTrigger>
          <TabsTrigger value="week">Hafta</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    for (const tab of screen.getAllByRole("tab")) expect(tab).not.toHaveAttribute("aria-controls");
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
