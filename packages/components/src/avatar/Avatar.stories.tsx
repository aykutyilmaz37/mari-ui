import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import type { AvatarProps } from "./types";
import { User2Icon } from "lucide-react";

const AVATAR_URL = "/images/avatar.png";

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
      options: ["sm", "md", "lg"],
    },
    src: { control: false },
    icon: { control: false },
    onError: { action: "onError" },
  },
};

export default meta;

export const Playground: StoryObj<AvatarProps> = {
  args: {
    alt: "User",
    shape: "circle",
    size: "md",
    src: AVATAR_URL,
    onError: () => {
      return true;
    },
  },
};

export const WithIconFallback: StoryObj<AvatarProps> = {
  args: {
    alt: "User with Fallback",
    shape: "circle",
    size: "lg",
    src: "",
    icon: <User2Icon size={24} />,
  },
};

export const NoAvatar: StoryObj<AvatarProps> = {
  args: {
    alt: "Avatar",
    shape: "circle",
    size: "lg",
    src: "",
    icon: "",
  },
};

export const AllShapesAndSizes: StoryObj = {
  render: () => {
    const shapes = ["circle", "square"] as const;
    const sizes = ["sm", "md", "lg"] as const;

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
                  alt={`Avatar ${shape} ${size}`}
                  src={AVATAR_URL}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
