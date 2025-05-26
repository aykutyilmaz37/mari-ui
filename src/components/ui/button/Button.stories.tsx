import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

const meta: Meta<
  ButtonProps & {
    loadingIconPosition?: "start" | "end";
    showIcon?: boolean;
  }
> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
        "text",
        "link",
      ],
    },
    variant: {
      control: "select",
      options: ["filled", "outlined"],
    },
    size: {
      control: "select",
      options: ["large", "middle", "small"],
    },
    shape: {
      control: "select",
      options: ["default", "circle", "round", "sharp"],
    },
    showIcon: {
      control: "boolean",
    },
    iconPosition: {
      control: "select",
      options: ["start", "end"],
    },

    loading: {
      control: "boolean",
    },
    loadingIconPosition: {
      control: "select",
      options: ["start", "end"],
    },

    block: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    href: {
      control: "text",
    },
    htmlType: {
      control: "select",
      options: ["submit", "reset", "button"],
    },
    target: {
      control: "text",
    },
  },
};
export default meta;

export const Playground: StoryObj<
  ButtonProps & { loadingIconPosition?: "start" | "end"; showIcon?: boolean }
> = {
  args: {
    children: "Button",
    type: "primary",
    variant: "filled",
    size: "middle",
    shape: "default",
    iconPosition: "start",
    showIcon: false,
    loading: false,
    block: false,
    disabled: false,
    htmlType: "button",
    loadingIconPosition: "end",
  },
  render: (args) => {
    const isLoading = args.loading === true;
    const icon = args.showIcon ? <Sparkles className="w-4 h-4" /> : undefined;

    return (
      <Button
        {...args}
        icon={icon}
        loading={
          isLoading
            ? {
                icon: <Loader2 className="w-4 h-4 animate-spin" />,
                iconPosition: args.loadingIconPosition ?? "start",
              }
            : false
        }
      />
    );
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const types = [
      "primary",
      "secondary",
      "success",
      "error",
      "warning",
      "info",
      "text",
      "link",
    ] as const;

    const variants = ["filled", "outlined"] as const;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {types.map((type) =>
          variants.map((variant) => (
            <Button key={`${type}-${variant}`} type={type} variant={variant}>
              {type} {variant}
            </Button>
          ))
        )}
      </div>
    );
  },
};
