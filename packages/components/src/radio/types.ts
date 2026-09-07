export type RadioSize = "small" | "middle" | "large";
export type RadioType = "primary" | "secondary";
export type RadioVariant = "outline" | "solid";
export type RadioStatus = "error" | "warning";

export type RadioClassNames = Partial<{
  wrapper: string;
  label: string;
  radio: string;
}>;

export type RadioChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type RadioOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};
