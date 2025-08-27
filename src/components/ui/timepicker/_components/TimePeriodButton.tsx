import React from "react";
import { twMerge } from "tailwind-merge";
import { getTimePeriodButtonClass } from "../utils";
import { TimePeriod } from "../types";

type TimePeriodButtonProps = {
  timePeriod: TimePeriod;
  setTimePeriod: (value: TimePeriod | undefined) => void;
  timePeriodError: boolean;
  setTimePeriodError: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TimePeriodButton: React.FC<TimePeriodButtonProps> = ({
  timePeriod,
  setTimePeriod,
  setTimePeriodError,
  timePeriodError,
}) => {
  const handleTimePeriod = (time: TimePeriod) => {
    setTimePeriod(time);
    setTimePeriodError(false);
  };
  return (
    <div className="flex">
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleTimePeriod("am")}
        className={twMerge(
          "text-xs py-1 px-2 h-6 !rounded-r-none ",
          getTimePeriodButtonClass("am", timePeriod, timePeriodError)
        )}
      >
        AM
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleTimePeriod("pm")}
        className={twMerge(
          "text-xs py-1 px-2 h-6 !rounded-l-none ",
          getTimePeriodButtonClass("pm", timePeriod, timePeriodError)
        )}
      >
        PM
      </div>
    </div>
  );
};
