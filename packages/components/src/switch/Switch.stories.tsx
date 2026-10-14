import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Veri Girişi/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Anlık açık/kapalı durumları için bir toggle — Checkbox'tan farkı, değişikliğin genelde ANINDA etkili " +
            "olmasıdır (bir formu submit etmeyi beklemez). `useControllableState` ile hem controlled hem uncontrolled " +
            "kullanılabilir. Bağımsız bir `<button role=\"switch\">` render eder — `Button` component'ine bağımlı değildir.",
          whenToUse: ["Bir ayarı hemen uygulayan tekil bir açık/kapalı kontrol için (bildirim aç/kapa, karanlık mod)."],
          whenNotToUse: ["Bir form gönderilene kadar etkisi olmayan bir seçim için — `Checkbox`."],
          a11y:
            "`label` gerçek bir `<label htmlFor>` ile switch'e bağlıdır — hem erişilebilir adı sağlar hem de metne " +
            "tıklamak switch'i değiştirir (eskiden salt dekoratifti). Odak halkası `focus-visible` ile görünür.",
        }),
      },
    },
  },
  argTypes: {
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    onChange: { action: "onChange" },
    disabled: disabledArgType,
    label: { control: "text", description: "Yanında gösterilecek etiket." },
    switchTrueLabel: { control: "text", description: "Açık durumdayken toggle'ın içinde gösterilecek metin." },
    switchFalseLabel: { control: "text", description: "Kapalı durumdayken toggle'ın içinde gösterilecek metin." },
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Açık durumdaki track rengi. Varsayılan: `primary`." },
    loading: { control: "boolean", description: "Yükleniyor durumu — toggle devre dışı kalır ve bir spinner gösterir (`aria-busy`)." },
    skeleton: { control: "boolean", description: "Veri yokken track boyutunda iskelet.", table: { defaultValue: { summary: "false" } } },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { label: "Bildirimler", defaultChecked: false, size: "md", color: "primary", disabled: false, loading: false, skeleton: false },
};

const WithLabelsStory = () => {
  const [value, setValue] = useState(false);
  return <Switch checked={value} onChange={setValue} label="Bildirim" switchTrueLabel="Açık" switchFalseLabel="Kapalı" />;
};
export const WithLabels: Story = {
  name: "İç Etiketli",
  ...storyDoc(
    "`switchTrueLabel`/`switchFalseLabel` ile track içine kısa bir durum metni eklenebilir; track bu metne yer açmak için genişler.",
    `<Switch label="Bildirim" switchTrueLabel="Açık" switchFalseLabel="Kapalı" />`
  ),
  render: () => <WithLabelsStory />,
};

const COLORS = ["primary", "accent", "success", "warning", "error", "info", "neutral"] as const;

const ColorsStory = () => (
  <div className="grid w-fit grid-cols-[auto_auto_auto] items-center gap-x-6 gap-y-3 text-sm">
    <span />
    <span className="text-xs text-mari-muted">Açık</span>
    <span className="text-xs text-mari-muted">Kapalı</span>
    {COLORS.map((color) => (
      <React.Fragment key={color}>
        <span className="text-mari-foreground">{color}</span>
        <Switch defaultChecked color={color} aria-label={`${color} açık`} />
        <Switch color={color} aria-label={`${color} kapalı`} />
      </React.Fragment>
    ))}
  </div>
);
export const SettingsList: Story = {
  name: "Ayarlar Listesi",
  ...storyDoc(
    "En yaygın kullanım: başlık + açıklama solda, switch sağda. Görünür etiket satırdaki başlık olduğu için switch'e `aria-label` verilir.",
    `<li className="flex items-center justify-between gap-4">
  <div>
    <p>Sipariş güncellemeleri</p>
    <p className="text-xs text-mari-muted">Kargo ve teslimat bildirimleri</p>
  </div>
  <Switch defaultChecked aria-label="Sipariş güncellemeleri" />
</li>`
  ),
  render: () => <SettingsDemo />,
};

function SwitchSkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <div className="flex flex-col gap-4">
          <SettingsDemo skeleton={skeleton} />
        </div>
      )}
    </SkeletonDemo>
  );
}

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc(
    "`color` yalnızca AÇIK durumun track rengini belirler; top her renkte beyazdır. Kapalı hal bilinçli olarak her renkte aynı nötr gridir — " +
      "renk \"açık\" bilgisini taşır, kapalıyken renk göstermek iki durumu karıştırırdı.",
    `<Switch defaultChecked color="success" aria-label="Otomatik yedekleme" />`
  ),
  render: () => <ColorsStory />,
};

const SizesStory = () => {
  const [value, setValue] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <Switch checked={value} onChange={setValue} size="sm" label="Küçük" />
      <Switch checked={value} onChange={setValue} size="md" label="Orta" />
      <Switch checked={value} onChange={setValue} size="lg" label="Büyük" />
    </div>
  );
};
export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "`sm`/`md`/`lg` (16/22/28px track). Dokunmatikte her boyutun tıklama alanı görünmez biçimde 44px'e genişler.",
    `<Switch size="sm" label="Küçük" />
<Switch size="md" label="Orta" />
<Switch size="lg" label="Büyük" />`
  ),
  render: () => <SizesStory />,
};

const LoadingStory = () => {
  const [value, setValue] = useState(true);
  const [saving, setSaving] = useState(false);
  const save = (next: boolean) => {
    setSaving(true);
    setTimeout(() => {
      setValue(next);
      setSaving(false);
    }, 1200);
  };
  return <Switch checked={value} onChange={save} loading={saving} label="İki adımlı doğrulama" />;
};
export const Loading: Story = {
  name: "Yükleniyor",
  ...storyDoc(
    "Ayar sunucuya kaydedilirken `loading`: toggle kilitlenir, topun üzerinde spinner döner (`aria-busy`); yanıt gelince yeni durum uygulanır. Tıklayıp deneyin.",
    `const [on, setOn] = useState(true);
const [saving, setSaving] = useState(false);

<Switch
  checked={on}
  loading={saving}
  onChange={async (next) => { setSaving(true); await save(next); setOn(next); setSaving(false); }}
  label="İki adımlı doğrulama"
/>`
  ),
  render: () => <LoadingStory />,
};

const DisabledStory = () => (
  <div className="flex flex-col gap-3">
    <Switch defaultChecked disabled label="Açık, devre dışı (primary)" />
    <Switch defaultChecked disabled color="success" label="Açık, devre dışı (success)" />
    <Switch disabled label="Kapalı, devre dışı" />
  </div>
);
export const Disabled: Story = {
  name: "Durumlar",
  ...storyDoc(
    "`disabled` — tıklanamaz; mevcut durum ve rengi KORUNUR, sadece soluklaşır (%50). Böylece kullanıcı ayarın açık mı kapalı mı olduğunu yine görür.",
    `<Switch defaultChecked disabled label="Otomatik yedekleme" />`
  ),
  render: () => <DisabledStory />,
};

const SETTINGS = [
  { id: "orders", title: "Sipariş güncellemeleri", desc: "Kargo ve teslimat bildirimleri", on: true },
  { id: "campaigns", title: "Kampanyalar", desc: "Size özel indirimler", on: false },
  { id: "stock", title: "Stok bildirimleri", desc: "Favorileriniz stoğa girince", on: true },
];

function SettingsDemo({ skeleton = false }: Readonly<{ skeleton?: boolean }>) {
  return (
    <ul className="max-w-md divide-y divide-mari-border rounded-lg border border-mari-border">
      {SETTINGS.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p id={`${s.id}-t`} className="text-sm font-medium text-mari-foreground">
              {s.title}
            </p>
            <p className="text-xs text-mari-muted">{s.desc}</p>
          </div>
          <div className="shrink-0">
            <Switch defaultChecked={s.on} aria-label={s.title} skeleton={skeleton} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc("`skeleton` — kayıtlı ayar gelene kadar track boyutunda yer tutucu (hangi durumda olduğu bilinmeden açık/kapalı göstermemek için).", `<Switch skeleton={isLoading} defaultChecked={prefs.orders} aria-label="Sipariş güncellemeleri" />`),
  render: () => <SwitchSkeleton />,
};

