import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Steps } from "./Steps";
import { getA11yViolations } from "../testUtils/a11y";

const data = [
  { title: "Bilet", step: 1 },
  { title: "Zaman", step: 2 },
  { title: "Onay", step: 3 },
];

describe("Steps", () => {
  it("onChange verildiğinde adımlar klavyeyle tetiklenebilir (Faz 13.5 kullanıcı bulgusu — eskiden role=none bir div, klavyeyle asla erişilemiyordu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Steps data={data} currentStep={1} onChange={onChange} />);

    const step2 = screen.getByRole("button", { name: /Zaman/ });
    await user.tab();
    await user.tab();
    expect(step2).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("geçerli adım aria-current=\"step\" taşır", () => {
    render(<Steps data={data} currentStep={2} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Zaman/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Bilet/ })).not.toHaveAttribute("aria-current");
  });

  it("onChange verilmediğinde adımlar interaktif değildir ve dahili Geri/İleri butonları render edilmez (Faz 13.5 kullanıcı bulgusu — eskiden cursor-pointer her zaman vardı ama tıklama hiçbir şey yapmıyordu)", () => {
    render(<Steps data={data} currentStep={2} />);
    expect(screen.queryByRole("button", { name: /Zaman/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Geri" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "İleri" })).not.toBeInTheDocument();
  });

  it("son adımdayken \"İleri\" düğmesi \"Tamamla\"ya döner; onComplete verilmezse devre dışı kalır", () => {
    render(<Steps data={data} currentStep={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Tamamla" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "İleri" })).not.toBeInTheDocument();
  });

  it("onComplete verilirse son adımdaki \"Tamamla\" tıklanabilir olur ve çağrılır", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Steps data={data} currentStep={3} onChange={() => {}} onComplete={onComplete} />);
    const completeButton = screen.getByRole("button", { name: "Tamamla" });
    expect(completeButton).toBeEnabled();
    await user.click(completeButton);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("durumlar currentStep'ten türetilir ve ekran okuyucuya metinle bildirilir", () => {
    render(<Steps data={data} currentStep={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("(tamamlandı)");
    expect(items[1]).toHaveTextContent("(devam ediyor)");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).toHaveTextContent("(bekliyor)");
  });

  it("status=\"error\" geçerli adımı hata olarak gösterir; item.status her zaman kazanır", () => {
    render(<Steps data={[...data.slice(0, 2), { title: "Onay", step: 3, status: "finish" }]} currentStep={2} status="error" />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveTextContent("(hata)");
    expect(items[2]).toHaveTextContent("(tamamlandı)");
  });

  it("step verilmezse sıra kullanılır; disabled adım tıklanamaz", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Steps data={[{ title: "A" }, { title: "B", disabled: true }, { title: "C" }]} currentStep={1} onChange={onChange} />);
    expect(screen.getByRole("button", { name: /B/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /^C/ }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("geçerli adıma tekrar tıklamak onChange'i çağırmaz", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Steps data={data} currentStep={2} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /Zaman/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("showActions={false} ile adımlar tıklanabilir kalır ama Geri/İleri çubuğu çıkmaz", () => {
    render(<Steps data={data} currentStep={2} onChange={() => {}} showActions={false} />);
    expect(screen.getByRole("button", { name: /Zaman/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "İleri" })).not.toBeInTheDocument();
  });

  it("percent geçerli adımın durum metnine eklenir", () => {
    render(<Steps data={data} currentStep={2} percent={64} />);
    expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("(devam ediyor, %64)");
  });

  describe("dar kapsayıcı (responsive)", () => {
    // jsdom'da ResizeObserver yok — kapsayıcıyı 320px ölçen bir taklit.
    class NarrowObserver {
      constructor(private cb: ResizeObserverCallback) {}
      observe() {
        this.cb([{ contentRect: { width: 320 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
    beforeEach(() => vi.stubGlobal("ResizeObserver", NarrowObserver));
    afterEach(() => vi.unstubAllGlobals());

    it("responsiveLayout=\"compact\": görünür özet \"Adım 2/3\" çıkar, adımlar ekran okuyucu için adlarını korur", async () => {
      render(<Steps data={data} currentStep={2} onChange={() => {}} responsiveLayout="compact" />);
      expect(await screen.findByText("Adım 2/3")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Zaman \(devam ediyor\)/ })).toHaveAttribute("aria-current", "step");
    });

    it("responsive={false} dar kapsayıcıda da yatay kalır", () => {
      render(<Steps data={data} currentStep={2} responsive={false} responsiveLayout="compact" />);
      expect(screen.queryByText("Adım 2/3")).not.toBeInTheDocument();
    });
  });

  it.each([
    ["yatay", {}],
    ["dikey", { vertical: true }],
    ["nokta", { dot: true }],
    ["başlık altı + outlined", { labelPlacement: "vertical" as const, variant: "outlined" as const }],
  ])("erişilebilirlik ihlali içermez — %s", async (_, extra) => {
    const { container } = render(<Steps data={data} currentStep={2} onChange={() => {}} {...extra} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Steps data={data} currentStep={2} onChange={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
