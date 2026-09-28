import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";
import { getA11yViolations } from "../testUtils/a11y";

const bar = () => screen.getByRole("progressbar");

describe("Progress", () => {
  it("progressbar: aria-valuenow + okunur valuetext; sınır dışı kırpılır", () => {
    const { rerender } = render(<Progress aria-label="Yükleme" percent={45.4} />);
    expect(bar()).toHaveAttribute("aria-valuenow", "45");
    expect(bar()).toHaveAttribute("aria-valuetext", "%45");
    expect(bar()).toHaveAccessibleName("Yükleme");
    rerender(<Progress aria-label="Yükleme" percent={140} />);
    expect(bar()).toHaveAttribute("aria-valuenow", "100");
  });

  it("%100 kendiliğinden başarı; exception hata — durum valuetext'te de (renk tek başına değil)", () => {
    const { rerender } = render(<Progress aria-label="Yükleme" percent={100} />);
    expect(bar()).toHaveAttribute("aria-valuetext", "%100, tamamlandı");
    rerender(<Progress aria-label="Yükleme" percent={62} status="exception" />);
    expect(bar()).toHaveAttribute("aria-valuetext", "%62, hata");
  });

  it("format hem görünen metni hem valuetext'i belirler", () => {
    render(<Progress aria-label="Dosyalar" percent={60} format={() => "3 / 5 dosya"} />);
    expect(bar()).toHaveAttribute("aria-valuetext", "3 / 5 dosya");
    expect(screen.getByText("3 / 5 dosya")).toBeInTheDocument();
  });

  it("steps: doluluk parçalara yuvarlanır", () => {
    const { container } = render(<Progress aria-label="Şifre gücü" percent={60} steps={5} color="warning" showInfo={false} />);
    const segments = container.querySelectorAll(".flex-1.rounded-full");
    expect(segments).toHaveLength(5);
    expect([...segments].filter((s) => s.className.includes("bg-mari-warning"))).toHaveLength(3);
  });

  it("success: ikinci kısım başarı renginde, percent'i aşamaz", () => {
    const { container } = render(<Progress aria-label="Yükleme" percent={50} success={{ percent: 80 }} />);
    const successBar = [...container.querySelectorAll<HTMLElement>("span")].find((s) => s.className.includes("bg-mari-success") && s.style.width);
    expect(successBar!.style.width).toBe("50%");
  });

  it("daire: aynı erişilebilirlik; skeleton'da progressbar yok", () => {
    const { rerender } = render(<Progress type="circle" aria-label="Depolama" percent={72} />);
    expect(bar()).toHaveAttribute("aria-valuetext", "%72");
    rerender(<Progress type="circle" aria-label="Depolama" percent={72} skeleton />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Progress aria-label="Yükleme" percent={30} status="active" />
        <Progress aria-label="İşlem" percent={100} />
        <Progress aria-label="Senkron" percent={40} status="exception" />
        <Progress aria-label="Şifre gücü" percent={40} steps={5} />
        <Progress type="circle" aria-label="Depolama" percent={72} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
