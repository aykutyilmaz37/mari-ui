import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "./Button";
import type { ButtonProps } from "./types";

/**
 * Not: Bu story Faz 3'te sadece yeni prop API'siyle ÇALIŞIR durumda
 * tutuldu. Standart 4 bölümlü şablon (Docs/Kod/Playground/Varyantlar,
 * Türkçe) Faz 4'te uygulanacak.
 */
const meta: Meta<ButtonProps & { showIcon?: boolean }> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
    },
    variant: { control: "select", options: ["solid", "outline", "soft", "ghost", "link"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "select", options: ["default", "pill", "circle", "square"] },
    showIcon: { control: "boolean" },
    iconPosition: { control: "select", options: ["start", "end"] },
    loading: { control: "boolean" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<ButtonProps & { showIcon?: boolean }>;

export const Playground: Story = {
  args: {
    children: "Button",
    color: "primary",
    variant: "solid",
    size: "md",
    shape: "default",
    iconPosition: "start",
    showIcon: false,
    loading: false,
    block: false,
    disabled: false,
  },
  render: (args) => {
    const { showIcon, ...rest } = args;
    return (
      <Button
        {...rest}
        icon={showIcon ? <Sparkles className="w-4 h-4" /> : undefined}
        loading={
          args.loading ? { icon: <Loader2 className="w-4 h-4 animate-spin" />, iconPosition: "start" } : false
        }
      />
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const colors = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
    const variants = ["solid", "outline", "soft", "ghost", "link"] as const;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {colors.map((color) =>
          variants.map((variant) => (
            <Button key={`${color}-${variant}`} color={color} variant={variant}>
              {color} {variant}
            </Button>
          ))
        )}
      </div>
    );
  },
};
