import clsx from "clsx";
import { CheckIcon, DotIcon } from "lucide-react";
import React from "react";
import { Button } from "../button";
import { StepData } from "./types";
import { getStepIconClass } from "./utils";

type StepProps = {
  data: StepData;
  lineColor?: string;
  currentStep: number;
  onChange?: (step: number) => void;
  vertical?: boolean;
  dot?: boolean;
  dotColor?: string;
};
export const Steps: React.FC<StepProps> = ({
  data,
  lineColor = "bg-info",
  currentStep,
  onChange,
  vertical,
  dot,
  dotColor = "text-info",
}) => {
  return (
    <div className="w-full h-full space-y-2">
      {vertical ? (
                /*Vertical Steps*/

        <div className="flex flex-col gap-2 min-h-32">
          {data.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                className={clsx(
                  "flex flex-row gap-2",
                  currentStep === item.step &&
                    "scale-y-105 transition-all duration-300 font-bold text-primary"
                )}
                key={i}
                onClick={() => onChange && onChange(item.step)}
              >
                <div>
                  {dot ? (
                    <DotIcon
                      size={48}
                      className={getStepIconClass(
                        currentStep,
                        item.step,
                        dotColor
                      )}
                    />
                  ) : Icon ? (
                    <Icon
                      size={24}
                      className={getStepIconClass(
                        currentStep,
                        item.step,
                        dotColor
                      )}
                    />
                  ) : (
                    <span
                      className={clsx(
                        "px-1.5 py-0.5 rounded-full text-white",
                        currentStep === item.step ? "bg-info" : "bg-primary"
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                  <div
                    className={clsx(
                      "min-h-32 w-0.5 rounded",
                      i === data.length - 1 && "hidden",
                      currentStep > item.step ? lineColor : "bg-primary",
                      !dot ? "ml-2.5" : "ml-[22px]"
                    )}
                  />
                </div>
                <div className="flex flex-col cursor-pointer">
                  <span>{item.title}</span>
                  <span className="text-sm text-secondary w-fit truncate">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /*Horizontal Steps*/
        <div className={clsx("flex flex-row w-full gap-2 cursor-pointer")}>
          {data.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                onClick={() => onChange && onChange(item.step)}
                className={clsx(
                  "flex-1 min-w-0",
                  currentStep === item.step &&
                    "scale-102 transition-all font-bold text-primary"
                )}
              >
                {dot ? (
                  /*Dot Steps*/
                  <div>
                    <div className="flex items-center">
                      <DotIcon
                        size={48}
                        className={getStepIconClass(
                          currentStep,
                          item.step,
                          dotColor
                        )}
                      />
                      <div
                        className={clsx(
                          "w-full h-0.5 rounded",
                          i === data.length - 1 && "hidden",
                          currentStep > item.step ? lineColor : "bg-primary"
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className="text-sm text-secondary w-fit truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ) : (
                  /*Icon Steps*/
                  <div className={clsx("flex items-center gap-2  truncate")}>
                    {currentStep > item.step ? (
                      <div className="bg-info/50 p-1 transation-all rounded-full text-white">
                        <CheckIcon size={16} />
                      </div>
                    ) : Icon ? (
                      <Icon
                        size={32}
                        className={clsx(
                          currentStep === item.step
                            ? "text-info"
                            : "text-primary"
                        )}
                      />
                    ) : (
                      <span
                        className={clsx(
                          "px-2 rounded-full text-white",
                          currentStep === item.step ? "bg-info" : "bg-primary"
                        )}
                      >
                        {i + 1}
                      </span>
                    )}
                    <div className="flex flex-col cursor-pointer pt-5">
                      <span>{item.title}</span>
                      <span className="text-sm text-secondary w-fit truncate">
                        {item.description}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "w-full h-0.5 rounded",
                        i === data.length - 1 && "hidden",
                        currentStep > item.step ? lineColor : "bg-primary"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/*next&previous button*/}
      <div className="flex justify-end gap-4">
        <Button
          type="primary"
          disabled={currentStep === 1}
          onClick={() => onChange?.(currentStep - 1)}
        >
          Geri
        </Button>

        <Button
          type="info"
          disabled={currentStep === data.length}
          onClick={() => onChange?.(currentStep + 1)}
        >
          İleri
        </Button>
      </div>
    </div>
  );
};
