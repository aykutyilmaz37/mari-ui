import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import qrcode from "qrcode-generator";
import { describe, expect, it, vi } from "vitest";
import { QRCode } from ".";
import { buildQRModel, toByteString } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

const base = { errorLevel: "M" as const, margin: 2, dotType: "square" as const, cornerSquareType: "square" as const, cornerDotType: "square" as const };

describe("qrcode/utils", () => {
  it("toByteString: UTF-8 baytları (kütüphanenin kendi UTF-8 çeviricisiyle aynı)", () => {
    const text = "Şişli Çağlayan — ğüöı";
    const expected = qrcode.stringToBytesFuncs["UTF-8"]!(text);
    expect(Array.from(toByteString(text), (c) => c.charCodeAt(0))).toEqual(expected);
    // Varsayılan kodlama "ş"yi 0x5F ("_") yapardı.
    expect(toByteString("ş")).toBe("Å\u009f");
  });

  it("buildQRModel: viewBox = modül + 2×kenar; üç konum işareti; hata düzeyi sürümü büyütür", () => {
    const m = buildQRModel({ ...base, value: "https://mari-ui.dev" });
    expect(m.moduleCount).toBe(25);
    expect(m.size).toBe(29);
    expect(m.corners).toHaveLength(3);
    expect(m.dataPath.length).toBeGreaterThan(0);
    expect(buildQRModel({ ...base, errorLevel: "H", value: "https://mari-ui.dev" }).moduleCount).toBeGreaterThan(25);
  });

  it("nokta/köşe tipleri yolu değiştirir", () => {
    const square = buildQRModel({ ...base, value: "a" });
    const dots = buildQRModel({ ...base, value: "a", dotType: "dots", cornerSquareType: "dot", cornerDotType: "dot" });
    expect(dots.dataPath).toContain("a");
    expect(square.dataPath).not.toContain("a");
    expect(dots.corners[0]!.ring).not.toBe(square.corners[0]!.ring);
  });
});

describe("QRCode", () => {
  it("role=img + ad; boyut", () => {
    render(<QRCode value="https://mari-ui.dev" size={128} aria-label="mari-ui.dev adresine giden QR kod" />);
    const img = screen.getByRole("img", { name: "mari-ui.dev adresine giden QR kod" });
    expect(img).toHaveAttribute("width", "128px");
  });

  it("ikon verilince hata düzeyi H (daha çok modül) ve görsel çizilir", () => {
    const { container, rerender } = render(<QRCode value="https://mari-ui.dev" />);
    const plain = container.querySelector("svg")!.getAttribute("viewBox");
    rerender(<QRCode value="https://mari-ui.dev" icon="/logo.svg" />);
    expect(container.querySelector("svg")!.getAttribute("viewBox")).not.toBe(plain);
    expect(container.querySelector("image")).toHaveAttribute("href", "/logo.svg");
  });

  it("gradyan: linearGradient tanımlanır ve kullanılır", () => {
    const { container } = render(<QRCode value="x" color="#2f66a3" colorEnd="#557293" />);
    const id = container.querySelector("linearGradient")!.id;
    expect(container.querySelector("path")).toHaveAttribute("fill", `url(#${id})`);
  });

  it("expired: durum duyurulur, Yenile onRefresh çağırır", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<QRCode value="x" status="expired" onRefresh={onRefresh} />);
    expect(screen.getByRole("status")).toHaveTextContent("QR kodun süresi doldu");
    await user.click(screen.getByRole("button", { name: "Yenile" }));
    expect(onRefresh).toHaveBeenCalled();
  });

  it("scanned ve loading katmanları; statusRender özel içerik", () => {
    const { rerender } = render(<QRCode value="x" status="scanned" />);
    expect(screen.getByRole("status")).toHaveTextContent("Tarandı");
    rerender(<QRCode value="x" status="loading" />);
    expect(screen.getByRole("status")).toHaveTextContent("Hazırlanıyor");
    rerender(<QRCode value="x" status="expired" statusRender={() => <b>Yeni kod isteyin</b>} />);
    expect(screen.getByRole("status")).toHaveTextContent("Yeni kod isteyin");
  });

  it("skeleton: aynı boyutta yer tutucu, SVG yok", () => {
    const { container } = render(<QRCode value="x" size="8rem" skeleton />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("[data-skeleton]")).toHaveStyle({ width: "8rem", height: "8rem" });
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <QRCode value="https://mari-ui.dev" />
        <QRCode value="x" status="expired" onRefresh={() => {}} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
