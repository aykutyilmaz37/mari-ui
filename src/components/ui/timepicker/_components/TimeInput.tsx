import React from "react";
import { useTimePicker } from "../_hooks/useTimePicker";
import { TimePeriod, TimePickerSize } from "../types";
import { getTimePickerSize } from "../utils";
import { twMerge } from "tailwind-merge";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { TimePeriodButton } from "./TimePeriodButton";

type TimeInputProps = {
  onChange?: (value: string) => void;
  hour: string;
  seconds: string;
  minute: string;
  dropdownButton?: boolean;
  setHour: (value: string) => void;
  setMinute: (value: string) => void;
  setSeconds: (value: string) => void;
  size: TimePickerSize;
  timeType: number;
  timePeriod: TimePeriod;
  setTimePeriod: (value: TimePeriod | undefined) => void;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  onChange,
  hour,
  seconds,
  minute,
  dropdownButton,
  setSeconds,
  setHour,
  setMinute,
  size,
  timeType,
  timePeriod,
  setTimePeriod,
}) => {
  const {
    handleOkeyTime,
    handleChangeHour,
    handleChangeMinute,
    handleChangeSeconds,
    setTimePeriodError,
    timePeriodError,
  } = useTimePicker({
    setSeconds,
    setHour,
    setMinute,
    timeType,
    timePeriod,
    onChange,
    setTimePeriod,
  });

  const handleClear = () => {
    setHour("00");
    setMinute("00");
    setSeconds("00");
    if (onChange) {
      onChange("00:00:00");
    }
  };

  const getSize = getTimePickerSize(size);
  const inputRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={inputRef}
      className="flex items-center gap-1 w-fit p-2 text-center border border-primary-light rounded-full group focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
    >
      <div className={twMerge(getSize)}>
        <input
          placeholder={timeType === 24 ? "00" : "01"}
          onChange={(e) => handleChangeHour(Number(e.target.value))}
          className={twMerge("text-center focus:outline-none", getSize)}
          type="number"
          id="hour"
          min={0}
          max={timeType}
          value={hour}
        />
      </div>
      <span>:</span>
      <div className={twMerge(getSize)}>
        <input
          placeholder="00"
          onChange={(e) => handleChangeMinute(Number(e.target.value))}
          className={twMerge("text-center focus:outline-none", getSize)}
          type="number"
          id="minute"
          min={0}
          max={59}
          value={minute}
        />
      </div>
      <span>:</span>
      <div className={twMerge(getSize)}>
        <input
          placeholder="00"
          onChange={(e) => handleChangeSeconds(Number(e.target.value))}
          className={twMerge("text-center focus:outline-none", getSize)}
          type="number"
          id="seconds"
          min={0}
          max={59}
          value={seconds}
        />
      </div>
      {!dropdownButton && timeType === 12 && (
        <TimePeriodButton
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          setTimePeriodError={setTimePeriodError}
          timePeriodError={timePeriodError}
        />
      )}
      <div className={twMerge("relative h-6", dropdownButton ? "w-6" : "w-12")}>
        <span
          className={twMerge(
            "absolute top-0",
            dropdownButton ? "left-0" : "left-auto"
          )}
        >
          <ClockIcon
            className={twMerge(
              "transition-all duration-300 opacity-100",
              !dropdownButton &&
                "sm:group-hover:opacity-0 group-focus:opacity-0 group-focus-within:opacity-0"
            )}
          />
        </span>
        <span
          className={twMerge(
            "absolute top-0 left-0 flex",
            dropdownButton && "hidden"
          )}
        >
          <CheckIcon
            onClick={() => handleOkeyTime(hour, minute, seconds, timePeriod)}
            className={twMerge(
              "transition-all duration-300 opacity-0 sm:group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 cursor-pointer text-success"
            )}
          />
          <XIcon
            onClick={handleClear}
            className={twMerge(
              "transition-all duration-300 opacity-0 sm:group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 cursor-pointer text-error"
            )}
          />
        </span>
      </div>
    </div>
  );
};
