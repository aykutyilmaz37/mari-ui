import React from "react";

type TimePickerProps = {
  onChange?: (value: string) => void;
};

export const TimePicker: React.FC<TimePickerProps> = ({ onChange }) => {
  const [hour, setHour] = React.useState<number>(0);
  const [minute, setMinute] = React.useState<number>(0);
  const [seconds, setSeconds] = React.useState<number>(0);

  const hourRef = React.useRef<HTMLInputElement>(null);
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const secondsRef = React.useRef<HTMLInputElement>(null);

  const handleChangeHour = (e: number) => {
    // Clamp value between 0 and 23
    const clamped = Math.max(0, Math.min(23, e));
    setHour(clamped);
    if (String(clamped).length === 2 && minuteRef.current) {
      minuteRef.current.focus();
    }
  };
  const handleChangeMinute = (e: number) => {
    // Clamp value between 0 and 59
    const clamped = Math.max(0, Math.min(59, e));
    setMinute(clamped);
    if (String(clamped).length === 2 && secondsRef.current) {
      secondsRef.current.focus();
    }
  };
  const handleChangeSeconds = (e: number) => {
    // Clamp value between 0 and 59
    const clamped = Math.max(0, Math.min(59, e));
    setSeconds(clamped);
  };

  React.useEffect(() => {
    if (onChange) {
      const formatted = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      onChange(formatted);
    }
  }, [hour, minute, seconds, onChange]);

  return (
    <div className="flex items-center gap-1 w-fit p-2 text-center border border-primary-light rounded-full  ">
      <div className="w-10 ">
        <input
          placeholder="00"
          ref={hourRef}
          onChange={(e) => handleChangeHour(Number(e.target.value))}
          className="focus:outline-none"
          type="number"
          id="hour"
          min={0}
          max={23}
        />
      </div>
      <span>:</span>
      <div className="w-10 ">
        <input
          placeholder="00"
          ref={minuteRef}
          onChange={(e) => handleChangeMinute(Number(e.target.value))}
          className="focus:outline-none"
          type="number"
          id="minute"
          min={0}
          max={59}
        />
      </div>
      <span>:</span>
      <div className="w-10 ">
        <input
          placeholder="00"
          ref={secondsRef}
          onChange={(e) => handleChangeSeconds(Number(e.target.value))}
          className="focus:outline-none"
          type="number"
          id="seconds"
          min={0}
          max={59}
        />
      </div>
    </div>
  );
};
