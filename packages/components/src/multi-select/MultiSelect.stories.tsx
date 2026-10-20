/**
 * Çoklu seçim kendi subpath'inde (`@mari-ui/components/multi-select`, Faz 4c):
 * etiket (`Tag`) kodu yalnız MultiSelect kullananlara gelir. "Show code" her
 * story'de `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Avatar } from "../avatar";
import { Field } from "../field";
import { MultiSelect } from "./index";
import type { MultiSelectProps, SelectOption, SelectValue } from "./index";

const meta: Meta<typeof MultiSelect> = {
  title: "Veri Girişi/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Liste body'ye portal edilir ve tetikleyicinin altında açılır — kanvas kısa kalırsa sayfanın dibine taşar.
      story: { height: "380px" },
      description: {
        component: componentDoc({
          summary:
            "Sabit bir listeden birden çok değer seçtiren alan: seçilenler etiket olur, liste seçimden sonra açık kalır. " +
            "Görünüm, arama, gruplar ve klavye `Select` ile aynı; yalnız değer bir dizi. Etiket kodu yalnız bu bileşenle gelir: " +
            "`import { MultiSelect } from \"@mari-ui/components/multi-select\"`.",
          whenToUse: [
            "Birden çok değer — etiketler, atanan kişiler, filtreler.",
            "Uzun listeler — `showSearch` ile; `maxTagCount` kutuyu tek satırda tutar.",
          ],
          whenNotToUse: [
            "Tek değer — `Select`.",
            "Az (2–5) seçenek ve hepsi görünür kalmalı — `Checkbox` grubu.",
            "Hiyerarşik seçenekler — `TreeSelect`.",
          ],
          a11y:
            "APG combobox deseni, `Select` ile aynı; liste `aria-multiselectable`. Her etiketin kaldırma düğmesi adını " +
            "etiketten alır (\"Ankara seçimini kaldır\"). Arama kutusu boşken Backspace son etiketi siler.",
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
    maxTagCount: { control: "number", description: "En fazla bu kadar etiket; kalanı \"+N\". Varsayılan: hepsi (satırlara sarar)." },
    placeholder: { control: "text" },
    showSearch: { control: "boolean", description: "Yazarak süz. Varsayılan: `false`." },
    allowClear: { control: "boolean", description: "Tümünü temizleyen düğme. Varsayılan: `false`." },
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
type Story = StoryObj<MultiSelectProps>;

const tagOptions: SelectOption[] = [
  { value: "tasarim", label: "Tasarım" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "mobil", label: "Mobil" },
  { value: "veri", label: "Veri" },
];

export const Playground: Story = {
  ...storyDoc(
    "Tüm props'ları canlı deneyin.",
    (args) => `const options = [
  { value: "tasarim", label: "Tasarım" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "mobil", label: "Mobil" },
  { value: "veri", label: "Veri" },
];

<MultiSelect options={options} defaultValue={["frontend", "mobil"]} ${jsxProps(args, { skip: ["options", "defaultValue"] })} />`
  ),
  args: {
    "aria-label": "Etiketler",
    options: tagOptions,
    defaultValue: ["frontend", "mobil"],
    placeholder: "Etiket seçin",
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
      <MultiSelect {...args} />
    </div>
  ),
};

/* ─────────────────────────── Kişi atama ─────────────────────────── */

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
  name: "Göreve Kişi Atama",
  ...storyDoc(
    "`showSearch`: seçimden sonra liste açık kalır, seçilenler etiket olur (✕ ya da Backspace ile kaldırılır). " +
      "Seçenekte avatar (`icon`) ve rol (`description`). `maxTagCount={3}` fazlasını \"+N\" yapar.",
    `
const people = [
  { value: "dk", name: "Deniz Kaya", role: "Ürün Tasarımcısı" },
  { value: "ec", name: "Elif Can", role: "Frontend Geliştirici" },
  { value: "mo", name: "Mert Özdemir", role: "Backend Geliştirici" },
  { value: "sa", name: "Selin Aydın", role: "Ürün Yöneticisi" },
  { value: "bt", name: "Burak Tekin", role: "QA Mühendisi" },
  { value: "zy", name: "Zeynep Yıldız", role: "Veri Analisti" },
];

const [assignees, setAssignees] = useState(["dk", "ec"]);

<Field label="Atananlar" hint={\`\${assignees.length} kişi atandı\`}>
  <MultiSelect
    showSearch
    allowClear
    maxTagCount={3}
    placeholder="Kişi ekleyin"
    options={people.map((p) => ({ value: p.value, label: p.name, description: p.role, icon: <Avatar size="sm" alt={p.name} /> }))}
    value={assignees}
    onChange={setAssignees}
  />
</Field>`
  ),
  render: () => {
    const [value, setValue] = useState<SelectValue[]>(["dk", "ec"]);
    return (
      <div className="max-w-md">
        <Field label="Atananlar" hint={`${value.length} kişi atandı`}>
          <MultiSelect
            id="assignees"
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

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    SKELETON_STORY_DOC,
    `<MultiSelect aria-label="Etiketler" options={[{ value: "frontend", label: "Frontend" }, { value: "mobil", label: "Mobil" }]} defaultValue={["frontend"]} skeleton />`
  ),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => <MultiSelect aria-label="Etiketler" options={tagOptions} defaultValue={["frontend"]} className="max-w-xs" skeleton={skeleton} />}
    </SkeletonDemo>
  ),
};
