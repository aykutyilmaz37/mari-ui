import clsx from "clsx";

export const getStepIconClass = (
  currentStep: number,
  itemStep: number,
  dotColor: string
) =>
  clsx(
    "shrink-0 p-0",
    currentStep === itemStep ? dotColor : "text-info",
    currentStep < itemStep && "text-primary",
    currentStep > itemStep && "text-info/50"
  );
