import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("label metnine tıklamak switch'i değiştirir (Faz 13 — eskiden label sadece dekoratifti)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Bildirimler" onChange={onChange} />);
    await user.click(screen.getByText("Bildirimler"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("label, switch'in erişilebilir adı olarak bağlıdır", () => {
    render(<Switch label="Bildirimler" />);
    expect(screen.getByRole("switch", { name: "Bildirimler" })).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Switch label="Bildirimler" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it.each([
    ["sm", "0.875rem"],
    ["md", "1.25rem"],
    ["lg", "1.625rem"],
  ] as const)(
    "boyut=%s işaretliyken thumb'ın sağ/üst/alt kenar payı (2px) simetrik olacak şekilde konumlanır (kullanıcı geri bildirimi: eskiden asimetrikti, lg elle devtools'ta düzeltilmişti)",
    (size, expectedCalc) => {
      render(<Switch label="X" size={size} checked onChange={() => {}} />);
      const thumb = screen.getByRole("switch").querySelector("span")!;
      expect(thumb.className).toContain(`left-[calc(100%-${expectedCalc})]`);
    }
  );

  it("iç etiket dikeyden ortalıdır (inset-y-0 + flex items-center — eskiden her boyutta aynı sabit top-1.5 kullanıyordu)", () => {
    render(<Switch switchFalseLabel="Kapalı" />);
    const label = screen.getByText("Kapalı");
    expect(label.className).toContain("inset-y-0");
    expect(label.className).toContain("items-center");
  });

  it("top her renkte beyaz (success/info'da siyah çıkıyordu) ve basılıyken uzar, odakta değil", () => {
    const { container } = render(<Switch aria-label="Yedek" color="success" defaultChecked />);
    const knob = container.querySelector("[role=switch] > span")!;
    expect(knob).toHaveClass("bg-white");
    expect(knob.className).toContain("group-active:scale-x-[1.166]");
    expect(knob.className).not.toContain("group-focus:");
  });

  it("kapalı track kenarlıksız nötr gri (kenarlık topu taşırıyordu)", () => {
    render(<Switch aria-label="Yedek" />);
    const track = screen.getByRole("switch");
    expect(track).toHaveClass("bg-mari-input");
    expect(track.className.split(" ")).not.toContain("border");
  });

  it("loading iken aria-busy; etiket yoksa aria-label", () => {
    render(<Switch aria-label="Yedek" loading />);
    expect(screen.getByRole("switch", { name: "Yedek" })).toHaveAttribute("aria-busy", "true");
  });

  it("skeleton: switch yok, gizli yer tutucu", () => {
    const { container } = render(<Switch label="Yedek" skeleton />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});


it("klavye ile açılıp kapatıldığında odağı korur", async () => {
  const user = userEvent.setup();
  render(<Switch label="Koyu tema" />);
  const control = screen.getByRole("switch", { name: "Koyu tema" });
  await user.tab();
  expect(control).toHaveFocus();
  await user.keyboard(" ");
  expect(control).toHaveAttribute("aria-checked", "true");
  expect(control).toHaveFocus();
  await user.keyboard(" ");
  expect(control).toHaveAttribute("aria-checked", "false");
  expect(control).toHaveFocus();

});
