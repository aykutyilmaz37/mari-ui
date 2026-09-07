import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from "./Loading";

/**
 * Eskiden bu component'in hiç story'si yoktu — ve görsel olarak bozuktu
 * (bkz. utils.ts'teki not). Faz 3 kapsamında en azından temel bir story
 * eklendi; Faz 4'te standart 4 bölümlü şablona taşınacak.
 */
const meta: Meta<typeof Loading> = {
  title: "Components/Loading",
  component: Loading,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
    },
    trackColor: {
      control: "select",
      options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
    },
  },
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Default: StoryObj<typeof Loading> = {
  args: { color: "info", trackColor: "neutral" },
};
