import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import { SkeletonButton } from "./SkeletonButton";
import { SkeletonInput } from "./SkeletonInput";

const meta: Meta = {
  title: "Components/Skeleton",
  tags: ["autodocs"],
};

export default meta;

export const BasicSkeleton: StoryObj = {
  render: () => <Skeleton loading avatar title paragraph active />,
};

export const SkeletonWithRoundedTitle: StoryObj = {
  render: () => <Skeleton loading avatar title paragraph round active />,
};

export const SkeletonWithCustomProps: StoryObj = {
  render: () => (
    <Skeleton
      loading
      avatar={{ shape: "circle", size: "large" }}
      title={{ width: 150 }}
      paragraph={{ rows: 4, width: [200, 220, 180, "60%"] }}
      active
    />
  ),
};

export const SkeletonButtonVariants: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <SkeletonButton active size="small" />
      <SkeletonButton active size="default" />
      <SkeletonButton active size="large" shape="round" />
      <SkeletonButton active size="large" shape="circle" />
    </div>
  ),
};

export const SkeletonInputVariants: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <SkeletonInput active size="small" />
      <SkeletonInput active size="default" />
      <SkeletonInput active size="large" />
    </div>
  ),
};
