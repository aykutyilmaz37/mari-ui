export type InputStatus = "error" | "warning";
export type InputSize = "large" | "middle" | "small";
export type InputVariant = "outlined" | "borderless" | "filled" | "underlined";
export type InputSemanticDOM = "wrapper" | "input" | "icon" | "clear" | "count";
export type InputClassNames = Partial<Record<InputSemanticDOM, string>>;
export type TextareaAutoSize = boolean | { minRows?: number; maxRows?: number };
