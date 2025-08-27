import React from "react";
import { TimeInput } from "./_components/TimeInput";
import { TimeDropdown } from "./_components/TimeDropdown";
import { TimePeriod, TimePickerSize, TimeType } from "./types";
import { getTimeType } from "./utils";

type TimePickerProps = {
  onChange?: (value: string) => void;
  timeType?: TimeType;
  dropdown?: boolean;
  size?: TimePickerSize;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  onChange,
  timeType = "usa",
  dropdown = false,
  size = "middle",
}) => {
  const [hour, setHour] = React.useState<string>("");
  const [minute, setMinute] = React.useState<string>("");
  const [seconds, setSeconds] = React.useState<string>("");
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod | undefined>(
    undefined
  );

  const getTimeTypes = getTimeType(timeType);

  return dropdown ? (
    <TimeDropdown
      onChange={onChange}
      hour={hour}
      minute={minute}
      seconds={seconds}
      setSeconds={setSeconds}
      setHour={setHour}
      setMinute={setMinute}
      size={size}
      timeType={getTimeTypes}
      timePeriod={timePeriod}
      setTimePeriod={setTimePeriod}
    />
  ) : (
    <TimeInput
      onChange={onChange}
      hour={hour}
      minute={minute}
      seconds={seconds}
      setSeconds={setSeconds}
      setHour={setHour}
      setMinute={setMinute}
      size={size}
      timeType={getTimeTypes}
      timePeriod={timePeriod}
      setTimePeriod={setTimePeriod}
      dropdownButton={dropdown}
    />
  );
};
