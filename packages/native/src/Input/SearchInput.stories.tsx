import React, { useRef, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof SearchInput> = {
  title: "Native/Veri Girişi/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Arama alanı: klavyedeki \"Ara\" tuşu ve sondaki ara düğmesi aynı `onSearch`'ü çağırır.",
    whenToUse: ["Ürün, kişi, sipariş araması.", "Sonuçların sunucudan geldiği (yükleniyor göstergeli) aramalar."],
    whenNotToUse: ["Yazarken öneri listesi — AutoComplete.", "Kısa bir listede süzme — `Input` + `onChangeText`."],
    vsWeb: "Input'un tüm prop'ları + `onSearch`, `loading`, `searchLabel`. Klavyenin dönüş tuşu \"Ara\" (`returnKeyType=\"search\"`). Ara düğmesi küçük ama `hitSlop` ile 44pt dokunma alanı; `loading` sırasında dönen gösterge, alan yazılabilir kalır.",
  }) } } },
  argTypes: {
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"] },
    shape: { control: "select", options: ["default", "pill", "square"] },
    loading: { control: "boolean" },
    allowClear: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { placeholder: "Ürün, marka ya da kategori ara", size: "md", variant: "outline", shape: "default", loading: false, allowClear: true, disabled: false, skeleton: false, accessibilityLabel: "Ürün ara" },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  ...storyDoc("Boyut, varyant, biçim ve yükleniyor halini deneyin."),
  render: (args) => <View style={{ alignSelf: "stretch" }}><SearchInput {...args} /></View>,
};

const PRODUCTS = ["Kablosuz kulaklık", "Kulak üstü kulaklık", "Bluetooth hoparlör", "Akıllı saat", "Telefon kılıfı"];

function ProductSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const search = (query: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const q = query.trim().toLocaleLowerCase("tr");
      setResults(PRODUCTS.filter((p) => p.toLocaleLowerCase("tr").includes(q)));
      setLoading(false);
    }, 700);
  };
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      <SearchInput accessibilityLabel="Ürün ara" placeholder="Ürün ara (ör. kulaklık)" shape="pill" allowClear loading={loading} onSearch={search} onClear={() => setResults(null)} />
      {results ? <Text muted>{results.length ? `${results.length} sonuç: ${results.join(", ")}` : "Sonuç bulunamadı."}</Text> : null}
    </View>
  );
}

export const ProductSearchStory: Story = {
  name: "Ürün Arama (Ara tuşu + yükleniyor)",
  ...storyDoc(
    "Klavyedeki \"Ara\" ya da ara düğmesi; sonuç gelene kadar gösterge.",
    `<SearchInput accessibilityLabel="Ürün ara" shape="pill" allowClear loading={loading} onSearch={search} />`
  ),
  render: () => <ProductSearch />,
};

export const Variants: Story = {
  name: "Varyant × Boyut",
  ...storyDoc("outline, soft, ghost, underlined; sm/lg; hap biçimi.", `<SearchInput variant="soft" shape="pill" size="lg" />`),
  render: () => (
    <Stack>
      {(["outline", "soft", "ghost", "underlined"] as const).map((variant) => <SearchInput key={variant} variant={variant} placeholder={variant} accessibilityLabel={variant} />)}
      <SearchInput size="sm" shape="pill" placeholder="sm · pill" accessibilityLabel="sm" />
      <SearchInput size="lg" variant="soft" shape="pill" placeholder="lg · soft · pill" accessibilityLabel="lg" />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<SearchInput skeleton={isLoading} accessibilityLabel="Ürün ara" />`),
  render: () => <SkeletonDemo>{(skeleton) => <SearchInput skeleton={skeleton} accessibilityLabel="Ürün ara" placeholder="Ürün ara" shape="pill" />}</SkeletonDemo>,
};
