import { forwardRef, useCallback, useEffect, useRef, type ComponentRef, type ForwardedRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { Platform, View, type ViewProps } from "react-native";

type ViewRef = ComponentRef<typeof View>;

export interface InertViewProps extends ViewProps {
  /** Gizli: ekran okuyucudan ve klavye odağından çıkar (iskelet, görünmeyen slayt). */
  hidden: boolean;
}

function assign<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Gizli alt ağaç: native'de `accessibilityElementsHidden` /
 * `no-hide-descendants`; web'de ayrıca `inert` — `aria-hidden` tek başına
 * içteki düğmeleri Tab sırasından çıkarmaz (axe `aria-hidden-focus`) ve
 * react-native-web `inert`i DOM'a geçirmediği için ref üzerinden konur.
 */
export const InertView: ForwardRefExoticComponent<InertViewProps & RefAttributes<ViewRef>> = /* @__PURE__ */ forwardRef<ViewRef, InertViewProps>(function InertView({ hidden, ...rest }, ref) {
  const node = useRef<ViewRef | null>(null);
  const setRef = useCallback(
    (value: ViewRef | null) => {
      node.current = value;
      assign(ref, value);
    },
    [ref],
  );
  useEffect(() => {
    if (Platform.OS !== "web") return;
    // Paket DOM tiplerini yüklemez: web'de ref bir DOM öğesidir.
    const el = node.current as unknown as { toggleAttribute?: (name: string, force: boolean) => void } | null;
    el?.toggleAttribute?.("inert", hidden);
  }, [hidden]);
  const a11y = hidden ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const, "aria-hidden": true } : null;
  return <View ref={setRef} {...rest} {...a11y} />;
});
