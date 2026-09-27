import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { OtpInput } from "./OtpInput";

describe("OtpInput", () => {
  it("variant=\"ghost\" iken kutucuklar tamamen görünmez olmaz — underlined'a düşürülür (Faz 13 gözden geçirmesi: ghost'ta hiçbir kenarlık/arka plan yoktu, kutucuklar arasındaki sınır tamamen kayboluyordu)", () => {
    const { container } = render(<OtpInput length={4} variant="ghost" />);
    const wrappers = [...container.querySelectorAll("input")].map((input) => input.parentElement!);
    expect(wrappers).toHaveLength(4);
    wrappers.forEach((wrapper) => {
      expect(wrapper.className).toContain("border-b");
      expect(wrapper.className).not.toContain("border-none");
    });
  });

  it("diğer variant'lar olduğu gibi geçer", () => {
    const { container } = render(<OtpInput length={3} variant="soft" />);
    const wrappers = [...container.querySelectorAll("input")].map((input) => input.parentElement!);
    wrappers.forEach((wrapper) => {
      expect(wrapper.className).toContain("bg-mari-surface-alt");
    });
  });

  it("grup ve haneler adlandırılmış; sayısal klavye + SMS kodu önerisi ilk hanede", () => {
    render(<OtpInput length={4} />);
    expect(screen.getByRole("group", { name: "Doğrulama kodu" })).toBeInTheDocument();
    const first = screen.getByRole("textbox", { name: "Hane 1 / 4" });
    expect(first).toHaveAttribute("inputmode", "numeric");
    expect(first).toHaveAttribute("autocomplete", "one-time-code");
    expect(screen.getByRole("textbox", { name: "Hane 2 / 4" })).toHaveAttribute("autocomplete", "off");
  });

  it("yapıştırılan kod hanelere dağıtılır ve onChange tamamıyla çağrılır (eskiden maxLength=1 tek haneye kırpıyordu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={6} onChange={onChange} />);
    await user.click(screen.getByRole("textbox", { name: "Hane 1 / 6" }));
    await user.paste("482913");
    expect(onChange).toHaveBeenCalledWith("482913");
    expect(screen.getByRole("textbox", { name: "Hane 6 / 6" })).toHaveValue("3");
  });

  it("SMS otomatik doldurma kodun tamamını ilk haneye yazsa da dağıtılır", () => {
    const onChange = vi.fn();
    render(<OtpInput length={4} onChange={onChange} />);
    fireEvent.input(screen.getByRole("textbox", { name: "Hane 1 / 4" }), { target: { value: "7351" } });
    expect(onChange).toHaveBeenCalledWith("7351");
  });

  it("dolu hanede imleç sondayken yazılan karakter eskisinin yerine geçer", () => {
    render(<OtpInput length={4} defaultValue="1234" />);
    fireEvent.input(screen.getByRole("textbox", { name: "Hane 2 / 4" }), { target: { value: "29" } });
    expect(screen.getByRole("textbox", { name: "Hane 2 / 4" })).toHaveValue("9");
    expect(screen.getByRole("textbox", { name: "Hane 3 / 4" })).toHaveValue("3");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<OtpInput length={4} separator="-" />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
