import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { AutoComplete } from "./AutoComplete";
import type { Option } from "./types";

const meta: Meta<typeof AutoComplete> = {
  title: "Veri Girişi/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Yazdıkça filtrelenen bir seçenek listesi açan metin girişi. `onSearch` her tuş vuruşunda, `onSelect` " +
            "bir seçenek seçildiğinde çağrılır. Arama Türkçe ve aksansızdır (\"istanbul\" → İstanbul, \"sisli\" → Şişli); eşleşen kısım kalın. " +
            "Liste en fazla 16rem yüksekliğinde, kendi içinde kayar.",
          whenToUse: ["Kullanıcının serbest yazabildiği ama önceden tanımlı bir listeden de seçebildiği durumlarda (isim, şehir, etiket)."],
          whenNotToUse: ["Seçenekler SABİT ve serbest yazmaya gerek yoksa — `Dropdown`/`Select`."],
          a11y:
            "Tam bir ARIA \"combobox\" deseni: input `role=\"combobox\"` + `aria-expanded`/`aria-controls`/" +
            "`aria-activedescendant`, liste `role=\"listbox\"`, seçenekler `role=\"option\"`. Klavye: **Ok Aşağı/Yukarı** " +
            "vurgulu seçeneği taşır (görünür alana kaydırılır), **Enter** seçer, **Escape** listeyi kapatır. Temizle butonu adlandırılmıştır. " +
            "Dokunmatikte seçenek satırları 44px.",
        }),
      },
      // Açılan liste `position: absolute` — normal akışta yükseklik
      // KATKISI yapmaz. Docs canvas'ı içeriğin doğal yüksekliğine göre
      // boyutlanınca (bkz. preview.tsx) liste açıldığında kanvasın dışına
      // taşıp kesiliyordu. Sabit bir minimum yükseklik bunu önler.
      story: { height: "260px" },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    closeOnBlur: { control: "boolean", description: "Odak kaybedildiğinde listeyi otomatik kapatır." },
    onSearch: { action: "onSearch" },
    onSelect: { action: "onSelect", description: "Bir seçenek seçildiğinde çağrılır." },
    notFoundContent: { control: "text", description: "Eşleşme yokken listede gösterilecek içerik. Verilmezse liste kapanır." },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"] },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
  },
};

export default meta;

type Story = StoryObj<typeof AutoComplete>;

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl",
  "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir",
  "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş",
  "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman",
  "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce",
];
const cityOptions: Option[] = CITIES.map((value, i) => ({ id: i + 1, value }));

export const Playground: Story = {
  ...storyDoc("81 il. \"istanbul\", \"sanliurfa\" ya da \"igdir\" yazın; Ok Aşağı/Yukarı + Enter ile seçin."),
  args: {
    options: cityOptions,
    placeholder: "İl ara",
    "aria-label": "İl",
    notFoundContent: "Böyle bir il bulunamadı",
    size: "md",
    disabled: false,
    skeleton: false,
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

const ShippingFormExample = () => {
  const [city, setCity] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const invalid = city !== "" && selected === null && !CITIES.includes(city);
  let hint = "Yazmaya başlayın.";
  if (invalid) hint = "Listeden bir il seçin.";
  else if (selected) hint = `Kargo ücreti ${selected} için hesaplanacak.`;
  return (
    <div className="flex max-w-sm flex-col gap-1.5">
      <label htmlFor="ship-city" className="text-sm font-medium text-mari-foreground">
        Teslimat ili
      </label>
      <AutoComplete
        id="ship-city"
        aria-label="Teslimat ili"
        options={cityOptions}
        value={city}
        onSearch={(v) => {
          setCity(v);
          setSelected(null);
        }}
        onSelect={(v) => {
          setCity(v);
          setSelected(v);
        }}
        placeholder="İl seçin"
        notFoundContent="Böyle bir il bulunamadı"
        color={invalid ? "error" : undefined}
      />
      <p className={invalid ? "text-xs text-mari-error" : "text-xs text-mari-muted"}>
        {hint}
      </p>
    </div>
  );
};

export const Controlled: Story = {
  name: "Teslimat Formu (controlled)",
  ...storyDoc(
    "`value`+`onSearch`/`onSelect` ile dışarıdan yönetilir; listede olmayan bir değer yazılırsa `color=\"error\"` + mesaj.",
    `<AutoComplete
  id="city"
  options={cityOptions}
  value={city}
  onSearch={setCity}
  onSelect={(v) => { setCity(v); setSelected(v); }}
  notFoundContent="Böyle bir il bulunamadı"
  color={invalid ? "error" : undefined}
/>`
  ),
  render: () => <ShippingFormExample />,
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "Input'la aynı boyut ölçeği — formdaki diğer alanlarla hizalı durur.",
    `<AutoComplete size="sm" options={cityOptions} aria-label="İl" />
<AutoComplete size="md" options={cityOptions} aria-label="İl" />
<AutoComplete size="lg" options={cityOptions} aria-label="İl" />`
  ),
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <AutoComplete key={size} size={size} options={cityOptions} placeholder={`İl ara (${size})`} aria-label={`İl ${size}`} />
      ))}
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<AutoComplete options={cities} placeholder="İl ara" skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <AutoComplete options={cityOptions} placeholder="İl ara" aria-label="İl" className="max-w-sm" skeleton={skeleton} />}</SkeletonDemo>,
};
