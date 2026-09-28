import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Clock, Countdown, Statistic, Stopwatch } from "./Statistic";
import { getA11yViolations } from "../testUtils/a11y";

describe("Statistic", () => {
  it("tr-TR değer, önek/sonek", () => {
    render(<Statistic title="Aylık gelir" value={1284500.5} precision={2} prefix="₺" />);
    expect(screen.getByText("1.284.500,50")).toBeInTheDocument();
    expect(screen.getByText("₺")).toBeInTheDocument();
  });

  it("trend: renk anlamdan (goodWhen), yön ve anlam sözle", () => {
    const { container, rerender } = render(<Statistic title="Gelir" value={100} trend={{ value: 12.4 }} />);
    expect(screen.getByText("%12,4")).toBeInTheDocument();
    expect(screen.getByText("artış, olumlu")).toHaveClass("sr-only");
    expect(container.querySelector(".text-mari-success")).not.toBeNull();
    rerender(<Statistic title="İade oranı" value={100} trend={{ value: 3, goodWhen: "down" }} />);
    expect(screen.getByText("artış, olumsuz")).toBeInTheDocument();
    expect(container.querySelector(".text-mari-error")).not.toBeNull();
  });

  it("skeleton: meşgul, değer erişilebilirlik ağacından çıkar", () => {
    const { container } = render(<Statistic title="Gelir" value={100} skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("100").closest("[aria-hidden]")).not.toBeNull();
  });
});

describe("Countdown / Clock / Stopwatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T10:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("Countdown: role=timer (her saniye konuşmaz), kalan süre sözlü; dolunca onFinish bir kez ve duyuru", () => {
    const onFinish = vi.fn();
    render(<Countdown title="Kampanya bitiyor" target={Date.now() + 3000} onFinish={onFinish} />);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent("00:03");
    expect(timer).toHaveAttribute("aria-label", "Kalan süre: 3 saniye");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("Süre doldu");
    expect(screen.getByRole("status")).toHaveTextContent("Süre doldu");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("Countdown: gün ve saat biçimi", () => {
    render(<Countdown target={Date.now() + 2 * 86_400_000 + 4 * 3_600_000 + 12 * 60_000 + 9000} />);
    expect(screen.getByRole("timer")).toHaveTextContent("2 gün 04:12:09");
  });

  it("Clock: saat diliminde <time dateTime>, 24 saat", () => {
    const { container } = render(<Clock title="İstanbul" timeZone="Europe/Istanbul" />);
    const time = container.querySelector("time")!;
    expect(time).toHaveTextContent("13:00");
    expect(time).toHaveAttribute("datetime", "2026-09-29T10:00:00.000Z");
  });

  it("Stopwatch: başlat, duraklat (sözlü duyuru + onStop), devam, sıfırla", () => {
    const onStop = vi.fn();
    render(<Stopwatch title="Tur süresi" onStop={onStop} />);
    act(() => screen.getByRole("button", { name: "Başlat" }).click());
    act(() => {
      vi.advanceTimersByTime(65_430);
    });
    expect(screen.getByRole("timer")).toHaveTextContent(/01:05,4\d/);
    act(() => screen.getByRole("button", { name: "Duraklat" }).click());
    expect(onStop).toHaveBeenCalledWith(expect.any(Number));
    expect(screen.getByRole("status")).toHaveTextContent("Durduruldu: 1 dakika 5 saniye");
    expect(screen.getByRole("button", { name: "Devam et" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Sıfırla" }).click());
    expect(screen.getByRole("timer")).toHaveTextContent("00:00,00");
    expect(screen.getByRole("button", { name: "Sıfırla" })).toBeDisabled();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    vi.useRealTimers();
    const { container } = render(
      <>
        <Statistic title="Gelir" value={1284500} prefix="₺" trend={{ value: 12 }} description="geçen aya göre" />
        <Countdown title="Kampanya" target={Date.now() + 60_000} />
        <Clock title="Saat" />
        <Stopwatch title="Kronometre" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
