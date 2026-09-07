import React from "react";
import { CheckIcon, DotIcon } from "lucide-react";
import { cn, resolveColorVariant } from "@mari-ui/core";
import { Button } from "../button";
import { colorVariantToClassName, textClass } from "../lib/colorClasses";
import type { StepItem, StepsProps } from "./types";
import { getLineClass, getStepIconClass } from "./utils";

export type { StepsProps };

/**
 * Hook yok, browser API yok (`onChange` bir PROP) — saf sunum, "use client"
 * gerekmiyor. Eskiden `ml-[22px]` gibi bir kaçış değeri vardı (bkz. plan);
 * en yakın sabit spacing skalasına (`ml-6`) çekildi.
 */
export function Steps({ data, color = "primary", currentStep, onChange, vertical, dot, content }: StepsProps) {
  const solidClass = colorVariantToClassName(resolveColorVariant(color, "solid"));

  const renderStepIcon = (item: StepItem, i: number): React.ReactNode => {
    if (dot) {
      return <DotIcon size={48} className={getStepIconClass(currentStep, item.step, color)} />;
    }
    if (item.icon) {
      const Icon = item.icon;
      return <Icon size={vertical ? 24 : 32} className={currentStep === item.step ? textClass[color] : "text-mari-muted"} />;
    }
    return (
      <span className={cn(vertical ? "px-1.5 py-0.5" : "px-2", "rounded-full", colorVariantToClassName(resolveColorVariant(color, "solid")))}>
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
          className={cn("flex flex-row gap-2", currentStep === item.step && cn("scale-y-105 transition-all duration-300 font-bold", textClass[color]))}
          onClick={() => onChange?.(item.step)}
        >
          <div>
            {renderStepIcon(item, i)}
            <div
              className={cn(
                "min-h-32 w-0.5 rounded",
                i === data.length - 1 && "hidden",
                getLineClass(currentStep > item.step, color),
                !dot ? "ml-2.5" : "ml-6"
              )}
            />
          </div>
          <div className="flex flex-col cursor-pointer">
            <span>{item.title}</span>
            <span className="text-sm text-mari-muted w-fit truncate">{item.description}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHorizontalContent = (item: StepItem, i: number) => {
    const isCompleted = currentStep > item.step;
    return (
      <div className="flex items-center gap-2 truncate">
        {isCompleted ? (
          <div className={cn("p-1 transition-all rounded-full", solidClass)}>
            <CheckIcon size={16} />
          </div>
        ) : (
          renderStepIcon(item, i)
        )}
        <div className="flex flex-col cursor-pointer pt-5">
          <span>{item.title}</span>
          <span className="text-sm text-mari-muted w-fit truncate">{item.description}</span>
        </div>
        <div className={cn("w-full h-0.5 rounded", i === data.length - 1 && "hidden", getLineClass(isCompleted, color))} />
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
          className={cn("flex-1 min-w-0", currentStep === item.step && cn("scale-102 transition-all font-bold", textClass[color]))}
        >
          {dot ? (
            <div>
              <div className="flex items-center">
                <DotIcon size={48} className={getStepIconClass(currentStep, item.step, color)} />
                <div className={cn("w-full h-0.5 rounded", i === data.length - 1 && "hidden", getLineClass(currentStep > item.step, color))} />
              </div>
              <div className="flex flex-col">
                <span>{item.title}</span>
                <span className="text-sm text-mari-muted w-fit truncate">{item.description}</span>
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
      {content}
      <div className="flex justify-start gap-4">
        <Button color="neutral" variant="outline" disabled={currentStep === 1} onClick={() => onChange?.(currentStep - 1)}>
          Geri
        </Button>
        <Button color={color} disabled={currentStep === data.length} onClick={() => onChange?.(currentStep + 1)}>
          İleri
        </Button>
      </div>
    </div>
  );
}
