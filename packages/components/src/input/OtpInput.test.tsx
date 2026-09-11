import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
