import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import { SkeletonButton } from "./SkeletonButton";
import { SkeletonInput } from "./SkeletonInput";

const meta: Meta = {
  title: "Geri Bildirim/Skeleton",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "İçerik yüklenirken yerini tutan, nabız gibi atan (pulse) placeholder bloklar. `Skeleton` (avatar+başlık+" +
          "paragraf kombinasyonu), `SkeletonButton` ve `SkeletonInput` olmak üzere üç varyant. Hook kullanmaz, sunucu " +
          "bileşeni olarak render edilebilir. **Not:** eskiden sabit olmayan genişlikler (`title.width` gibi) " +
          "çalışma zamanında üretilen Tailwind class'larıyla veriliyordu ve hiç uygulanmıyordu — artık inline style " +
          "üzerinden doğru şekilde uygulanıyor.",
      },
    },
  },
};

export default meta;

export const BasicSkeleton: StoryObj = {
  name: "Temel",
  render: () => <Skeleton loading avatar title paragraph active />,
};

export const SkeletonWithRoundedTitle: StoryObj = {
  name: "Yuvarlak Köşeli",
  render: () => <Skeleton loading avatar title paragraph round active />,
};

export const SkeletonWithCustomProps: StoryObj = {
  name: "Özel Genişlikler",
  render: () => (
    <Skeleton loading avatar={{ shape: "circle", size: "lg" }} title={{ width: 150 }} paragraph={{ rows: 4, width: [200, 220, 180, "60%"] }} active />
  ),
};

export const SkeletonButtonVariants: StoryObj = {
  name: "SkeletonButton Varyantları",
  render: () => (
    <div className="space-y-4">
      <SkeletonButton active size="sm" />
      <SkeletonButton active size="md" />
      <SkeletonButton active size="lg" shape="round" />
      <SkeletonButton active size="lg" shape="circle" />
    </div>
  ),
};

export const SkeletonInputVariants: StoryObj = {
  name: "SkeletonInput Varyantları",
  render: () => (
    <div className="space-y-4">
      <SkeletonInput active size="sm" />
      <SkeletonInput active size="md" />
      <SkeletonInput active size="lg" />
    </div>
  ),
};
