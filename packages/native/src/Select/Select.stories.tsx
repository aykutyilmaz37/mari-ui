import React, { useEffect, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Building2, CreditCard, Landmark, Wallet } from "lucide-react-native";
import { Select, type SelectOption, type SelectOptionGroup, type SelectValue } from "./Select";
import { Avatar } from "../Avatar";
import { Field } from "../Field";
import { Input } from "../Input";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNarrow, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Select> = {
  title: "Native/Veri Girişi/Select",
  component: Select,
  tags: ["autodocs"],
  // İlk dekoratör en içte: form genişliği, tema onun dışında.
  decorators: [withNarrow, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Listeden bir (ya da `mode=\"multiple\"` ile birden çok) seçenek seçmek. Kapalıyken Input'la aynı kutu; dokununca seçenekler BottomSheet'te açılır. Arama (Türkçe/aksansız), gruplar, ikon + açıklama, temizleme, yükleniyor.",
    whenToUse: ["5'ten çok seçenek ya da yer dar (il, kategori, kişi).", "Aynı anda birkaç değer (etiketler, atananlar)."],
    whenNotToUse: ["2–5 seçenek, hepsi görünmeli — RadioGroup / Segmented.", "Serbest metin + öneri — AutoComplete."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`). Açılır panel yerine BottomSheet (kullanıcı kararı): tekli seçimde dokunulan seçenek seçilip panel kapanır; çoklu seçimde panel açık kalır, alttaki \"Tamam\" kapatır. `showSearch` panelin üstüne arama alanı koyar (panel %85 yükseklikte sabit, süzerken zıplamaz). Panel başlığı `title` → Field etiketi → `placeholder`. Klavye gezinmesi/harfle atlama yok; `placement`, `listHeight`, `name`, `id` web'e özgü. Ekran okuyucuda alan düğme (+ seçili değer), seçenekler radio/checkbox. **Klavye + ScrollView:** RN dokunuşu React ağacına göre dağıtır; panel Modal'da açılsa da onu açan ekranın ScrollView'unun çocuğu sayılır. O ScrollView'a `keyboardShouldPersistTaps=\"handled\"` verin — vermezseniz klavye açıkken paneldeki ilk dokunuş yalnız klavyeyi kapatır (ör. Select aramasında sonuç seçilmez).",
  }) } } },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"] },
    shape: { control: "select", options: ["default", "pill", "square"] },
    showSearch: { control: "boolean" },
    allowClear: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { placeholder: "Şehir seçin", size: "md", variant: "outline", shape: "default", showSearch: false, allowClear: true, loading: false, disabled: false, skeleton: false, accessibilityLabel: "Şehir" },
};
export default meta;
type Story = StoryObj<typeof Select>;

const CITIES: SelectOption[] = ["Adana", "Ankara", "Antalya", "Aydın", "Bursa", "Eskişehir", "İstanbul", "İzmir", "Kayseri", "Konya", "Muğla", "Trabzon"].map((c) => ({ value: c.toLocaleLowerCase("tr"), label: c }));

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => <Select {...(args as object)} options={CITIES} />,
};

const DISTRICTS: Record<string, string[]> = {
  istanbul: ["Beşiktaş", "Kadıköy", "Üsküdar", "Şişli", "Sarıyer"],
  izmir: ["Bornova", "Karşıyaka", "Konak", "Çeşme"],
  ankara: ["Çankaya", "Keçiören", "Yenimahalle"],
  muğla: ["Bodrum", "Fethiye", "Marmaris"],
};

function AddressDemo() {
  const [city, setCity] = useState<SelectValue | null>("istanbul");
  const [district, setDistrict] = useState<SelectValue | null>(null);
  const [loading, setLoading] = useState(false);
  // İl değişince ilçeler "sunucudan" gelir.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [city]);
  const districts = (DISTRICTS[String(city)] ?? ["Merkez"]).map((d) => ({ value: d, label: d }));
  return (
    <Stack>
      <Field label="İl" required>
        <Select showSearch options={CITIES} value={city} onChange={(v) => { setCity(v); setDistrict(null); }} placeholder="İl seçin" />
      </Field>
      <Field label="İlçe" hint={city ? undefined : "Önce il seçin"}>
        <Select options={districts} value={district} onChange={setDistrict} loading={loading} disabled={!city} placeholder="İlçe seçin" allowClear />
      </Field>
      <Field label="Açık adres">
        <Input placeholder="Mahalle, sokak, no" />
      </Field>
    </Stack>
  );
}

export const Address: Story = {
  name: "Teslimat Adresi (Bağımlı Seçim)",
  ...storyDoc("İl seçilince ilçeler \"yükleniyor\"; il değişince ilçe sıfırlanır. İl aranabilir (\"izmir\", \"mugla\" yazın). `Field` etiketi alanın ve panelin adı olur.", `<Field label="İl">
  <Select showSearch options={cities} value={city} onChange={setCity} />
</Field>
<Field label="İlçe">
  <Select options={districts} value={district} onChange={setDistrict} loading={loading} disabled={!city} />
</Field>`),
  render: () => <AddressDemo />,
};

const PEOPLE = [
  { value: "dk", name: "Deniz Kaya", role: "Ürün Tasarımcısı" },
  { value: "ec", name: "Elif Can", role: "Frontend Geliştirici" },
  { value: "mo", name: "Mert Özdemir", role: "Backend Geliştirici" },
  { value: "sa", name: "Selin Aydın", role: "Ürün Yöneticisi" },
  { value: "bt", name: "Burak Tekin", role: "QA Mühendisi" },
  { value: "zy", name: "Zeynep Yıldız", role: "Veri Analisti" },
];
const PEOPLE_OPTIONS: SelectOption[] = PEOPLE.map((p) => ({ value: p.value, label: p.name, description: p.role, icon: <Avatar size="sm" alt={p.name} /> }));

function AssignDemo() {
  const [value, setValue] = useState<SelectValue[]>(["dk", "ec"]);
  return (
    <Field label="Atananlar" hint={`${value.length} kişi seçili`}>
      <Select mode="multiple" showSearch maxTagCount={3} options={PEOPLE_OPTIONS} value={value} onChange={(v) => setValue(v)} placeholder="Kişi ekleyin" />
    </Field>
  );
}

export const Multiple: Story = {
  name: "Göreve Kişi Atama (Çoklu)",
  ...storyDoc("`mode=\"multiple\"` + `showSearch`: panel seçimden sonra açık kalır, \"Tamam\" kapatır; seçilenler etiket olur (× ile kaldırılır). Seçenekte avatar (`icon`) ve rol (`description`). `maxTagCount={3}` fazlasını \"+N\" yapar.", `<Select
  mode="multiple"
  showSearch
  maxTagCount={3}
  options={people.map((p) => ({ value: p.id, label: p.name, description: p.role, icon: <Avatar size="sm" alt={p.name} /> }))}
  value={assignees}
  onChange={setAssignees}
/>`),
  render: () => <AssignDemo />,
};

function PaymentDemo() {
  const theme = useTheme();
  const ink = theme.color.canvas.muted;
  const groups: SelectOptionGroup[] = [
    {
      label: "Kart",
      options: [
        { value: "credit", label: "Kredi kartı", icon: <CreditCard size={20} color={ink} />, description: "Tek çekim ya da taksit" },
        { value: "debit", label: "Banka kartı", icon: <Wallet size={20} color={ink} /> },
      ],
    },
    {
      label: "Havale",
      options: [
        { value: "eft", label: "Havale / EFT", icon: <Landmark size={20} color={ink} />, description: "1 iş günü içinde onay" },
        { value: "corp", label: "Kurumsal hesap", icon: <Building2 size={20} color={ink} />, description: "Yalnız kurumsal üyeler", disabled: true },
      ],
    },
  ];
  return (
    <Field label="Ödeme yöntemi">
      <Select defaultValue="credit" options={groups} />
    </Field>
  );
}

export const Grouped: Story = {
  name: "Ödeme Yöntemi (Gruplu)",
  ...storyDoc("Seçenekler `{ label, options }` ile gruplanır; ekran okuyucu grubu liste olarak okur. Kullanılamayan seçenek `disabled` + nedeni `description`da.", `<Select defaultValue="credit" options={[
  { label: "Kart", options: [{ value: "credit", label: "Kredi kartı", icon: <CreditCard />, description: "Tek çekim ya da taksit" }, …] },
  { label: "Havale", options: [{ value: "corp", label: "Kurumsal hesap", disabled: true, description: "Yalnız kurumsal üyeler" }, …] },
]} />`),
  render: () => <PaymentDemo />,
};

const SMALL = CITIES.slice(0, 5);

export const SizesAndVariants: Story = {
  name: "Boyut ve Görünüm",
  ...storyDoc("Boyut, varyant ve şekil Input'la aynı ölçekten — formda Input ile aynı hizada durur.", `<Select size="sm" variant="soft" options={…} />`),
  render: () => (
    <Stack>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select key={size} size={size} options={SMALL} placeholder={`size="${size}"`} accessibilityLabel={size} />
      ))}
      {(["soft", "ghost", "underlined"] as const).map((variant) => (
        <Select key={variant} variant={variant} options={SMALL} placeholder={`variant="${variant}"`} accessibilityLabel={variant} />
      ))}
      <Select shape="pill" options={SMALL} placeholder={`shape="pill"`} accessibilityLabel="pill" />
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Doğrulama hatası: `Field`'a `error` verin — kırmızı kenarlık, hata ekran okuyucu ipucu olur. Devre dışı ve yükleniyor.", `<Field label="Kategori" error="Bir kategori seçin">
  <Select options={…} />
</Field>
<Select disabled defaultValue="ankara" options={…} />
<Select loading options={[]} />`),
  render: () => (
    <Stack>
      <Field label="Kategori" error="Bir kategori seçin">
        <Select options={SMALL} placeholder="Seçin" />
      </Field>
      <Select disabled defaultValue="ankara" options={SMALL} accessibilityLabel="Şehir" />
      <Select loading options={[]} placeholder="Yükleniyor…" accessibilityLabel="Şehir" />
      <Text muted style={{ fontSize: 13 }}>Boş sonuç: panelde arama yapın ("zzz").</Text>
      <Select showSearch options={SMALL} accessibilityLabel="Şehir" />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Select options={cities} defaultValue="istanbul" skeleton={isLoading} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ gap: 12 }}>
          <Select skeleton={skeleton} accessibilityLabel="Şehir" options={CITIES} defaultValue="istanbul" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
