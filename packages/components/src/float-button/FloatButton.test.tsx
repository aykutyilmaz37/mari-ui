import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BackTop } from "./BackTop";
import { FloatButton } from "./FloatButton";
import { FloatButtonGroup } from "./FloatButtonGroup";
import { defaultFocusTarget, opensUpward, shouldShowBackTop } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

const Icon = () => <svg data-testid="icon" />;

describe("FloatButton", () => {
  it("ikon-yalnız düğmede ad aria-label ya da düz metin tooltip; köşeye sabit", () => {
    const { container } = render(<FloatButton icon={<Icon />} tooltip="Yardım" placement="bottom-left" />);
    expect(screen.getByRole("button", { name: "Yardım" })).toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain("fixed");
    expect(container.firstElementChild!.className).toContain("left-[calc(1.5rem+env(safe-area-inset-left))]");
  });

  it("kare + açıklama: ad açıklamadan; href → bağlantı (_blank güvenli)", () => {
    render(<FloatButton shape="square" icon={<Icon />} description="Destek" href="https://mari-ui.com/destek" target="_blank" />);
    const link = screen.getByRole("link", { name: "Destek" });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("rozet ve tıklama", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<FloatButton icon={<Icon />} aria-label="Mesajlar" badge={{ count: 3 }} onClick={onClick} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mesajlar" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("statik grup: düğmeler sabit değil, kare grup birleşik", () => {
    const { container } = render(
      <FloatButtonGroup shape="square">
        <FloatButton icon={<Icon />} aria-label="A" />
        <FloatButton icon={<Icon />} aria-label="B" />
      </FloatButtonGroup>
    );
    expect(screen.getByRole("group")).toHaveClass("fixed");
    expect(screen.getByRole("button", { name: "A" }).className).toContain("rounded-none");
    expect(container.querySelectorAll(".fixed")).toHaveLength(1);
  });

  it("menü grubu: aria-expanded, kapalıyken alt düğmeler DOM'da yok; Escape kapatır ve odak ana düğmeye", async () => {
    const user = userEvent.setup();
    render(
      <FloatButtonGroup trigger="click" icon={<Icon />} aria-label="Oluştur">
        <FloatButton icon={<Icon />} aria-label="Yeni görev" />
        <FloatButton icon={<Icon />} aria-label="Yeni not" />
      </FloatButtonGroup>
    );
    const main = screen.getByRole("button", { name: "Oluştur" });
    expect(main).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Yeni görev" })).toBeNull();
    await user.click(main);
    expect(main).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Oluştur" })).toHaveAttribute("id", main.getAttribute("aria-controls"));
    await user.tab();
    expect(screen.getByRole("button", { name: "Yeni görev" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Yeni görev" })).toBeNull();
    expect(main).toHaveFocus();
  });

  it("menü grubu: dışarı tıklama kapatır", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Dışarı</button>
        <FloatButtonGroup trigger="click" icon={<Icon />} defaultOpen>
          <FloatButton icon={<Icon />} aria-label="X" />
        </FloatButtonGroup>
      </>
    );
    await user.click(screen.getByRole("button", { name: "Dışarı" }));
    expect(screen.queryByRole("button", { name: "X" })).toBeNull();
  });

  it("BackTop: eşikten sonra görünür; tıklayınca başa kaydırır ve odak h1'e", async () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as never;
    render(
      <>
        <h1>Sayfa</h1>
        <BackTop visibilityHeight={300} />
      </>
    );
    expect(screen.queryByRole("button", { name: "Başa dön" })).toBeNull();
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    fireEvent.click(screen.getByRole("button", { name: "Başa dön" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(screen.getByRole("heading", { name: "Sayfa" })).toHaveFocus();
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("yardımcılar", () => {
    expect(opensUpward("bottom-left")).toBe(true);
    expect(opensUpward("top-right")).toBe(false);
    expect(shouldShowBackTop(399, 400)).toBe(false);
    const main = document.createElement("main");
    document.body.appendChild(main);
    expect(defaultFocusTarget(document)).toBe(main);
    main.remove();
  });

  it("axe: tekli, açık menü", async () => {
    const { container } = render(
      <>
        <FloatButton icon={<Icon />} aria-label="Yardım" />
        <FloatButtonGroup trigger="click" icon={<Icon />} defaultOpen>
          <FloatButton icon={<Icon />} aria-label="Yeni" />
        </FloatButtonGroup>
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
