"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { DocsContainer as BaseDocsContainer, type DocsContainerProps } from "@storybook/blocks";
import type { ThemeMode } from "@mari-ui/tokens";
import { mariDocsThemes } from "./theme";

function readMode(): ThemeMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Addon'ın html[data-theme] seçimi ile MDX ve autodocs kabuğunu eşler. */
export function DocsContainer(props: PropsWithChildren<DocsContainerProps>) {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  useEffect(() => {
    const observer = new MutationObserver(() => setMode(readMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setMode(readMode());
    return () => observer.disconnect();
  }, []);
  return <BaseDocsContainer {...props} theme={mariDocsThemes[mode]} />;
}
