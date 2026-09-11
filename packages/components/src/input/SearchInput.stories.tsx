import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Veri Girişi/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "`Input`ın üzerine bir arama butonu ekleyen ince sarmalayıcı. `onSearch`, arama butonuna tıklandığında " +
            "VEYA Enter'a basıldığında çağrılır. `Input`ın tüm prop'larını (`{...rest}` ile) devralır.",
          whenToUse: ["Bağımsız bir arama kutusu için (site arama, tablo/liste filtresi)."],
          whenNotToUse: ["Yazarken anlık filtreli öneri listesi gerekiyorsa — `AutoComplete`."],
        }),
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
  ...storyDoc("Tüm props'ları canlı deneyin."),
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

export const AllVariants: Story = {
  name: "Tüm Varyant × Boyut",
  ...storyDoc("4 kenarlık/arka plan stili (`outline`/`soft`/`ghost`/`underlined`) × 3 boyut."),
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((size) => (
                <SearchInput key={`${variant}-${size}`} variant={variant} size={size} placeholder={`${variant} - ${size}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const WithSearch: Story = {
  name: "Arama Tetikleyicili",
  ...storyDoc("`onSearch` — arama ikonuna tıklayınca veya Enter'a basınca güncel değerle çağrılır."),
  args: {
    placeholder: "Bir kelime yazıp aramaya tıklayın",
    onSearch: (value: string) => alert(`Aranıyor: ${value}`),
  },
};
