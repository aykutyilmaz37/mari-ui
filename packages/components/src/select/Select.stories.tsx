/**
 * Faz 16.1: gerçek senaryolar — bağımlı il/ilçe seçimi (yükleniyor), göreve
 * kişi atama (çoklu, avatar + açıklama), gruplu kategori. "Show code" her
 * story'de `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BanknoteIcon, CreditCardIcon, LandmarkIcon, WalletIcon } from "lucide-react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Avatar } from "../avatar";
import { Field } from "../field";
import { Select } from "./Select";
import type { SelectOption, SelectOptionGroup, SelectValue } from "./types";

const meta: Meta<typeof Select> = {
  title: "Veri Girişi/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Liste body'ye portal edilir ve tetikleyicinin altında açılır — kanvas kısa kalırsa sayfanın dibine taşar.
      story: { height: "380px" },
      description: {
        component: componentDoc({
          summary:
            "Sabit bir listeden bir ya da birden çok değer seçtiren alan. Görünümü Input'la birebir aynı (boyut, varyant, " +
            "doğrulama rengi). `showSearch` ile yazarak süzülür (Türkçe/aksansız: \"izmir\" → İzmir). `mode=\"multiple\"` " +
            "seçimleri etiket olarak gösterir, liste seçimden sonra açık kalır. Seçenekler gruplanabilir, ikon ve açıklama " +
            "taşıyabilir; `optionRender` ile satır tamamen özelleştirilir. `name` verilirse native form'a gizli alan(lar)la katılır.",
          whenToUse: [
            "5'ten fazla seçenek arasından seçim (az seçenekte Radio/Segmented daha hızlı okunur).",
            "Uzun listeler (il, ülke, kategori) — `showSearch` ile.",
            "Birden çok değer (etiket, atanan kişiler) — `mode=\"multiple\"`.",
          ],
          whenNotToUse: [
            "Kullanıcı listede olmayan bir değer de yazabilecekse — AutoComplete.",
            "Seçim bir eylem tetikliyorsa (Düzenle / Sil) — Dropdown menüsü.",
          ],
          a11y:
            "APG combobox deseni: tetikleyici `role=\"combobox\"` (arama yoksa etiketlenebilir bir `<button>` — `<label htmlFor>` " +
            "çalışır), liste `role=\"listbox\"`, gruplar `role=\"group\"` + başlık. Odak listeye geçmez; aktif seçenek " +
            "`aria-activedescendant` ile bildirilir. Klavye: ↓/↑ açar ve gezinir (disabled atlanır), Home/End, Enter/Boşluk seçer, " +
            "Escape kapatır, Tab tekli seçimde aktif seçeneği onaylayıp geçer, harf yazmak o harfle başlayana atlar " +
            "(\"is\" → İstanbul); çokluda Backspace son etiketi siler. `color=\"error\"` → `aria-invalid`.",
        }),
      },
    },
  },
  argTypes: {
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onSearch: { table: { category: "Olaylar" } },
    onOpenChange: { table: { category: "Olaylar" } },
    optionRender: { control: false },
    mode: { control: "inline-radio", options: [undefined, "multiple"], description: "`multiple`: çoklu seçim, etiketler." },
    placeholder: { control: "text" },
    showSearch: { control: "boolean", description: "Yazarak süz. Varsayılan: `false`." },
    allowClear: { control: "boolean", description: "Temizle düğmesi. Varsayılan: `false`." },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: baseSizeArgType,
    variant: { control: "inline-radio", options: ["outline", "soft", "ghost", "underlined"], table: { category: "Görünüm" } },
    color: { ...colorArgType, description: "`error`/`warning`: doğrulama durumu (Input'la aynı)." },
    placement: { control: "select", options: ["bottom-start", "bottom-end", "top-start", "top-end"] },
    listHeight: { control: "text", description: "Liste en fazla bu yükseklikte. Varsayılan: `16rem`." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/* ─────────────────────────── 1. Bağımlı il / ilçe ─────────────────────────── */

const DISTRICTS: Record<string, string[]> = {
  "İstanbul": ["Beşiktaş", "Kadıköy", "Şişli", "Üsküdar", "Sarıyer", "Bakırköy", "Beyoğlu", "Ataşehir", "Maltepe", "Pendik"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Urla", "Çeşme"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Kepez", "Alanya", "Manavgat", "Kaş"],
  "Bursa": ["Osmangazi", "Nilüfer", "Yıldırım", "Mudanya", "İnegöl"],
  "Muğla": ["Bodrum", "Fethiye", "Marmaris", "Datça", "Menteşe"],
};
const cityOptions: SelectOption[] = Object.keys(DISTRICTS).map((city) => ({ value: city, label: city }));

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    "aria-label": "Şehir",
    options: cityOptions,
    placeholder: "İl seçin",
    showSearch: false,
    allowClear: true,
    loading: false,
    disabled: false,
    size: "md",
    variant: "outline",
    placement: "bottom-start",
    skeleton: false,
  },
  render: (args) => (
    <div className="max-w-xs">
      <Select {...args} />
    </div>
  ),
};

export const DependentAddress: Story = {
  name: "Teslimat Adresi (Bağımlı Seçim)",
  ...storyDoc(
    "İl seçilince ilçeler \"yükleniyor\"; il değişince ilçe sıfırlanır. İl aranabilir (\"izmir\", \"mugla\" yazın). " +
      "`Field` etiketi ve ipucunu tetikleyiciye bağlar (id'ler otomatik).",
    `
<Field label="İl">
  <Select showSearch options={cities} value={city} onChange={setCity} />
</Field>

<Field label="İlçe" hint={loadingDistricts ? "İlçeler yükleniyor…" : undefined}>
  <Select options={districts} value={district} onChange={setDistrict}
    disabled={!city} loading={loadingDistricts} placeholder={city ? "İlçe seçin" : "Önce il seçin"} />
</Field>`
  ),
  render: () => {
    const [city, setCity] = useState<SelectValue | null>(null);
    const [district, setDistrict] = useState<SelectValue | null>(null);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setDistrict(null);
      setDistricts([]);
      if (!city) return;
      setLoading(true);
      const timer = setTimeout(() => {
        setDistricts((DISTRICTS[String(city)] ?? []).map((d) => ({ value: d, label: d })));
        setLoading(false);
      }, 700);
      return () => clearTimeout(timer);
    }, [city]);

    return (
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Field label="İl">
          <Select id="city" showSearch placeholder="İl seçin" options={cityOptions} value={city} onChange={(v) => setCity(v)} />
        </Field>
        <Field label="İlçe" hint={loading ? "İlçeler yükleniyor…" : undefined}>
          <Select
            id="district"
            showSearch
            options={districts}
            value={district}
            onChange={(v) => setDistrict(v)}
            disabled={!city}
            loading={loading}
            placeholder={city ? "İlçe seçin" : "Önce il seçin"}
          />
        </Field>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Kişi atama (çoklu) ─────────────────────────── */

const people = [
  { value: "dk", name: "Deniz Kaya", role: "Ürün Tasarımcısı" },
  { value: "ec", name: "Elif Can", role: "Frontend Geliştirici" },
  { value: "mo", name: "Mert Özdemir", role: "Backend Geliştirici" },
  { value: "sa", name: "Selin Aydın", role: "Ürün Yöneticisi" },
  { value: "bt", name: "Burak Tekin", role: "QA Mühendisi" },
  { value: "zy", name: "Zeynep Yıldız", role: "Veri Analisti" },
];
const peopleOptions: SelectOption[] = people.map((p) => ({
  value: p.value,
  label: p.name,
  description: p.role,
  icon: <Avatar size="sm" alt={p.name} />,
}));

export const AssignPeople: Story = {
  name: "Göreve Kişi Atama (Çoklu)",
  ...storyDoc(
    "`mode=\"multiple\"` + `showSearch`: seçimden sonra liste açık kalır, seçilenler etiket olur (✕ ya da Backspace ile " +
      "kaldırılır). Seçenekte avatar (`icon`) ve rol (`description`). `maxTagCount={3}` fazlasını \"+N\" yapar.",
    `
<Select
  mode="multiple"
  showSearch
  allowClear
  maxTagCount={3}
  placeholder="Kişi ekleyin"
  options={people.map((p) => ({ value: p.id, label: p.name, description: p.role, icon: <Avatar size="sm" alt={p.name} /> }))}
  value={assignees}
  onChange={setAssignees}
/>`
  ),
  render: () => {
    const [value, setValue] = useState<SelectValue[]>(["dk", "ec"]);
    return (
      <div className="max-w-md">
        <Field label="Atananlar" hint={`${value.length} kişi atandı`}>
          <Select
            id="assignees"
            mode="multiple"
            showSearch
            allowClear
            maxTagCount={3}
            placeholder="Kişi ekleyin"
            options={peopleOptions}
            value={value}
            onChange={(v) => setValue(v)}
          />
        </Field>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Gruplu + ikonlu ─────────────────────────── */

const paymentOptions: Array<SelectOption | SelectOptionGroup> = [
  {
    label: "Kart",
    options: [
      { value: "credit", label: "Kredi kartı", description: "Taksit seçenekli", icon: <CreditCardIcon aria-hidden /> },
      { value: "debit", label: "Banka kartı", icon: <CreditCardIcon aria-hidden /> },
    ],
  },
  {
    label: "Diğer",
    options: [
      { value: "transfer", label: "Havale / EFT", description: "1 iş günü içinde onaylanır", icon: <LandmarkIcon aria-hidden /> },
      { value: "wallet", label: "Dijital cüzdan", icon: <WalletIcon aria-hidden /> },
      { value: "cod", label: "Kapıda ödeme", description: "Bu teslimat adresinde kullanılamıyor", icon: <BanknoteIcon aria-hidden />, disabled: true },
    ],
  },
];

export const PaymentMethod: Story = {
  name: "Ödeme Yöntemi (Gruplu)",
  ...storyDoc(
    "Seçenekler `{ label, options }` ile gruplanır — ekran okuyucu \"Kart grubu, Kredi kartı\" diye okur. Kullanılamayan " +
      "seçenek `disabled` + nedeni `description`da; klavye gezinmesi onu atlar.",
    `
<Select
  defaultValue="credit"
  options={[
    { label: "Kart", options: [{ value: "credit", label: "Kredi kartı", description: "Taksit seçenekli", icon: <CreditCardIcon /> }, …] },
    { label: "Diğer", options: [{ value: "cod", label: "Kapıda ödeme", disabled: true, … }, …] },
  ]}
/>`
  ),
  render: () => (
    <div className="max-w-sm">
      <Field label="Ödeme yöntemi">
        <Select id="payment" defaultValue="credit" options={paymentOptions} />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── 4. Durumlar ─────────────────────────── */

const smallOptions: SelectOption[] = [
  { value: "draft", label: "Taslak" },
  { value: "review", label: "İncelemede" },
  { value: "published", label: "Yayında" },
];

export const Appearance: Story = {
  name: "Boyut ve Görünüm",
  ...storyDoc(
    "Boyut, varyant ve şekil Input'la aynı ölçekten — bir formda Input ile yan yana aynı hizada durur.",
    `<Select size="sm" variant="soft" options={…} />`
  ),
  render: () => (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select key={size} size={size} aria-label={`Durum (${size})`} defaultValue="review" options={smallOptions} />
      ))}
      {(["outline", "soft", "ghost", "underlined"] as const).map((variant) => (
        <Select key={variant} variant={variant} aria-label={`Durum (${variant})`} placeholder={variant} options={smallOptions} />
      ))}
      <Select shape="pill" aria-label="Durum (pill)" defaultValue="published" options={smallOptions} />
    </div>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc(
    "Doğrulama hatası: `Field`'a `error` verin — Select kırmızı kenarlık + `aria-invalid` alır, hata metni ona bağlanır " +
      "(Field dışında: `color=\"error\"` + kendi `aria-describedby`niz). Devre dışı.",
    `
<Field label="Kategori" error="Bir kategori seçin">
  <Select options={…} />
</Field>
<Select disabled … />`
  ),
  render: () => (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Kategori" error="Bir kategori seçin">
        <Select options={smallOptions} />
      </Field>
      <Field label="Durum" hint="Yayındaki içerik değiştirilemez">
        <Select disabled defaultValue="published" options={smallOptions} />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Select options={cities} defaultValue="istanbul" skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <Select aria-label="Şehir" options={smallOptions} defaultValue={smallOptions[0]!.value} className="max-w-xs" skeleton={skeleton} />}</SkeletonDemo>,
};
