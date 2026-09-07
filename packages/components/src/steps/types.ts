export type StepData = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  step: number;
}[];
