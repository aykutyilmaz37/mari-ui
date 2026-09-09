import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Veri Girişi/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`Input`ın üzerine bir arama butonu ekleyen ince sarmalayıcı. `onSearch`, arama butonuna tıklandığında " +
          "VEYA Enter'a basıldığında çağrılır. `Input`ın tüm prop'larını (`{...rest}` ile) devralır.",
      },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { ...colorArgType, description: "Odak/kenarlık rengi." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    allowClear: { control: "boolean" },
    disabled: disabledArgType,
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onSearch: { action: "onSearch", description: "Arama butonuna tıklandığında veya Enter'a basıldığında çağrılır." },
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  args: {
    placeholder: "Ara...",
    allowClear: true,
    size: "md",
    variant: "outline",
    showCount: false,
    maxLength: 50,
    disabled: false,
  },
};

export const WithSearch: Story = {
  name: "Arama Tetikleyicili",
  args: {
    placeholder: "Bir kelime yazıp aramaya tıklayın",
    onSearch: (value: string) => alert(`Aranıyor: ${value}`),
  },
};
