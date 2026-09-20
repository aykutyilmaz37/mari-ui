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
 *
 * Faz 13.5 kullanıcı bulgusu: adımlar `role="none"` bir `<div onClick>` idi —
 * `onChange` verilmiş olsa bile klavyeyle ASLA tetiklenemiyordu (Breadcrumb/
 * AutoComplete/Rate'te bulunanlarla aynı sınıf gerçek bug). Ayrıca `onChange`
 * VERİLMEMİŞ olsa bile `cursor-pointer` her zaman uygulanıyordu — salt
 * gösterim amaçlı (salt-okunur) bir Steps bile tıklanabilir GİBİ
 * görünüyordu ama hiçbir şey yapmıyordu. Artık interaktiflik (`role="button"`,
 * `tabIndex`, klavye, `cursor-pointer`) sadece `onChange` VARSA uygulanıyor;
 * geçerli adım `aria-current="step"` taşıyor (ARIA spesifikasyonunun adım
 * göstergeleri için ayrılmış değeri — ant.design'ın gerçek Steps'i bile bunu
 * uygulamıyor, bu bilinçli bir iyileştirme).
 */
export function Steps({ data, color = "primary", currentStep, onChange, onComplete, vertical, dot, content }: StepsProps) {
  const solidClass = colorVariantToClassName(resolveColorVariant(color, "solid"));
  const isInteractive = Boolean(onChange);
  const isLastStep = currentStep === data.length;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, step: number) => {
    if (!onChange) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(step);
    }
  };

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
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-current={currentStep === item.step ? "step" : undefined}
          className={cn(
            "flex flex-row gap-2",
            isInteractive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            currentStep === item.step && cn("scale-y-105 transition-all duration-300 font-bold", textClass[color])
          )}
          onClick={isInteractive ? () => onChange?.(item.step) : undefined}
          onKeyDown={isInteractive ? (e) => handleKeyDown(e, item.step) : undefined}
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
          <div className="flex flex-col">
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
        <div className="flex flex-col pt-5">
          <span>{item.title}</span>
          <span className="text-sm text-mari-muted w-fit truncate">{item.description}</span>
        </div>
        <div className={cn("w-full h-0.5 rounded", i === data.length - 1 && "hidden", getLineClass(isCompleted, color))} />
      </div>
    );
  };

  const renderHorizontalSteps = () => (
    <div className="flex flex-row w-full gap-2">
      {data.map((item, i) => (
        <div
          key={item.step}
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-current={currentStep === item.step ? "step" : undefined}
          onClick={isInteractive ? () => onChange?.(item.step) : undefined}
          onKeyDown={isInteractive ? (e) => handleKeyDown(e, item.step) : undefined}
          className={cn(
            "flex-1 min-w-0",
            isInteractive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            currentStep === item.step && cn("scale-105 transition-all font-bold", textClass[color])
          )}
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

  // Faz 13.5 kullanıcı bulgusu: "Geri"/"İleri" eskiden içerikle aynı `space-y-2`
  // ritmine sahipti (içerik yokken bile göze batmıyordu, ama gerçek bir
  // sihirbaz akışında içerik varken butonlar ona neredeyse yapışık duruyordu)
  // ve `justify-start` ile ikisi de sola yığılıyordu. Gerçek sihirbaz/checkout
  // akışlarında (bkz. Steps.stories.tsx'teki "Gerçek Kullanım" örneği) "Geri"
  // sol köşede, birincil aksiyon ("İleri"/"Onayla") sağ köşede durur — bu
  // yüzden `justify-between`e çevrildi. İçerikten ayrışsın diye üstüne `pt-6`
  // + `border-t` eklendi (bir form/kartın alt eylem çubuğu gibi görünsün diye).
  return (
    <div className="flex w-full flex-col gap-6">
      {vertical ? renderVerticalSteps() : renderHorizontalSteps()}
      {content}
      {onChange && (
        <div className="flex justify-between gap-4 border-t border-mari-border pt-6">
          <Button color="neutral" variant="outline" disabled={currentStep === 1} onClick={() => onChange(currentStep - 1)}>
            Geri
          </Button>
          {isLastStep ? (
            <Button color={color} disabled={!onComplete} onClick={onComplete}>
              Tamamla
            </Button>
          ) : (
            <Button color={color} onClick={() => onChange(currentStep + 1)}>
              İleri
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
