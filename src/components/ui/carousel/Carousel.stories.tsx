import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const basicChildren = [
  <div
    key="slide-1"
    className="h-40 bg-red-300 flex items-center justify-center"
  >
    Slide 1
  </div>,
  <div
    key="slide-2"
    className="h-40 bg-green-300 flex items-center justify-center"
  >
    Slide 2
  </div>,
  <div
    key="slide-3"
    className="h-40 bg-blue-300 flex items-center justify-center"
  >
    Slide 3
  </div>,
];

export const Basic: Story = {
  args: {
    children: basicChildren,
  },
};

export const WithArrows: Story = {
  args: {
    arrows: true,
    children: basicChildren,
  },
};

export const Autoplay: Story = {
  args: {
    autoplay: true,
    autoplaySpeed: 2000,
    children: basicChildren,
  },
};

export const FadeEffect: Story = {
  args: {
    fade: true,
    effect: "fade",
    children: basicChildren,
  },
};

export const DotPositions: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {["top", "bottom", "left", "right"].map((position) => (
        <div key={position}>
          <p className="mb-2 font-medium">Dots: {position}</p>
          <Carousel
            dotPosition={position as "top" | "bottom" | "left" | "right"}
            arrows
          >
            {basicChildren}
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

const adaptiveChildren = [
  <div key="short" className="bg-yellow-100 p-6">
    Short Slide
  </div>,
  <div key="tall" className="bg-yellow-200 p-20">
    Tall Slide
  </div>,
  <div key="medium" className="bg-yellow-300 p-10">
    Medium Slide
  </div>,
];

export const AdaptiveHeight: Story = {
  args: {
    adaptiveHeight: true,
    children: adaptiveChildren,
  },
};

export const InfiniteLooping: Story = {
  args: {
    infinite: true,
    waitForAnimate: true,
    beforeChange: (current, next) =>
      console.log("Before change:", current, "to", next),
    afterChange: (index) => console.log("After change:", index),
    arrows: true,
    autoplay: true,
    autoplaySpeed: 1500,
    children: basicChildren,
  },
};

export const Draggable: Story = {
  args: {
    draggable: true,
    arrows: true,
    children: basicChildren,
  },
};
