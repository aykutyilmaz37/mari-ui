export type CheckboxStatus = "error" | "warning";
export type CheckboxSize = "small" | "middle" | "large";
export type CheckboxChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type CheckboxSemanticDOM = "wrapper" | "checkbox" | "label";
export type CheckboxClassNames = Partial<Record<CheckboxSemanticDOM, string>>;
export type CheckboxVariant = "solid" | "outline";
export type CheckboxType = "primary" | "secondary";
export type CheckboxShape = "default" | "round" | "square";
