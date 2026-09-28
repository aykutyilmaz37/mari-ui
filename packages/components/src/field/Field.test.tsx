import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";
import { Input, OtpInput, Textarea } from "../input";
import { Select } from "../select";
import { InputNumber } from "../input-number";
import { RadioGroup } from "../radio";
import { Segmented } from "../segmented";
import { getA11yViolations } from "../testUtils/a11y";

const describedText = (el: HTMLElement) =>
  (el.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)
    .join(" | ");

describe("Field", () => {
  it.each([
    ["Input", () => <Input />, "textbox"],
    ["Textarea", () => <Textarea />, "textbox"],
    ["Select", () => <Select options={[{ value: 1, label: "Bir" }]} />, "combobox"],
    ["Select (arama)", () => <Select showSearch options={[{ value: 1, label: "Bir" }]} />, "combobox"],
    ["InputNumber", () => <InputNumber />, "spinbutton"],
    ["OtpInput tek kutu", () => <OtpInput layout="single" length={4} />, "textbox"],
  ] as const)("%s: etiket adı olur, ipucu okunur, required iletilir", (_, control, role) => {
    render(
      <Field label="Alan" hint="Kısa açıklama" required>
        {control()}
      </Field>
    );
    // Ad "Alan" + görsel yıldız (aria-hidden) → "Alan".
    const el = screen.getByRole(role, { name: "Alan" });
    expect(describedText(el)).toBe("Kısa açıklama");
    expect(el.getAttribute("aria-required") === "true" || (el as HTMLInputElement).required).toBe(true);
  });

  it("hata: ipucunun yerine geçer, kontrol aria-invalid + hata rengi, metin canlı bölgede", () => {
    render(
      <Field label="E-posta" hint="İş adresiniz" error="Geçerli bir e-posta girin">
        <Input />
      </Field>
    );
    const input = screen.getByRole("textbox", { name: /E-posta/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(describedText(input)).toBe("Geçerli bir e-posta girin");
    expect(screen.queryByText("İş adresiniz")).not.toBeInTheDocument();
    expect(screen.getByText("Geçerli bir e-posta girin")).toHaveAttribute("aria-live", "polite");
  });

  it("canlı bölge hata yokken de DOM'da (sonradan gelen hata duyurulsun), boş", async () => {
    const user = userEvent.setup();
    function Form() {
      const [error, setError] = useState<string>();
      return (
        <>
          <Field label="Ad" error={error}>
            <Input />
          </Field>
          <button onClick={() => setError("Ad gerekli")}>Gönder</button>
        </>
      );
    }
    const { container } = render(<Form />);
    const region = container.querySelector('[aria-live="polite"]')!;
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();
    await user.click(screen.getByRole("button", { name: "Gönder" }));
    expect(screen.getByText("Ad gerekli")).toBe(region);
    expect(screen.getByRole("textbox", { name: "Ad" })).toHaveAttribute("aria-invalid", "true");
  });

  it("disabled kontrolü de devre dışı bırakır", () => {
    render(
      <Field label="Adet" disabled>
        <InputNumber />
      </Field>
    );
    expect(screen.getByRole("spinbutton", { name: "Adet" })).toBeDisabled();
  });

  it("kontrolün kendi id'si ve aria-describedby'si kazanır; etiket o id'ye bağlanır", () => {
    render(
      <>
        <p id="extra">Ek bilgi</p>
        <Field label="Kod" hint="6 hane">
          <Input id="promo" aria-describedby="extra" />
        </Field>
      </>
    );
    const input = screen.getByRole("textbox", { name: "Kod" });
    expect(input).toHaveAttribute("id", "promo");
    expect(describedText(input)).toBe("Ek bilgi | 6 hane");
  });

  it.each([
    ["RadioGroup", () => <RadioGroup options={["Standart", "Hızlı"]} />],
    ["Segmented", () => <Segmented options={["Aylık", "Yıllık"]} />],
    ["OtpInput kutucuklu", () => <OtpInput length={4} />],
  ] as const)("%s: grup — etiket <label for> değil grubun adı, ipucu grupta", (name, control) => {
    const { container } = render(
      <Field label="Seçim" hint="Birini seçin" error={name === "RadioGroup" ? "Seçim gerekli" : undefined}>
        {control()}
      </Field>
    );
    const group = screen.getByRole(name === "OtpInput kutucuklu" ? "group" : "radiogroup", { name: "Seçim" });
    expect(container.querySelector("label[for]")).toBeNull();
    expect(describedText(group)).toBe(name === "RadioGroup" ? "Seçim gerekli" : "Birini seçin");
    if (name === "RadioGroup") expect(group).toHaveAttribute("aria-invalid", "true");
  });

  it("OtpInput hücreleri Field'ın id'sini almaz (hepsi aynı id olurdu)", () => {
    const { container } = render(
      <Field label="Kod">
        <OtpInput length={4} />
      </Field>
    );
    const ids = [...container.querySelectorAll("input")].map((i) => i.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Field dışında kontroller eskisi gibi (bağlantı yok)", () => {
    render(<Input aria-label="Serbest" />);
    const input = screen.getByRole("textbox", { name: "Serbest" });
    expect(input).not.toHaveAttribute("id");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("etikete tıklamak kontrolü odaklar", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Not">
        <Textarea />
      </Field>
    );
    await user.click(screen.getByText("Not"));
    expect(screen.getByRole("textbox", { name: "Not" })).toHaveFocus();
  });

  it("erişilebilirlik ihlali içermez — tüm kontroller, ipucu ve hata ile (axe-core)", async () => {
    const { container } = render(
      <form>
        <Field label="E-posta" hint="İş adresiniz" required>
          <Input type="email" />
        </Field>
        <Field label="İl" error="İl seçin">
          <Select options={[{ value: "ist", label: "İstanbul" }]} />
        </Field>
        <Field label="Adet">
          <InputNumber min={1} />
        </Field>
        <Field label="Teslimat" hint="Hızlı teslimat ücretlidir">
          <RadioGroup options={["Standart", "Hızlı"]} />
        </Field>
        <Field label="Faturalama" layout="horizontal">
          <Segmented options={["Aylık", "Yıllık"]} />
        </Field>
        <Field label="Doğrulama kodu">
          <OtpInput length={4} />
        </Field>
      </form>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
