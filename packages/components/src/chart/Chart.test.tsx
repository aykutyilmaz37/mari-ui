import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BarChart, Gauge, LineChart, PieChart, Sparkline } from ".";
import { buildBars, valueExtent } from "./bar-chart/bars";
import { bandScale, linearScale } from "./_shared/scale";
import { seriesColor } from "./_shared/format";

/** jsdom ölçmez: kapsayıcıyı 600×300 ölçen ResizeObserver + clientWidth/Height. */
class FixedObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe() {
    this.cb([], this as unknown as ResizeObserver);
  }
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", FixedObserver);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const rows = [
  { ay: "Oca", gelir: 100, gider: 60 },
  { ay: "Şub", gelir: 140, gider: 80 },
  { ay: "Mar", gelir: 120, gider: 90 },
];
type Row = (typeof rows)[number];
const two = [
  { key: "gelir" as const, name: "Gelir" },
  { key: "gider" as const, name: "Gider" },
];

describe("LineChart", () => {
  it("veri tablosu (ekran okuyucu) tüm değerleri taşır; figure adlı", () => {
    render(<LineChart<Row> label="Gelir ve gider" data={rows} xKey="ay" series={two} />);
    const table = screen.getByRole("table", { name: "Gelir ve gider" });
    expect(within(table).getByRole("columnheader", { name: "Gider" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Şub" })).toBeInTheDocument();
    expect(within(table).getByText("140")).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Gelir ve gider" })).toBeInTheDocument();
  });

  it("lejant: 2+ seride var, tek seride yok", () => {
    const { rerender } = render(<LineChart<Row> label="G" data={rows} xKey="ay" series={two} />);
    expect(screen.getByRole("list")).toHaveTextContent("Gelir");
    rerender(<LineChart<Row> label="G" data={rows} xKey="ay" series={[two[0]!]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("klavye: ok tuşları noktaları gezer ve tooltip o noktadaki tüm serileri gösterir", () => {
    const { container } = render(<LineChart<Row> label="G" data={rows} xKey="ay" series={two} />);
    const plot = screen.getByRole("group", { name: /ok tuşlarıyla/ });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    const tooltip = container.querySelector("[aria-hidden].z-mari-tooltip") as HTMLElement;
    expect(tooltip).toHaveTextContent("Şub");
    expect(tooltip).toHaveTextContent("140");
    expect(tooltip).toHaveTextContent("80");
    fireEvent.keyDown(plot, { key: "End" });
    expect(tooltip).toHaveTextContent("Mar");
  });

  it("boş veride Empty, iskelette yer tutucu", () => {
    const { rerender, container } = render(<LineChart<Row> label="G" data={[]} xKey="ay" series={two} emptyText="Kayıt yok" />);
    expect(screen.getByText("Kayıt yok")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    rerender(<LineChart<Row> label="G" data={rows} xKey="ay" series={two} skeleton />);
    expect(container.querySelector("[data-skeleton]")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("null değer çizgiyi böler, tabloda —", () => {
    const gappy = rows.map((r, i) => ({ ...r, gelir: i === 1 ? (null as unknown as number) : r.gelir }));
    const { container } = render(<LineChart<Row> label="G" data={gappy} xKey="ay" series={[two[0]!]} />);
    expect(screen.getByRole("table")).toHaveTextContent("—");
    const d = container.querySelector("path[stroke]")?.getAttribute("d") ?? "";
    expect(d.match(/M/g)?.length).toBe(2);
  });
});

describe("BarChart", () => {
  it("her değer için bir çubuk; sıfır değer çizilmez", () => {
    const data = [...rows, { ay: "Nis", gelir: 0, gider: 50 }];
    const { container } = render(<BarChart<Row> label="G" data={data} xKey="ay" series={two} />);
    expect(container.querySelectorAll("svg path[fill^='var(--mari-color-chart']")).toHaveLength(7);
  });

  it("valueExtent: gruplu tekil, yığılmış toplam; sıfır dahil", () => {
    expect(valueExtent([[3, 5], [-2, 4]], false)).toEqual([-2, 5]);
    expect(valueExtent([[3, 5], [-2, 4]], true)).toEqual([-2, 8]);
    expect(valueExtent([[3, 5]], false)).toEqual([0, 5]);
  });

  it("buildBars yığında yalnız en dıştaki parçayı yuvarlar (Q eğrisi)", () => {
    const g = { horizontal: false, stacked: true, band: bandScale(1, [0, 100]), value: linearScale([0, 10], [100, 0]), thickness: 20 };
    const shapes = buildBars([[4, 6]], g);
    expect(shapes).toHaveLength(2);
    expect(shapes[0]!.d).not.toContain("Q");
    expect(shapes[1]!.d).toContain("Q");
  });
});

describe("PieChart", () => {
  const data = [
    { name: "A", value: 50 },
    { name: "B", value: 30 },
    { name: "C", value: 10 },
    { name: "D", value: 6 },
    { name: "E", value: 4 },
  ];

  it("maxSlices fazlasını Diğer'de toplar; lejantta yüzde", () => {
    render(<PieChart label="Pay" data={data} maxSlices={3} />);
    const table = screen.getByRole("table", { name: "Pay" });
    expect(within(table).getByRole("rowheader", { name: "Diğer" })).toBeInTheDocument();
    expect(within(table).getByText("20")).toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveTextContent("A · %50");
  });

  it("sıfır/negatif dilim çizilmez; hepsi geçersizse boş", () => {
    render(<PieChart label="Pay" data={[{ name: "X", value: 0 }, { name: "Y", value: -3 }]} emptyText="Yok" />);
    expect(screen.getByText("Yok")).toBeInTheDocument();
  });

  it("halka ortada toplamı gösterir", () => {
    const { container } = render(<PieChart label="Pay" data={data} donut />);
    expect(container.querySelector("svg")).toHaveTextContent("100");
  });
});

describe("Gauge", () => {
  it("role=meter; değer aralığa sıkıştırılır, durum adı valuetext'te", () => {
    render(
      <Gauge
        label="Disk"
        value={120}
        segments={[
          { upTo: 70, color: "success", label: "Normal" },
          { upTo: 100, color: "error", label: "Kritik" },
        ]}
      />
    );
    const meter = screen.getByRole("meter", { name: "Disk" });
    expect(meter).toHaveAttribute("aria-valuenow", "100");
    expect(meter).toHaveAttribute("aria-valuetext", "120, Kritik");
  });
});

describe("Sparkline", () => {
  it("label yoksa dekoratif, varsa img", () => {
    const { rerender, container } = render(<Sparkline data={[1, 3, 2]} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<Sparkline data={[1, 3, 2]} label="Yükselişte" />);
    expect(screen.getByRole("img", { name: "Yükselişte" })).toBeInTheDocument();
  });
});

describe("seriesColor", () => {
  it("sayı → palet, rol → solid, verilmezse sıradan (8'de kalır)", () => {
    expect(seriesColor(3, 0)).toBe("var(--mari-color-chart-3)");
    expect(seriesColor("error", 0)).toBe("var(--mari-color-error-solid)");
    expect(seriesColor(undefined, 1)).toBe("var(--mari-color-chart-2)");
    expect(seriesColor(undefined, 11)).toBe("var(--mari-color-chart-8)");
  });
});
