export type value = number | [number, number];
export type defaultValue = number | [number, number];
export type iconList = Array<{ icon: React.ReactNode; value: number }>;
export type iconPosition = "top" | "bottom";
export type onChange = (value: number | [number, number]) => void;
export type RangeSize = "large" | "middle" | "small";
