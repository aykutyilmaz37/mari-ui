import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { ColorPicker } from "./ColorPicker";
import { getA11yViolations } from "../testUtils/a11y";

// Popover konumu rAF ile ölçülür; odak panele ölçümden sonra geçer.
const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

async function openPicker(user: ReturnType<typeof userEvent.setup>, name = /Renk seç/) {
  await user.click(screen.getByRole("button", { name }));
  await nextFrame();
  return screen.getByRole("dialog", { name: "Renk seçici" });
}

describe("ColorPicker", () => {
  it("tetikleyici: ad, seçili renk açıklamada, dialog popup", () => {
    render(<ColorPicker defaultValue="#1677ff" />);
    const trigger = screen.getByRole("button", { name: "Renk seç" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAccessibleDescription("#1677ff");
  });

  it("açılınca odak 2B alana geçer; ok tuşları doygunluk/parlaklığı değiştirir ve onChange/onChangeComplete çağrılır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(<ColorPicker defaultValue="hsb(0, 50%, 50%)" defaultFormat="hsb" onChange={onChange} onChangeComplete={onChangeComplete} />);
    await openPicker(user);
    const area = screen.getByRole("slider", { name: "Doygunluk ve parlaklık" });
    expect(area).toHaveFocus();
    expect(area).toHaveAttribute("aria-valuetext", "Doygunluk %50, parlaklık %50");
    await user.keyboard("{ArrowRight}{Shift>}{ArrowUp}{/Shift}");
    expect(onChange).toHaveBeenLastCalledWith("hsb(0, 51%, 60%)", expect.objectContaining({ hex: expect.any(String) }));
    expect(onChangeComplete).toHaveBeenCalledTimes(2);
  });

  it("ton kaydırıcısı gri renkte de tonu korur (RGB'ye gidip gelmez)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#808080" defaultFormat="hsb" onChange={onChange} />);
    await openPicker(user);
    const hue = screen.getByRole("slider", { name: "Ton" });
    hue.focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("hsb(360, 0%, 50%)", expect.anything());
    // Doygunluğu artırınca seçilen ton görünür hale gelir.
    screen.getByRole("slider", { name: "Doygunluk ve parlaklık" }).focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("hsb(360, 100%, 50%)", expect.anything());
  });

  it("hex girişi: 6 hane yazılınca uygulanır; geçersiz değer alandan çıkınca geri döner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onChange={onChange} />);
    await openPicker(user);
    const hex = screen.getByRole("textbox", { name: "Hex renk kodu" });
    await user.clear(hex);
    await user.type(hex, "1677ff");
    expect(onChange).toHaveBeenLastCalledWith("#1677ff", expect.anything());
    await user.clear(hex);
    await user.type(hex, "12");
    fireEvent.blur(hex);
    expect(hex).toHaveValue("1677ff");
  });

  it("biçim değişince girişler ve çıktı o biçime geçer; opaklık % ile verilir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#1677ff" onChange={onChange} />);
    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: "RGB" }));
    expect(screen.getByRole("spinbutton", { name: "Kırmızı" })).toHaveValue("22");
    const alpha = screen.getByRole("spinbutton", { name: "Opaklık" });
    await user.clear(alpha);
    await user.type(alpha, "50");
    expect(onChange).toHaveBeenLastCalledWith("rgba(22, 119, 255, 0.5)", expect.anything());
  });

  it("disabledAlpha: opaklık kaydırıcısı/girişi yok, değer hep opak", async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#1677ff80" disabledAlpha showText />);
    expect(screen.getByRole("button", { name: /Renk seç/ })).toHaveTextContent("#1677FF");
    await openPicker(user);
    expect(screen.queryByRole("slider", { name: "Opaklık" })).toBeNull();
    expect(screen.queryByRole("spinbutton", { name: "Opaklık" })).toBeNull();
  });

  it("hazır renk: tıklayınca seçilir ve aria-pressed olur; grup başlığı açar/kapatır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker presets={[{ label: "Marka", colors: ["#2f66a3", "#e11d48"] }]} onChange={onChange} />);
    await openPicker(user);
    const red = screen.getByRole("button", { name: "#e11d48" });
    await user.click(red);
    expect(onChange).toHaveBeenLastCalledWith("#e11d48", expect.anything());
    expect(red).toHaveAttribute("aria-pressed", "true");
    const group = screen.getByRole("button", { name: "Marka" });
    await user.click(group);
    expect(group).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "#e11d48" })).toBeNull();
  });

  it("allowClear: 'Renk yok' null bildirir; tetikleyici açıklaması güncellenir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#1677ff" allowClear onChange={onChange} />);
    await openPicker(user);
    await user.click(screen.getByRole("button", { name: "Renk yok" }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
    expect(screen.getByRole("button", { name: "Renk seç" })).toHaveAccessibleDescription("Renk yok");
  });

  it("kontrollü: dışarıdan gelen değer yansır; Escape kapatır ve odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>("#1677ff");
      return (
        <>
          <ColorPicker value={value} onChange={setValue} name="renk" />
          <button onClick={() => setValue("#e11d48")}>Kırmızı yap</button>
        </>
      );
    }
    const { container } = render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Kırmızı yap" }));
    expect(container.querySelector("input[name=renk]")).toHaveValue("#e11d48");
    await openPicker(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Renk seç" })).toHaveFocus();
  });

  it("Field içinde ad etiketten gelir; disabled açılmaz", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Tema rengi" hint="Marka rengi">
        <ColorPicker defaultValue="#1677ff" disabled />
      </Field>
    );
    const trigger = screen.getByRole("button", { name: "Tema rengi" });
    expect(trigger).toHaveAccessibleDescription(/#1677ff.*Marka rengi/);
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("axe: kapalı ve açık panel ihlalsiz", async () => {
    const user = userEvent.setup();
    const { container } = render(<ColorPicker defaultValue="#1677ff" allowClear presets={[{ label: "Marka", colors: ["#2f66a3"] }]} />);
    expect(await getA11yViolations(container)).toEqual([]);
    await openPicker(user);
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
