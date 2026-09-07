import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDisclosure } from "../hooks/useDisclosure";

describe("useDisclosure", () => {
  it("varsayılan olarak kapalı başlar, open/close/toggle çalışır", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("defaultOpen ve onOpenChange'i destekler", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true, onOpenChange }));
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
