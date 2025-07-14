import React from "react";
import { TabsTrigger, TriggerProps } from "./TabsTrigger";
import clsx from "clsx";
import { useTabs } from "../useTabs";
import { cloneWithRef, calculateUnderlinePosition } from "../utils";

type TabListProps = {
  children: React.ReactElement<typeof TabsTrigger>[];
  cardTabs?: boolean;
};

export const TabsList: React.FC<TabListProps> = ({
  children,
  cardTabs = false,
}) => {
  const { activeTab } = useTabs();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = React.useState({ width: 0, left: 0 });
  const triggerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useLayoutEffect(() => {
    const childArray = React.Children.toArray(children);
    const idx = childArray.findIndex(
      (child): child is React.ReactElement<TriggerProps> =>
        React.isValidElement<TriggerProps>(child) &&
        child.type === TabsTrigger &&
        child.props.value === activeTab
    );
    const button = triggerRefs.current[idx];
    if (button && containerRef.current) {
      setUnderline(calculateUnderlinePosition(button, containerRef.current));
    } else {
      setUnderline({ width: 0, left: 0 });
    }
  }, [activeTab, children]);

  return (
    <div
      ref={containerRef}
      className={clsx("w-full flex gap-1 items-center justify-start relative")}
    >
      {React.Children.map(children, (child, idx) => {
        if (
          React.isValidElement<TriggerProps>(child) &&
          child.type === TabsTrigger
        ) {
          return cloneWithRef(child, (el: HTMLButtonElement | null): void => {
            triggerRefs.current[idx] = el;
          });
        }
        return child;
      })}
      <div
        className={clsx(
          "absolute bottom-0 h-[1px] z-50 transition-all duration-300",
          cardTabs ? "bg-white" : "bg-info"
        )}
        style={{
          width: `${underline.width}px`,
          left: `${underline.left}px`,
        }}
      />
      <div
        className={clsx(
          "absolute bottom-0 w-full h-[1px] bg-secondary transition-all duration-300"
        )}
      />
    </div>
  );
};
