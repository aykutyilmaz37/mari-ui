import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export interface TabsContextType {
  activeTab: string;
  setActiveTab: (val: string) => void;
  color: ColorRole;
}

export interface TabsProps {
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (value: string) => void;
  /** Aktif tab çizgisi ve göstergesinin rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  children: React.ReactNode;
}

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  cardTabs?: boolean;
}

export interface TabsListProps {
  children: React.ReactNode;
  cardTabs?: boolean;
}

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
}
