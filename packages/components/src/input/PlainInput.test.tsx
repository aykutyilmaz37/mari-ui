import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";
import { PlainInput, type PlainInputProps } from "./PlainInput";

/*
 * PlainInput = mask/mentions'sız Input (Faz 4b). İç bileşenler onu kullanıyor;
 * bu özellikler verilmediğinde Input ile birebir aynı çıktıyı vermeli.
 */
describe("PlainInput", () => {
  it.each<[string, PlainInputProps]>([
    ["sade", { id: "a", "aria-label": "Ad", placeholder: "Ad" }],
    ["ikon + temizle + sayaç", { id: "b", "aria-label": "Ara", allowClear: true, showCount: true, maxLength: 10, defaultValue: "abc", icon: <span>#</span> }],
    ["şifre + boyut + renk", { id: "c", "aria-label": "Şifre", type: "password", size: "sm", color: "error", variant: "soft" }],
    ["iskelet", { skeleton: true, size: "lg", className: "w-40" }],
  ])("%s: Input ile aynı DOM", (_, props) => {
    const plain = render(<PlainInput {...props} />).container.innerHTML;
    const full = render(<Input {...props} />).container.innerHTML;
    expect(plain).toBe(full);
  });

  it("yazma, Enter ve temizleme olayları Input'taki gibi çalışır", async () => {
    const onChange = vi.fn();
    const onPressEnter = vi.fn();
    const { getByRole } = render(<PlainInput aria-label="Ad" allowClear onChange={onChange} onPressEnter={onPressEnter} />);
    const input = getByRole("textbox");
    await userEvent.type(input, "mari{Enter}");
    expect(input).toHaveValue("mari");
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    await userEvent.click(getByRole("button", { name: "Temizle" }));
    expect(input).toHaveValue("");
  });
});
