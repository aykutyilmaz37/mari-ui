import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "../hooks/useControllableState";

describe("useControllableState", () => {
  it("uncontrolled modda defaultValue ile başlar ve kendi state'ini günceller", () => {
    const { result } = renderHook(() => useControllableState<string>({ defaultValue: "a" }));
    expect(result.current[0]).toBe("a");

    act(() => {
      result.current[1]("b");
    });
    expect(result.current[0]).toBe("b");
  });

  it("controlled modda `value` prop'unu yansıtır, kendi state'ini değiştirmez", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useControllableState<string>({ value, onChange }),
      { initialProps: { value: "x" } }
    );
    expect(result.current[0]).toBe("x");

    act(() => {
      result.current[1]("y");
    });
    // Controlled modda dahili state değişmez, sadece onChange çağrılır —
    // tüketici `value` prop'unu güncellemezse görüntü değişmez.
    expect(onChange).toHaveBeenCalledWith("y");
    expect(result.current[0]).toBe("x");

    rerender({ value: "y" });
    expect(result.current[0]).toBe("y");
  });

  it("onChange, uncontrolled modda da çağrılır", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }));
    act(() => {
      result.current[1](5);
    });
    expect(onChange).toHaveBeenCalledWith(5);
    expect(result.current[0]).toBe(5);
  });
});
