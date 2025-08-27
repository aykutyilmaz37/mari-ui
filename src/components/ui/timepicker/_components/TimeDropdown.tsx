import React from "react";
import { Dropdown } from "../../dropdown";
import { TimeInput } from "./TimeInput";
import { Button } from "../../button";
import { getHoursArray, minutesArray, secondsArray } from "../utils";
import { useTimePicker } from "../_hooks/useTimePicker";
import { TimePeriod, TimePickerSize } from "../types";
import { TimePeriodButton } from "./TimePeriodButton";

type TimeDropdownProps = {
  onChange?: (value: string) => void;
  hour: string;
  seconds: string;
  minute: string;
  setHour: (value: string) => void;
  setMinute: (value: string) => void;
  setSeconds: (value: string) => void;
  size: TimePickerSize;
  timeType: number;
  timePeriod: TimePeriod;
  setTimePeriod: (value: TimePeriod | undefined) => void;
};
export const TimeDropdown: React.FC<TimeDropdownProps> = ({
  onChange,
  hour,
  seconds,
  minute,
  setSeconds,
  setHour,
  setMinute,
  size,
  timeType,
  timePeriod,
  setTimePeriod,
}) => {
  const {
    handleChangeHour,
    handleChangeMinute,
    handleChangeSeconds,
    handleClearTime,
    handleOkeyTime,
    handleNowTime,
    setTimePeriodError,
    timePeriodError,
  } = useTimePicker({
    setSeconds,
    setHour,
    setMinute,
    onChange,
    timeType,
    timePeriod,
    setTimePeriod,
  });
  const getHours = getHoursArray(timeType);
  return (
    <Dropdown
      className="w-full h-52 p-0"
      triggerVariant="text"
      trigger={
        <TimeInput
          onChange={onChange}
          hour={hour}
          minute={minute}
          seconds={seconds}
          setSeconds={setSeconds}
          setHour={setHour}
          setMinute={setMinute}
          dropdownButton={true}
          size={size}
          timeType={timeType}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
        />
      }
    >
      <div className="flex items-start justify-between w-full h-full">
        <div className="w-full h-full flex flex-col overflow-y-auto">
          {getHours.map((hourItem) => (
            <Button
              className="p-0"
              size={size}
              key={hourItem}
              onClick={() => handleChangeHour(Number(hourItem))}
            >
              {hourItem}
            </Button>
          ))}
        </div>
        <div className="flex flex-col border border-y-0 border-secondary-light w-full h-full overflow-y-scroll">
          {minutesArray.map((minuteItem) => (
            <Button
              className="p-0"
              size={size}
              key={minuteItem}
              onClick={() => handleChangeMinute(Number(minuteItem))}
            >
              {minuteItem}
            </Button>
          ))}
        </div>
        <div className="w-full h-full flex flex-col overflow-y-auto">
          {secondsArray.map((secondsItem) => (
            <Button
              className="p-0"
              size={size}
              key={secondsItem}
              onClick={() => handleChangeSeconds(Number(secondsItem))}
            >
              {secondsItem}
            </Button>
          ))}
        </div>
        {timeType === 12 && (
          <div className="h-full w-full border-l border-secondary-light p-2">
            <TimePeriodButton
              timePeriod={timePeriod}
              setTimePeriod={setTimePeriod}
              setTimePeriodError={setTimePeriodError}
              timePeriodError={timePeriodError}
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-around mt-1">
        <Button
          onClick={handleClearTime}
          size="small"
          variant="filled"
          type="error"
        >
          Clear
        </Button>

        <Button
          onClick={() => handleOkeyTime(hour, minute, seconds, timePeriod)}
          size="small"
          variant="filled"
          type="info"
        >
          Okey
        </Button>

        <Button
          size="small"
          variant="filled"
          type="warning"
          onClick={handleNowTime}
        >
          Now
        </Button>
      </div>
    </Dropdown>
  );
};
