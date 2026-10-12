import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { MapPin, Search } from "lucide-react-native";
import { AutoComplete, type AutoCompleteOption } from "./AutoComplete";
import { Button } from "../Button";
import { Field } from "../Field";
import { Input } from "../Input";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNarrow, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof AutoComplete> = {
  title: "Native/Veri Girişi/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  decorators: [withNarrow, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Yazarken öneri sunan alan. Dokununca BottomSheet açılır: üstte kendiliğinden odaklanan arama alanı, altında öneriler — klavye hiçbirini örtmez. Türkçe / aksansız arama (\"istanbul\" → İstanbul, \"sanli\" → Şanlıurfa), eşleşen kısım vurgulu. Listede yoksa \"“…” kullan\" satırı ya da klavyede \"bitti\" serbest metni kabul eder.",
    whenToUse: ["Serbest metin + sık değerler: şehir, marka, e-posta alan adı.", "Sunucudan gelen öneriler (`onSearch` ile)."],
    whenNotToUse: ["Yalnız listedeki değerler geçerliyse — Select (`showSearch`).", "Ağaç / hiyerarşi — TreeSelect."],
    vsWeb: "`options: { id, value }[]`, `onSearch`, `onSelect`, `notFoundContent` web ile aynı. Fark: öneriler alanın altında açılan liste değil, BottomSheet'te (kullanıcı kararı — alan ekranın altındayken alttaki liste klavyenin arkasında kalıyordu; Select ile aynı düzen). Bu yüzden `closeOnBlur` yok; `onSearch` paneldeki arama metnini, `onSelect(value, option?)` kesinleşen değeri bildirir (serbest metinde `option` yok). Yeni: `allowFreeText`, `freeTextLabel`, `title`, `open` / `onOpenChange`.",
  }) } } },
  argTypes: {
    allowClear: { control: "boolean" },
    allowFreeText: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    skeleton: { control: "boolean" },
  },
  args: { placeholder: "Şehir ara", allowClear: true, allowFreeText: true, disabled: false, size: "md", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof AutoComplete>;

const CITY_NAMES = ["Adana", "Ankara", "Antalya", "Aydın", "Balıkesir", "Bursa", "Çanakkale", "Denizli", "Diyarbakır", "Edirne", "Erzurum", "Eskişehir", "Gaziantep", "Iğdır", "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya", "Muğla", "Ordu", "Sakarya", "Samsun", "Şanlıurfa", "Trabzon", "Uşak", "Van"];
const CITIES: AutoCompleteOption[] = CITY_NAMES.map((value, id) => ({ id, value }));

function SearchIcon() {
  const theme = useTheme();
  return <Search size={18} color={theme.color.canvas.muted} />;
}

function PinIcon() {
  const theme = useTheme();
  return <MapPin size={18} color={theme.color.canvas.muted} />;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin. Alana dokunun, panelde \"sanli\", \"IGDIR\" ya da \"istanbul\" yazın."),
  render: (args) => <AutoComplete {...args} options={CITIES} icon={<SearchIcon />} accessibilityLabel="Şehir" />,
};

const DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "icloud.com", "yandex.com", "mari-ui.com"];

function DeliveryDemo() {
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [sent, setSent] = useState(false);
  // E-posta: paneldeki metinde "@"den sonrası için alan adı önerileri.
  const at = emailQuery.indexOf("@");
  const emailOptions: AutoCompleteOption[] = at > 0 ? DOMAINS.map((d, id) => ({ id, value: `${emailQuery.slice(0, at)}@${d}` })) : [];
  return (
    <View style={{ gap: 12 }}>
      <Field label="Ad Soyad">
        <Input placeholder="Deniz Kaya" />
      </Field>
      <Field label="Şehir" required hint="Listede yoksa yazabilirsiniz.">
        <AutoComplete options={CITIES} value={city} onSelect={setCity} placeholder="Şehir" icon={<PinIcon />} notFoundContent="Eşleşen şehir yok." allowClear />
      </Field>
      <Field label="E-posta">
        <AutoComplete options={emailOptions} value={email} onSearch={setEmailQuery} onSelect={setEmail} placeholder="ad@ornek.com" />
      </Field>
      <Button block onPress={() => setSent(true)}>Kaydet</Button>
      {sent ? <Text muted>{`Şehir: ${city || "—"} · E-posta: ${email || "—"}`}</Text> : null}
    </View>
  );
}

export const Controlled: Story = {
  name: "Teslimat Formu (controlled)",
  ...storyDoc(
    "Kontrollü: `value` + `onSelect` (kesinleşen). Şehirde listede olmayan değer \"“…” kullan\" satırıyla kabul edilir. E-postada öneriler paneldeki metne göre üretilir (`onSearch`): \"@\"den sonrası için alan adları.",
    `<AutoComplete options={cities} value={city} onSelect={setCity} notFoundContent="Eşleşen şehir yok." />
<AutoComplete options={emailOptions} value={email} onSearch={setEmailQuery} onSelect={setEmail} />`
  ),
  render: () => <DeliveryDemo />,
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("Alan Input ölçeğinde (sm / md / lg).", `<AutoComplete size="sm" />  <AutoComplete size="lg" />`),
  render: () => (
    <View style={{ gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <AutoComplete key={size} size={size} options={CITIES} placeholder={`Şehir (${size})`} accessibilityLabel={`Şehir ${size}`} />
      ))}
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Alan kendi kutusunda; Field içindeyse etiket ve ipucu da.", `<Field label="Şehir" skeleton={isLoading}><AutoComplete options={cities} /></Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Şehir" hint="Listede yoksa yazabilirsiniz." skeleton={skeleton}>
          <AutoComplete options={CITIES} defaultValue="İzmir" />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
