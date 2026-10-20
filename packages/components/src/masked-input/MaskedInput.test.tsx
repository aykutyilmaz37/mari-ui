import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "../input/Input";
import { clearNativeValue } from "../input/utils";
import { getA11yViolations } from "../testUtils/a11y";
import { MaskedInput } from "./MaskedInput";

/*
 * MaskedInput = Input + `mask` (Faz 4b'de Input'tan ayrıldı; @react-input/mask
 * yalnız burada). Görünüm Input'la aynı kalmalı, maske girişi biçimlemeli.
 * Giriş `paste` ile: user-event'in tuş tuş imleç simülasyonu jsdom'da maske
 * kütüphanesinin seçim takibiyle uyuşmuyor (gerçek tarayıcıda sorun yok).
 */
describe("MaskedInput", () => {
  // Maske kütüphanesi odaktaki alanın imlecini setTimeout döngüsüyle izler ve döngüyü
  // yalnız blur'da durdurur; test bitince jsdom kapanırken döngü "window is not defined" atardı.
  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it.each([
    ["sade", { id: "a", "aria-label": "Telefon", placeholder: "(___) ___ __ __" }],
    ["ikon + temizle + boyut + renk", { id: "b", "aria-label": "Kart", allowClear: true, size: "sm", color: "error", icon: <span>#</span> }],
    ["iskelet", { skeleton: true, size: "lg", className: "w-40" }],
  ] as const)("%s: Input ile aynı DOM", (_, props) => {
    const masked = render(<MaskedInput mask="(___) ___ __ __" {...props} />).container.innerHTML;
    const plain = render(<Input {...props} />).container.innerHTML;
    expect(masked).toBe(plain);
  });

  it("girişi kalıba göre biçimler, kalıp dışı karakteri almaz", async () => {
    const onChange = vi.fn();
    render(<MaskedInput aria-label="Telefon" mask="(___) ___ __ __" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Telefon" });
    await userEvent.click(input);
    await userEvent.paste("532a1234567");
    expect(input).toHaveValue("(532) 123 45 67");
    expect(onChange).toHaveBeenCalled();
  });

  it("replacement: harf kabul eden yer tutucu", async () => {
    render(<MaskedInput aria-label="Plaka" mask="__ ___ __" replacement={{ _: /[\dA-Z]/ }} />);
    const input = screen.getByRole("textbox", { name: "Plaka" });
    await userEvent.click(input);
    await userEvent.paste("34abC12");
    expect(input).toHaveValue("34 C12");
  });

  it("Enter Input'taki gibi onPressEnter'ı tetikler", async () => {
    const onPressEnter = vi.fn();
    render(<MaskedInput aria-label="Tarih" mask="__/__" onPressEnter={onPressEnter} />);
    const input = screen.getByRole("textbox", { name: "Tarih" });
    await userEvent.click(input);
    await userEvent.paste("1225");
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("12/25");
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  /*
   * Temizle: maske kütüphanesi seçimi zamanlayıcıyla izler ve seçimsiz boşaltmayı
   * geri alıyordu. Düzeltme, boşaltmadan ÖNCE tümünü seçmek (tarayıcıda doğrulandı;
   * jsdom'da kütüphanenin zamanlayıcı akışı tarayıcıyla aynı değil). Burada sıra kilitlenir.
   */
  it("temizle: değeri boşaltmadan önce tümünü seçer", () => {
    const input = document.createElement("input");
    input.value = "12/25";
    const calls: string[] = [];
    input.select = () => calls.push(`select:${input.value}`);
    input.addEventListener("input", () => calls.push(`input:${input.value}`));
    clearNativeValue(input);
    expect(calls).toEqual(["select:12/25", "input:"]);
  });

  it("a11y ihlali yok", async () => {
    const { container } = render(<MaskedInput aria-label="Telefon" mask="(___) ___ __ __" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
