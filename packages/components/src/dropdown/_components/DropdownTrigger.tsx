"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownTriggerProps } from "../types";
import { useDropdown } from "../useDropdown";
import { getTriggerClasses } from "../utils";
import { skeletonBoxProps } from "../../lib/skeleton";

export function DropdownTrigger({ children, className, color, variant, onClick, "aria-label": ariaLabel }: DropdownTriggerProps) {
  const { visible, setVisible, triggerRef, panelId, focusPanelOnOpenRef, hoverMode, skeleton } = useDropdown();
  const classes = cn("cursor-pointer", getTriggerClasses(color, variant), className);

  // İskelet: tetikleyicinin kendi sınıfları (boyut, radius, flex düzeni) korunur,
  // içerik görünmez olarak yerinde kalır → yüklenince kutu zıplamaz; tıklanamaz.
  if (skeleton) {
    return (
      <span {...skeletonBoxProps(cn("inline-block", classes, "*:invisible"))}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={visible}
      aria-controls={visible ? panelId : undefined}
      className={classes}
      onClick={(event) => {
        // `detail === 0`: click'i fare değil klavye (Enter/Boşluk) üretti.
        const fromKeyboard = event.detail === 0;
        if (!visible && fromKeyboard) focusPanelOnOpenRef.current = "first";
        // `hover` modunda fare zaten üzerine gelince açtı — ardından gelen
        // tıklama toggle etseydi menü kullanıcının gözü önünde KAPANIRDI.
        // Fare tıklaması orada sadece açık tutar; klavye toggle etmeye devam eder.
        setVisible(hoverMode && !fromKeyboard ? true : !visible);
        onClick?.(event);
      }}
      // APG menu button: ↓ açar ve ilk öğeye, ↑ açar ve son öğeye odaklanır.
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        focusPanelOnOpenRef.current = event.key === "ArrowDown" ? "first" : "last";
        setVisible(true);
      }}
    >
      {children}
    </button>
  );
}
