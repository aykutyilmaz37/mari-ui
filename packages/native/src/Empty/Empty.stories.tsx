import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Search, ShoppingCart } from "lucide-react-native";
import { Empty } from "./Empty";
import { Button } from "../Button";
import { Card } from "../Card";
import { SearchInput } from "../Input";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Empty> = {
  title: "Native/Veri Gösterimi/Empty",
  component: Empty,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Boş durum: neden boş ve ne yapılabilir.",
    whenToUse: ["Sonuçsuz arama, boş sepet, henüz kayıt yok.", "Liste/kart içinde küçük (`sm`)."],
    whenNotToUse: ["Veri henüz yükleniyorken — `skeleton`.", "Hata — Alert."],
    vsWeb: "Prop'lar aynı (eylem `actions` yuvasında `Button`); `titleAs` yerine `heading` (ekran okuyucuda başlık). Başlık md = Title 3 20/25, sm = Subheadline 15/20.",
  }) } } },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    actions: { control: false },
    size: { control: "select", options: ["sm", "md"] },
    skeleton: { control: "boolean" },
  },
  args: { title: "Sepetiniz boş", description: "Beğendiğiniz ürünleri sepete ekleyin, burada görünsün.", size: "md", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Empty>;

export const Playground: Story = {
  ...storyDoc("Başlık, açıklama, düğme ve boyutu deneyin."),
  decorators: [withStretch],
  render: (args) => <Empty {...args} icon={<ShoppingCart />} actions={<Button skeleton={args.skeleton} onPress={() => undefined}>Alışverişe başla</Button>} />,
};

function SearchDemo() {
  const [query, setQuery] = useState("kablosuz şarj standı mor");
  return (
    <Stack>
      <SearchInput accessibilityLabel="Ürün ara" value={query} onChangeText={setQuery} shape="pill" allowClear />
      <Empty
        heading
        icon={<Search />}
        title="Sonuç bulunamadı"
        description={`"${query}" için ürün bulamadık. Yazımı kontrol edin ya da daha genel bir arama deneyin.`}
        actions={
          <>
            <Button size="sm" variant="outline" onPress={() => setQuery("")}>Aramayı temizle</Button>
            <Button size="sm" onPress={() => setQuery("şarj")}>"şarj" ara</Button>
          </>
        }
      />
    </Stack>
  );
}

export const SearchResult: Story = {
  name: "Arama Sonucu",
  ...storyDoc("Sorgu metni açıklamada; iki eylem.", `<Empty
  heading
  icon={<Search />}
  title="Sonuç bulunamadı"
  description={\`"\${query}" için ürün bulamadık.\`}
  actions={<Button size="sm" onPress={clear}>Aramayı temizle</Button>}
/>`),
  decorators: [withStretch],
  render: () => <SearchDemo />,
};

export const InCard: Story = {
  name: "Kart İçinde (sm)",
  ...storyDoc("Kart/liste içinde küçük boş durum.", `<Card title="Son siparişler">
  <Empty size="sm" title="Henüz sipariş yok" actions={<Button size="sm" onPress={browse}>Ürünlere göz at</Button>} />
</Card>`),
  decorators: [withStretch],
  render: () => (
    <Card title="Son siparişler">
      <Empty size="sm" title="Henüz sipariş yok" description="İlk siparişiniz burada görünecek." actions={<Button size="sm" onPress={() => undefined}>Ürünlere göz at</Button>} />
    </Card>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Empty skeleton={isLoading} icon={<ShoppingCart />} title="Sepetiniz boş" description="Beğendiğiniz ürünleri sepete ekleyin, burada görünsün." actions={<Button skeleton={isLoading} onPress={goShopping}>Alışverişe başla</Button>} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => <Empty skeleton={skeleton} icon={<ShoppingCart />} title="Sepetiniz boş" description="Beğendiğiniz ürünleri sepete ekleyin, burada görünsün." actions={<Button skeleton={skeleton} onPress={() => undefined}>Alışverişe başla</Button>} />}
    </SkeletonDemo>
  ),
};
