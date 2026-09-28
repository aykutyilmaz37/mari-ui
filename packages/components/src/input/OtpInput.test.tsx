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

  describe("layout=\"single\"", () => {
    it("tek bir adlandırılmış alan; SMS kodu önerisi ve sayısal klavye", () => {
      render(<OtpInput layout="single" length={6} aria-label="SMS kodu" />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(1);
      expect(inputs[0]).toHaveAccessibleName("SMS kodu");
      expect(inputs[0]).toHaveAttribute("autocomplete", "one-time-code");
      expect(inputs[0]).toHaveAttribute("inputmode", "numeric");
    });

    it("yazılan haneler yuvalara çizilir; tamamlanınca onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<OtpInput layout="single" length={4} onChange={onChange} />);
      await user.type(screen.getByRole("textbox"), "7351");
      expect(onChange).toHaveBeenCalledWith("7351");
      const slots = [...container.querySelectorAll("span[aria-hidden]")].map((s) => s.textContent).join("");
      expect(slots).toBe("7351");
    });

    it("yapıştırmada boşluk ve harfleri atar, fazlasını kırpar", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<OtpInput layout="single" length={6} onChange={onChange} />);
      await user.click(screen.getByRole("textbox"));
      await user.paste("48 29-13 99");
      expect(screen.getByRole("textbox")).toHaveValue("482913");
      expect(onChange).toHaveBeenCalledWith("482913");
    });

    it("mask ile yuvalarda • gösterir, error ile aria-invalid", async () => {
      const user = userEvent.setup();
      const { container } = render(<OtpInput layout="single" length={4} mask color="error" />);
      await user.type(screen.getByRole("textbox"), "12");
      expect(container.textContent).toContain("••");
      expect(container.textContent).not.toContain("12");
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("linePosition: center dolu yuvada çizgiyi kaldırır, bottom dolu yuvada da alt çizgi bırakır", () => {
      const slots = (c: HTMLElement) => [...c.querySelectorAll("span[aria-hidden]")] as HTMLElement[];
      const center = render(<OtpInput layout="single" length={3} defaultValue="4" />);
      expect(slots(center.container)[0]!.className).not.toContain("after:absolute");
      expect(slots(center.container)[1]!.className).toContain("after:top-1/2");
      center.unmount();
      const bottom = render(<OtpInput layout="single" length={3} defaultValue="4" linePosition="bottom" />);
      expect(slots(bottom.container)[0]!.className).toContain("after:bottom-[18%]");
    });

    it("imleç adımlı yanıp söner (yumuşak solma değil)", async () => {
      const user = userEvent.setup();
      const { container } = render(<OtpInput layout="single" length={4} />);
      await user.click(screen.getByRole("textbox"));
      expect(container.querySelector("[class*='mari-caret-blink']")).not.toBeNull();
    });

    it("erişilebilirlik ihlali içermez (axe-core)", async () => {
      const { container } = render(<OtpInput layout="single" length={6} separator="-" />);
      expect(await getA11yViolations(container)).toEqual([]);
    });
  });
});
