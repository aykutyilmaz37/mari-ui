import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { BottomSheet, type BottomSheetProps } from "./BottomSheet";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Divider } from "../Divider";
import { Input } from "../Input";
import { ListItem, List, ListItemMeta } from "../List";
import { Segmented } from "../Segmented";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof BottomSheet> = {
  title: "Native/Geri Bildirim/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Alttan açılan panel: sürüklenir, durak noktalarında (yarım/tam) durur, aşağı çekince kapanır.",
    whenToUse: ["Filtre, sıralama, seçenek listesi.", "Bağlamı bozmadan ikincil içerik (yorumlar, ayrıntı).", "Eylem listesi — `ActionSheet`."],
    whenNotToUse: ["Kısa onay — `Dialog`.", "Odaklı form ya da uzun okuma (tablet/geniş ekran) — `Modal`."],
    vsWeb: "Web'de `Drawer` (`placement=\"bottom\"`) karşılığı; native'de ek paket olmadan (Animated + PanResponder) sürükleme ve durak noktaları. Sürükleme tutamaç ve başlıktan (içerikteki kaydırma bozulmaz). Tutamaca dokunmak sonraki durağa geçer. Kapatma: aşağı çekme, karartma, Android geri tuşu, VoiceOver \"geri\" hareketi. Klavye açılınca panel yukarı kayar. Alt güvenli alan payı `bottomInset` (varsayılan iOS 28 / Android 16). **Klavye + ScrollView:** RN dokunuşu React ağacına göre dağıtır; panel Modal'da açılsa da onu açan ekranın ScrollView'unun çocuğu sayılır. O ScrollView'a `keyboardShouldPersistTaps=\"handled\"` verin — vermezseniz klavye açıkken paneldeki ilk dokunuş yalnız klavyeyi kapatır (ör. Select aramasında sonuç seçilmez).",
  }) } } },
  argTypes: {
    title: { control: "text" },
    maskClosable: { control: "boolean" },
    closable: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { title: "Sırala", maskClosable: true, closable: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

function Trigger({ label, children }: { label: string; children: (close: () => void, open: boolean) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>{label}</Button>
      {children(() => setOpen(false), open)}
    </>
  );
}

const SORTS = ["Önerilen", "En düşük fiyat", "En yüksek fiyat", "En çok değerlendirilen", "En yeniler"];

export const Playground: Story = {
  ...storyDoc("İçerik kadar yükseklik (durak yok); aşağı çekerek ya da karartmaya dokunarak kapatın."),
  render: (args) => (
    <Trigger label="Sırala">
      {(close, open) => (
        <BottomSheet {...(args as BottomSheetProps)} open={open} onClose={close}>
          {SORTS.map((s) => <Button key={s} variant="ghost" color="neutral" onPress={close} style={{ justifyContent: "flex-start" }}>{s}</Button>)}
        </BottomSheet>
      )}
    </Trigger>
  ),
};

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Realme", "Nokia", "Sony", "Asus", "Lenovo", "Motorola", "OnePlus"];

function FilterDemo() {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState(0);
  const [selected, setSelected] = useState<string[]>(["Apple"]);
  const toggle = (brand: string, on: boolean) => setSelected((cur) => (on ? [...cur, brand] : cur.filter((b) => b !== brand)));
  return (
    <View style={{ gap: 8 }}>
      <Button onPress={() => setOpen(true)}>{`Filtrele (${selected.length})`}</Button>
      <Text muted>{`Son durak: ${snap === 0 ? "yarım" : "tam"}`}</Text>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filtrele"
        snapPoints={["50%", "90%"]}
        onSnapChange={setSnap}
        footer={<Button block onPress={() => setOpen(false)}>{`${selected.length * 128} ürünü göster`}</Button>}
      >
        <Title level={6}>Fiyat</Title>
        <Segmented block options={["Tümü", "< ₺5.000", "₺5.000+"]} style={{ marginTop: 8 }} />
        <Divider size="sm" />
        <Title level={6}>Marka</Title>
        {BRANDS.map((b) => <Checkbox key={b} label={b} checked={selected.includes(b)} onChange={(on) => toggle(b, on)} />)}
      </BottomSheet>
    </View>
  );
}

export const Filter: Story = {
  name: "Filtre Paneli (yarım / tam)",
  ...storyDoc(
    "İki durak: yarım ekranda açılır, yukarı çekince tam ekrana çıkar; içerik kendi içinde kayar, \"Uygula\" altta sabit. Tutamaca dokunmak duraklar arasında geçer.",
    `const [selected, setSelected] = useState<string[]>(["Apple"]);
const toggle = (brand: string, on: boolean) => setSelected((cur) => (on ? [...cur, brand] : cur.filter((b) => b !== brand)));

<BottomSheet
  open={open}
  onClose={close}
  title="Filtrele"
  snapPoints={["50%", "90%"]}
  footer={<Button block onPress={apply}>128 ürünü göster</Button>}
>
  {["Apple", "Samsung", "Xiaomi", "Huawei"].map((brand) => (
    <Checkbox key={brand} label={brand} checked={selected.includes(brand)} onChange={(on) => toggle(brand, on)} />
  ))}
</BottomSheet>`
  ),
  render: () => <FilterDemo />,
};

const COMMENTS = [
  { id: "1", name: "Elif Can", text: "Kargo çok hızlıydı, teşekkürler!" },
  { id: "2", name: "Mert Kaya", text: "Rengi fotoğraftakinden biraz daha koyu." },
  { id: "3", name: "Ayşe Demir", text: "Beden tablosu doğru, rahatlıkla alabilirsiniz." },
];

export const Comments: Story = {
  name: "Yorumlar (klavye)",
  ...storyDoc("Altta yorum alanı: klavye açılınca panel yukarı kayar, alan görünür kalır.", `<BottomSheet open={open} onClose={close} title="Yorumlar" snapPoints={["60%"]} footer={<Input placeholder="Yorum yaz…" />}>
  <List
    data={comments}
    keyExtractor={(c) => c.id}
    renderItem={(c) => (
      <ListItem>
        <ListItemMeta title={c.name} description={c.text} />
      </ListItem>
    )}
  />
</BottomSheet>`),
  render: () => (
    <Trigger label="Yorumları gör (3)">
      {(close, open) => (
        <BottomSheet open={open} onClose={close} title="Yorumlar" snapPoints={["60%"]} footer={<Input accessibilityLabel="Yorum" placeholder="Yorum yaz…" />}>
          <List data={COMMENTS} keyExtractor={(c) => c.id} scrollEnabled={false} renderItem={(c) => <ListItem><ListItemMeta title={c.name} description={c.text} /></ListItem>} />
        </BottomSheet>
      )}
    </Trigger>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Önce durumu seçin, sonra paneli açın.", `<BottomSheet open={open} onClose={close} title="Sırala" skeleton={isLoading}>
  {["Önerilen", "En düşük fiyat", "En yüksek fiyat"].map((s) => (
    <Text key={s} style={{ paddingVertical: 12 }}>{s}</Text>
  ))}
</BottomSheet>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Trigger label="Paneli aç">
          {(close, open) => (
            <BottomSheet open={open} onClose={close} title="Sırala" skeleton={skeleton}>
              {SORTS.map((s) => <Text key={s} style={{ paddingVertical: 12 }}>{s}</Text>)}
            </BottomSheet>
          )}
        </Trigger>
      )}
    </SkeletonDemo>
  ),
};
