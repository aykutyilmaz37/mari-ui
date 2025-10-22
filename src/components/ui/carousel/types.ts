export type DotPosition = "bottom" | "top" | "left" | "right";

export type EffectType = "scrollx";

export type ResponsiveItem = {
  breakpoint: number;
  slidesToShow: number;
  slidesToScroll?: number;
};

export type CarouselControls = {
  selectedIndex: number;
  scrollSnaps: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
};
