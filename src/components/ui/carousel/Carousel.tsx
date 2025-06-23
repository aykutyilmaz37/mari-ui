import React, { Children } from "react";
import clsx from "clsx";
import { dotPosition, effect } from "./types";
import { getDotWrapperClass, getArrowClass } from "./utils";

export type CarouselProps = {
  children: React.ReactNode[];
  arrows?: boolean;
  autoplay?: boolean | { dotDuration?: boolean };
  autoplaySpeed?: number;
  adaptiveHeight?: boolean;
  dotPosition?: dotPosition;
  dots?: boolean | { className?: string };
  fade?: boolean;
  infinite?: boolean;
  speed?: number;
  easing?: string;
  effect?: effect;
  afterChange?: (current: number) => void;
  beforeChange?: (current: number, next: number) => void;
  waitForAnimate?: boolean;
  draggable?: boolean;
};

export const Carousel = ({
  children,
  arrows = false,
  autoplay = false,
  autoplaySpeed = 3000,
  adaptiveHeight = false,
  dotPosition = "bottom",
  dots = true,
  fade = false,
  infinite = true,
  speed = 500,
  easing = "linear",
  effect = "scrollx",
  afterChange,
  beforeChange,
  waitForAnimate = false,
  draggable = false,
}: CarouselProps) => {
  const [current, setCurrent] = React.useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [dragDelta, setDragDelta] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(true);

  const count = Children.count(children);

  const goTo = React.useCallback(
    (index: number, dontAnimate = false) => {
      if (beforeChange) beforeChange(current, index);
      if (dontAnimate) {
        wrapperRef.current?.style.setProperty("transition", "none");
      }
      setCurrent(index);
      if (afterChange) afterChange(index);
    },
    [beforeChange, afterChange, current]
  );

  const next = React.useCallback(() => {
    const nextIndex = current + 1;
    if (!infinite && nextIndex >= count) return;
    goTo(nextIndex % count);
  }, [current, count, goTo, infinite]);

  const prev = React.useCallback(() => {
    const prevIndex = current - 1;
    if (!infinite && prevIndex < 0) return;
    goTo((prevIndex + count) % count);
  }, [current, count, goTo, infinite]);

  React.useEffect(() => {
    if (!autoplay) return;

    timeoutRef.current = setTimeout(() => {
      if (!waitForAnimate || typeof requestAnimationFrame === "undefined") {
        next();
      } else {
        requestAnimationFrame(next);
      }
    }, autoplaySpeed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, autoplay, autoplaySpeed, next, waitForAnimate]);

  React.useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.removeProperty("transition");
    }
  }, [current]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setDragDelta(0);
    setIsAnimating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggable) return;
    const dx = e.clientX - startX;
    setDragDelta(dx);
  };

  const handleMouseUp = () => {
    if (!draggable) return;
    setIsDragging(false);
    setIsAnimating(true);
    if (Math.abs(dragDelta) > 50) {
      if (dragDelta > 0) {
        prev();
      } else {
        next();
      }
    }
    setDragDelta(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragDelta(0);
    setIsAnimating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !draggable) return;
    const dx = e.touches[0].clientX - startX;
    setDragDelta(dx);
  };

  const handleTouchEnd = () => {
    if (!draggable) return;
    setIsDragging(false);
    setIsAnimating(true);
    if (Math.abs(dragDelta) > 50) {
      if (dragDelta > 0) {
        prev();
      } else {
        next();
      }
    }
    setDragDelta(0);
  };

  return (
    <div className={clsx("relative w-full overflow-hidden")}>
      <div
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={clsx("flex transition-all ease-in-out", {
          "duration-[500ms]": speed === 500 && isAnimating,
          "select-none cursor-grabbing": draggable && isDragging,
        })}
        style={{
          transform:
            effect === "scrollx"
              ? `translateX(calc(-${current * 100}% + ${isDragging ? dragDelta : 0}px))`
              : undefined,
          transitionDuration: isAnimating ? `${speed}ms` : "0ms",
          transitionTimingFunction: easing,
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            className={clsx("w-full shrink-0", {
              "transition-opacity duration-500 ease-in-out": fade,
              "opacity-0": fade && index !== current,
              "opacity-100": fade && index === current,
            })}
            style={{
              height: adaptiveHeight ? "auto" : undefined,
              display: fade ? "block" : undefined,
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {dots && (
        <div
          className={clsx(
            getDotWrapperClass(dotPosition),
            typeof dots === "object" && dots.className
          )}
        >
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={clsx("h-2 w-2 rounded-full bg-gray-400", {
                "bg-gray-800": index === current,
              })}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}

      {arrows && (
        <>
          <button
            onClick={prev}
            className={clsx(
              "absolute cursor-pointer",
              getArrowClass(dotPosition, "prev")
            )}
          >
            {"<"}
          </button>
          <button
            onClick={next}
            className={clsx(
              "absolute cursor-pointer",
              getArrowClass(dotPosition, "next")
            )}
          >
            {">"}
          </button>
        </>
      )}
    </div>
  );
};
