import React from "react";
import { TimePeriod } from "../types";

interface UseTimePickerParams {
  setHour: (value: string) => void;
  setMinute: (value: string) => void;
  setSeconds: (value: string) => void;
  onChange?: (value: string) => void;
  timeType: number;
  timePeriod?: TimePeriod | undefined;
  setTimePeriod: (value: TimePeriod | undefined) => void;
}

interface UseTimePickerReturn {
  handleChangeHour: (e: string | number) => void;
  handleChangeMinute: (e: string | number) => void;
  handleChangeSeconds: (e: string | number) => void;
  handleOkeyTime: (
    hour: string,
    minute: string,
    seconds: string,
    timePeriod: TimePeriod
  ) => void;
  handleNowTime: () => void;
  handleClearTime: () => void;
  timePeriodError: boolean;
  setTimePeriodError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTimePicker = ({
  setHour,
  setMinute,
  setSeconds,
  onChange,
  timeType,
  setTimePeriod,
}: UseTimePickerParams): UseTimePickerReturn => {
  const [timePeriodError, setTimePeriodError] = React.useState(false);

  const handleChangeHour = (e: string | number) => {
    const num = typeof e === "string" ? parseInt(e, 10) : e;
    const clamped = Math.max(0, Math.min(timeType, num));
    const formatted = String(clamped).padStart(2, "0");
    setHour(formatted);
  };
  const handleChangeMinute = (e: string | number) => {
    const num = typeof e === "string" ? parseInt(e, 10) : e;
    const clamped = Math.max(0, Math.min(59, num));
    const formatted = String(clamped).padStart(2, "0");
    setMinute(formatted);
  };
  const handleChangeSeconds = (e: string | number) => {
    const num = typeof e === "string" ? parseInt(e, 10) : e;
    const clamped = Math.max(0, Math.min(59, num));
    const formatted = String(clamped).padStart(2, "0");
    setSeconds(formatted);
  };

  const handleOkeyTime = (
    hour: string,
    minute: string,
    seconds: string,
    timePeriod: TimePeriod | undefined
  ) => {
    const formattedHour = timeType === 12 ? "01" : "00";
    if (onChange) {
      if (timeType === 12 && !timePeriod) {
        setTimePeriodError(true);
        return;
      }
      let formattedTime = "";
      if (timeType === 12 && timePeriod) {
        formattedTime = `${formattedHour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")} ${timePeriod}`;
      } else {
        formattedTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
      onChange(formattedTime);
    }
  };

  const handleNowTime = () => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentSeconds = String(now.getSeconds()).padStart(2, "0");
    setHour(currentHour);
    setMinute(currentMinute);
    setSeconds(currentSeconds);
  };

  const handleClearTime = () => {
    if (onChange) {
      setHour("00");
      setMinute("00");
      setSeconds("00");
      setTimePeriod(undefined);
    }
  };

  return {
    handleChangeHour,
    handleChangeMinute,
    handleChangeSeconds,
    handleOkeyTime,
    handleNowTime,
    handleClearTime,
    timePeriodError,
    setTimePeriodError,
  };
};
