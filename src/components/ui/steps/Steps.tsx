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
  content?: React.ReactNode;
};

export const Steps: React.FC<StepProps> = ({
  data,
  lineColor = "bg-info",
  currentStep,
  onChange,
  vertical,
  dot,
  dotColor = "text-info",
  content,
}) => {
  const renderStepIcon = (item: StepData[0], i: number): React.ReactNode => {
    if (dot) {
      return (
        <DotIcon
          size={48}
          className={getStepIconClass(currentStep, item.step, dotColor)}
        />
      );
    }

    if (item.icon) {
      const Icon = item.icon;
      return (
        <Icon
          size={vertical ? 24 : 32}
          className={clsx(
            currentStep === item.step ? "text-info" : "text-primary"
          )}
        />
      );
    }

    return (
      <span
        className={clsx(
          vertical ? "px-1.5 py-0.5" : "px-2",
          "rounded-full text-white",
          currentStep === item.step ? "bg-info" : "bg-primary"
        )}
      >
        {i + 1}
      </span>
    );
  };

  const renderVerticalSteps = () => (
    <div className="flex flex-col gap-2 min-h-32">
      {data.map((item, i) => (
        <div
          key={item.step}
          role="none"
          className={clsx(
            "flex flex-row gap-2",
            currentStep === item.step &&
              "scale-y-105 transition-all duration-300 font-bold text-primary"
          )}
          onClick={() => onChange?.(item.step)}
        >
          <div>
            {renderStepIcon(item, i)}

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
      ))}
    </div>
  );

  const renderHorizontalContent = (item: StepData[0], i: number) => {
    const isCompleted = currentStep > item.step;

    return (
      <div className={clsx("flex items-center gap-2 truncate")}>
        {isCompleted ? (
          <div className="bg-info/50 p-1 transition-all rounded-full text-white">
            <CheckIcon size={16} />
          </div>
        ) : (
          renderStepIcon(item, i)
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
            isCompleted ? lineColor : "bg-primary"
          )}
        />
      </div>
    );
  };

  const renderHorizontalSteps = () => (
    <div className="flex flex-row w-full gap-2 cursor-pointer">
      {data.map((item, i) => (
        <div
          key={item.step}
          role="none"
          onClick={() => onChange?.(item.step)}
          className={clsx(
            "flex-1 min-w-0",
            currentStep === item.step &&
              "scale-102 transition-all font-bold text-primary"
          )}
        >
          {dot ? (
            <div>
              <div className="flex items-center">
                <DotIcon
                  size={48}
                  className={getStepIconClass(currentStep, item.step, dotColor)}
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
            renderHorizontalContent(item, i)
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full h-full space-y-2">
      {vertical ? renderVerticalSteps() : renderHorizontalSteps()}
      {/* content */}

      {content}

      {/* next & previous buttons */}
      <div className="flex justify-start gap-4">
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
