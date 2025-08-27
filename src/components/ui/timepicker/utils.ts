import { TimePeriod, TimeType } from "./types";

export const minutesArray = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);
export const secondsArray = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export const getTimePickerSize = (size: string) => {
  return {
    large: "w-14",
    middle: "w-12",
    small: "w-10",
  }[size];
};

export const getTimeType = (timeType: TimeType) => {
  return {
    eu: 23,
    usa: 12,
  }[timeType];
};

export const getHoursArray = (timeType: number) => {
  if (timeType === 12) {
    return Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
  } else {
    return Array.from({ length: timeType }, (_, i) =>
      i.toString().padStart(2, "0")
    );
  }
};

export const getTimePeriodButtonClass = (
  period: TimePeriod,
  active: string | undefined,
  timePeriodError: boolean
) => {
  const errorClass = timePeriodError
    ? "border border-error"
    : "border-secondary ";
  const baseClass =
    "bg-white border border-secondary rounded p-1 hover:bg-secondary hover:text-white cursor-pointer";
  const activeClass = "bg-secondary text-white";
  return active === period
    ? `${baseClass} ${activeClass}`
    : `${baseClass} ${errorClass}`;
};
