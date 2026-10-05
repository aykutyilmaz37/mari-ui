import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Check, Clock, Truck } from "lucide-react-native";
import { Tag } from "./Tag";
import { Button } from "../Button";
import { Card } from "../Card";
import { Text, Title } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["neutral", "primary", "accent", "success", "warning", "error", "info"] as const;

const meta: Meta<typeof Tag> = {
  title: "Native/Veri Gösterimi/Tag",
  component: Tag,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kısa etiket: durum, kategori ya da uygulanmış filtre. İsteğe bağlı ikon ve kapatma düğmesi.",
    whenToUse: ["Sipariş/ödeme durumu gibi tek kelimelik durumlar.", "Uygulanmış filtreleri kaldırılabilir gösterme."],
    whenNotToUse: ["Sayısal bildirim — `Badge`.", "Seçilebilir seçenek grubu — `Segmented` ya da Checkbox."],
    vsWeb: "Prop'lar aynı (eski `statu` native'de yok, `color` kullanın). Ölçü HIG Footnote 13/18 → 24pt yükseklik. Kapatma ikonu küçük ama `hitSlop` ile 44pt dokunma alanı alır; basılınca belirginleşir (hover yok). `className` yerine `style`.",
  }) } } },
  argTypes: {
    children: { control: "text" },
    color: { control: "select", options: COLORS },
    variant: { control: "select", options: ["soft", "solid", "outline"] },
    bordered: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { children: "Kargoda", color: "info", variant: "soft", bordered: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Playground: Story = {
  ...storyDoc("Renk, varyant ve kenarlığı deneyin."),
  render: (args) => <Tag {...args} />,
};

function OrderStatus() {
  const theme = useTheme();
  const orders = [
    { id: "4821", status: "Teslim edildi", color: "success" as const, Icon: Check },
    { id: "4817", status: "Kargoda", color: "info" as const, Icon: Truck },
    { id: "4809", status: "Ödeme bekleniyor", color: "warning" as const, Icon: Clock },
  ];
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      {orders.map(({ id, status, color, Icon }) => (
        <Card key={id} size="sm">
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text weight="medium">{`Sipariş #${id}`}</Text>
            <Tag color={color} icon={<Icon size={14} color={theme.color[color].subtleContrast} />}>{status}</Tag>
          </View>
        </Card>
      ))}
    </View>
  );
}

export const Orders: Story = {
  name: "Sipariş Durumları",
  ...storyDoc("Durum rengi + ikon + metin: renk tek başına anlam taşımaz.", `<Tag color="success" icon={<Check size={14} />}>Teslim edildi</Tag>`),
  render: () => <OrderStatus />,
};

function FilterBar() {
  const [filters, setFilters] = useState(["Elektronik", "Stokta var", "4 yıldız ve üzeri", "Ücretsiz kargo"]);
  const remove = (filter: string) => setFilters((current) => current.filter((f) => f !== filter));
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      <Title level={6}>{`Filtreler (${filters.length})`}</Title>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {filters.map((filter) => (
          <Tag key={filter} onClose={() => remove(filter)}>{filter}</Tag>
        ))}
      </View>
      {filters.length === 0 ? <Button size="sm" variant="outline" onPress={() => setFilters(["Elektronik", "Stokta var"])}>Filtreleri geri getir</Button> : null}
    </View>
  );
}

export const Filters: Story = {
  name: "Kaldırılabilir Filtreler",
  ...storyDoc("Her kapatma düğmesi kendi adını taşır (\"Elektronik etiketini kaldır\"); dokunma alanı 44pt.", `const [filters, setFilters] = useState(["Elektronik", "Stokta var"]);
{filters.map((f) => <Tag key={f} onClose={() => remove(f)}>{f}</Tag>)}`),
  render: () => <FilterBar />,
};

export const Variants: Story = {
  name: "Varyant ve Renk",
  ...storyDoc("soft (varsayılan), solid, outline; `bordered` soft'a rolün kenarlık tonunu ekler."),
  render: () => (
    <Stack>
      {(["soft", "solid", "outline"] as const).map((variant) => (
        <View key={variant} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {COLORS.map((color) => <Tag key={color} variant={variant} color={color}>{color}</Tag>)}
        </View>
      ))}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {COLORS.map((color) => <Tag key={color} bordered color={color}>{color}</Tag>)}
      </View>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Tag skeleton={isLoading} color="success">Teslim edildi</Tag>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Tag skeleton={skeleton} color="success">Teslim edildi</Tag>
          <Tag skeleton={skeleton} variant="outline" color="info">Kargoda</Tag>
          <Tag skeleton={skeleton} onClose={() => undefined}>Elektronik</Tag>
        </View>
      )}
    </SkeletonDemo>
  ),
};
