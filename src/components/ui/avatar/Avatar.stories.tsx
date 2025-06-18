import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import type { AvatarProps } from "./Avatar";
import { User2Icon } from "lucide-react";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    alt: { control: "text" },
    shape: {
      control: "select",
      options: ["circle", "square"],
    },
    size: {
      control: "select",
      options: ["small", "default", "large"],
    },
    src: { control: "text" },
    icon: { control: false },
    onError: { action: "onError" },
  },
};

export default meta;

export const Playground: StoryObj<AvatarProps> = {
  args: {
    alt: "User",
    shape: "circle",
    size: "default",
    src: "https://invalid-url/image.jpg",
    onError: () => {
      return true;
    },
  },
};

export const WithIconFallback: StoryObj<AvatarProps> = {
  args: {
    alt: "User",
    shape: "circle",
    size: "large",
    src: "invalid-url",
    icon: <User2Icon size={16} />,
  },
};

export const AllShapesAndSizes: StoryObj = {
  render: () => {
    const shapes = ["circle", "square"] as const;
    const sizes = ["small", "default", "large"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {shapes.map((shape) => (
          <div key={shape} className="space-y-2">
            <h3 className="font-semibold capitalize">{shape} shape</h3>
            <div className="flex gap-4 items-center">
              {sizes.map((size) => (
                <Avatar
                  key={`${shape}-${size}`}
                  shape={shape}
                  size={size}
                  alt="Example"
                  src={`https://i.pravatar.cc/150?u=${shape}-${size}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
