import { describe, expect, it } from "vitest";
import { formatMask } from "../Input/mask";

const PHONE = "0(5__) ___ __ __";

describe("formatMask", () => {
  it("ham rakamları maskeye yerleştirir", () => {
    expect(formatMask("321234567", PHONE)).toBe("0(532) 123 45 67");
  });

  it("kısmi giriş: yalnız yazılan kadar, sonda sabit kalmaz", () => {
    expect(formatMask("32", PHONE)).toBe("0(532");
    expect(formatMask("321", PHONE)).toBe("0(532) 1");
  });

  it("zaten biçimli metni yeniden biçimlerken bozmaz (kullanıcı silip yazarken)", () => {
    expect(formatMask("0(532) 123 45 67", PHONE)).toBe("0(532) 123 45 67");
    expect(formatMask("0(532) 12", PHONE)).toBe("0(532) 12");
  });

  it("kurala uymayan karakterleri atlar; fazla giriş kesilir", () => {
    expect(formatMask("32a1b2", PHONE)).toBe("0(532) 12");
    expect(formatMask("3212345678999", PHONE)).toBe("0(532) 123 45 67");
  });

  it("özel replacement", () => {
    expect(formatMask("ab12", "AA-99", { A: /[a-z]/i, 9: /\d/ })).toBe("ab-12");
  });
});
