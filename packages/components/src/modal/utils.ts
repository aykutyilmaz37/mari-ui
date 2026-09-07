import React from "react";
import { VariantType, SizeType } from "./types";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const iconMap: Record<VariantType, () => React.ReactNode> = {
  default: () => null,
  confirm: () => React.createElement(CheckCircle2, { className: "w-5 h-5 text-green-600" }),
  warning: () => React.createElement(AlertTriangle, { className: "w-5 h-5 text-yellow-600" }),
  error: () => React.createElement(XCircle, { className: "w-5 h-5 text-red-600" }),
  info: () => React.createElement(Info, { className: "w-5 h-5 text-blue-600" }),
};

export const sizeMap: Record<SizeType, string> = {
  small: "max-w-sm",
  medium: "max-w-md",
  large: "max-w-lg",
};
