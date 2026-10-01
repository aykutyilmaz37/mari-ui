/**
 * Faz 16.4: gerçek senaryolar — ürün kategorisi (yalnız alt kategoriler
 * seçilebilir, arama), teslimat bölgeleri (onay kutuları + stratejiler),
 * ekip ataması (multiple + kılavuz çizgileri), boyutlar/durumlar. "Show code"
 * her story'de `storyDoc`'un 2. argümanı. Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Field } from "../field";
import { Segmented } from "../segmented";
import type { TreeNode } from "../tree/types";
import { TreeSelect } from "./TreeSelect";
import type { TreeSelectCheckedStrategy } from "./types";

const meta: Meta<typeof TreeSelect> = {
  title: "Veri Girişi/TreeSelect",
  component: TreeSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "26rem" },
      description: {
        component: componentDoc({
          summary:
            "Hiyerarşik veriden seçim yaptıran açılır kontrol: Select'in tetikleyicisi (aynı boyut, varyant, etiketler, arama, " +
            "temizle) + panelde ağaç. Tekli, `mode=\"multiple\"` (bağımsız düğümler) ve `mode=\"checkable\"` (onay kutuları, " +
            "üst ↔ alt yayılım; değere ne yazılacağını `showCheckedStrategy` belirler). Arama Türkçe harf duyarsız; eşleşmenin ataları açılır.",
          whenToUse: [
            "Seçenekler doğal bir hiyerarşi taşıyorsa: kategori ağacı, il/ilçe, organizasyon şeması, klasörler.",
            "Form içinde az yer kaplaması gereken ağaç seçimi (Tree her zaman açık yer kaplar).",
          ],
          whenNotToUse: [
            "Düz liste — Select (gruplar yeterliyse `SelectOptionGroup`).",
            "Seçilenlerin bütün olarak, yan yana görülmesi gerekiyorsa — Transfer ya da sayfada açık bir Tree.",
          ],
          a11y:
            "APG combobox + `aria-haspopup=\"tree\"`. Odak tetikleyicide kalır, aktif düğüm `aria-activedescendant`. ↑/↓ gezinir, " +
            "→ açar/ilk çocuğa iner, ← kapatır/ebeveyne çıkar, Enter seçer (seçilemeyen düğümde dalı açar), Escape kapatır. " +
            "Düğümlerde `aria-level`/`aria-expanded`/`aria-selected` ya da `aria-checked` (kısmi: `mixed`). Field içinde ad etiketten gelir.",
        }),
      },
    },
  },
  argTypes: {
    treeData: { control: false },
    value: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onSearch: { table: { category: "Olaylar" } },
    onTreeExpand: { table: { category: "Olaylar" } },
    onOpenChange: { table: { category: "Olaylar" } },
    titleRender: { control: false },
    mode: { control: "inline-radio", options: [undefined, "multiple", "checkable"] },
    showSearch: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    allowClear: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    treeDefaultExpandAll: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    treeLine: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    size: baseSizeArgType,
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof TreeSelect>;

/* ─────────────────────────── Veri ─────────────────────────── */

const group = (key: string, title: string, children: TreeNode[]): TreeNode => ({ key, title, selectable: false, children });
const leaves = (prefix: string, titles: string[]): TreeNode[] => titles.map((t) => ({ key: `${prefix}/${t}`, title: t }));

const CATEGORIES: TreeNode[] = [
  group("elektronik", "Elektronik", [
    group("elektronik/bilgisayar", "Bilgisayar", leaves("elektronik/bilgisayar", ["Dizüstü", "Masaüstü", "Tablet", "Monitör"])),
    group("elektronik/telefon", "Telefon", leaves("elektronik/telefon", ["Akıllı telefon", "Kılıf", "Şarj aleti"])),
  ]),
  group("ev", "Ev & Yaşam", [
    group("ev/mutfak", "Mutfak", leaves("ev/mutfak", ["Tencere", "Çatal-bıçak", "Küçük ev aletleri"])),
    group("ev/aydinlatma", "Aydınlatma", leaves("ev/aydinlatma", ["Avize", "Lambader", "Ampul"])),
  ]),
  group("giyim", "Giyim", [
    group("giyim/kadin", "Kadın", leaves("giyim/kadin", ["Elbise", "Gömlek", "Ayakkabı"])),
    group("giyim/erkek", "Erkek", leaves("giyim/erkek", ["Tişört", "Pantolon", "Ayakkabı"])),
  ]),
];

const REGIONS: TreeNode[] = [
  {
    key: "marmara",
    title: "Marmara",
    children: [
      { key: "istanbul", title: "İstanbul", children: leaves("istanbul", ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli"]) },
      { key: "bursa", title: "Bursa", children: leaves("bursa", ["Nilüfer", "Osmangazi"]) },
      { key: "edirne", title: "Edirne" },
    ],
  },
  {
    key: "ic-anadolu",
    title: "İç Anadolu",
    children: [
      { key: "ankara", title: "Ankara", children: leaves("ankara", ["Çankaya", "Keçiören", "Yenimahalle"]) },
      { key: "eskisehir", title: "Eskişehir" },
    ],
  },
  { key: "ege", title: "Ege", children: [{ key: "izmir", title: "İzmir" }, { key: "mugla", title: "Muğla", disableCheckbox: true }] },
];

const TEAMS: TreeNode[] = [
  {
    key: "urun",
    title: "Ürün",
    children: [
      { key: "urun/tasarim", title: "Tasarım", children: [{ key: "urun/tasarim/ux", title: "UX araştırma" }, { key: "urun/tasarim/ui", title: "Arayüz" }] },
      { key: "urun/pm", title: "Ürün yönetimi" },
    ],
  },
  {
    key: "muhendislik",
    title: "Mühendislik",
    children: [
      { key: "muh/web", title: "Web" },
      { key: "muh/mobil", title: "Mobil" },
      { key: "muh/altyapi", title: "Altyapı", children: [{ key: "muh/altyapi/sre", title: "SRE" }, { key: "muh/altyapi/guvenlik", title: "Güvenlik" }] },
    ],
  },
  { key: "destek", title: "Müşteri destek" },
];

export const Playground: Story = {
  args: { "aria-label": "Bölge", treeData: REGIONS, showSearch: true, allowClear: true, placeholder: "Bölge seçin", className: "max-w-xs" },
};

/* ─────────────────────────── 1. Ürün kategorisi ─────────────────────────── */

export const ProductCategory: Story = {
  name: "Ürün Kategorisi",
  ...storyDoc(
    "Yalnız en alt kategoriler seçilebilir (`selectable: false` üst düğümlerde) — üst düğüme Enter/tıklama dalı açar. " +
      "Arama \"ayakkabi\" yazınca iki dalı da açıp eşleşmeyi vurgular.",
    `<Field label="Kategori" hint="Ürünün listeleneceği en alt kategori.">
  <TreeSelect treeData={categories} value={category} onChange={setCategory} showSearch allowClear placeholder="Kategori seçin" />
</Field>`
  ),
  render: () => {
    const [category, setCategory] = useState<string | null>("elektronik/bilgisayar/Dizüstü");
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <Field label="Kategori" hint="Ürünün listeleneceği en alt kategori.">
          <TreeSelect treeData={CATEGORIES} value={category} onChange={setCategory} showSearch allowClear placeholder="Kategori seçin" />
        </Field>
        <p className="text-sm text-mari-muted">Yol: {category ? category.split("/").join(" › ") : "—"}</p>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Teslimat bölgeleri ─────────────────────────── */

export const DeliveryRegions: Story = {
  name: "Teslimat Bölgeleri (Onay Kutulu)",
  ...storyDoc(
    "`mode=\"checkable\"`: üst işaretlenince altlar da; kısmi dal `mixed`. `showCheckedStrategy` değere ne yazılacağını " +
      "belirler — `parent` tam bir ili tek anahtar olarak yazar (\"İstanbul\" yerine 4 ilçe değil). Muğla'nın onay kutusu kapalı.",
    `<TreeSelect mode="checkable" treeData={regions} value={keys} onChange={setKeys} showCheckedStrategy="parent" maxTagCount={3} showSearch />`
  ),
  render: () => {
    const [keys, setKeys] = useState<string[]>(["istanbul", "ankara/Çankaya"]);
    const [strategy, setStrategy] = useState<TreeSelectCheckedStrategy>("parent");
    return (
      <div className="flex max-w-md flex-col gap-3">
        <Segmented size="sm" aria-label="Değere yazılacaklar" options={[{ value: "parent", label: "parent" }, { value: "child", label: "child" }, { value: "all", label: "all" }]} value={strategy} onChange={(v) => setStrategy(v as TreeSelectCheckedStrategy)} />
        <Field label="Teslimat bölgeleri">
          <TreeSelect mode="checkable" treeData={REGIONS} value={keys} onChange={setKeys} showCheckedStrategy={strategy} maxTagCount={3} showSearch allowClear placeholder="Bölge ekleyin" />
        </Field>
        <code className="text-xs break-all text-mari-muted">value = {JSON.stringify(keys)}</code>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Ekip ataması ─────────────────────────── */

export const TeamAssignment: Story = {
  name: "Ekip Ataması (Çoklu)",
  ...storyDoc(
    "`mode=\"multiple\"`: her düğüm bağımsız seçilir (üst ekip seçmek alt ekipleri seçmez); panel seçimden sonra açık kalır. " +
      "`treeLine` girinti kılavuzları, `treeDefaultExpandAll` ilk açılışta tümü açık.",
    `<TreeSelect mode="multiple" treeData={teams} defaultValue={["muh/web"]} treeLine treeDefaultExpandAll />`
  ),
  render: () => (
    <div className="max-w-sm">
      <Field label="Bildirim alacak ekipler">
        <TreeSelect mode="multiple" treeData={TEAMS} defaultValue={["muh/web", "destek"]} treeLine treeDefaultExpandAll placeholder="Ekip seçin" />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── 4. Boyutlar ve durumlar ─────────────────────────── */

export const SizesAndStates: Story = {
  name: "Boyutlar ve Durumlar",
  ...storyDoc(
    "Yükseklik Input/Select ile aynı (sm 24 / md 32 / lg 40px). Devre dışı, hata rengi ve iskelet.",
    `<TreeSelect size="sm" … />
<TreeSelect color="error" … />
<TreeSelect disabled … />
<TreeSelect skeleton … />`
  ),
  render: () => (
    <div className="flex max-w-xs flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <TreeSelect key={size} size={size} aria-label={`Bölge (${size})`} treeData={REGIONS} defaultValue="izmir" />
      ))}
      <TreeSelect aria-label="Hatalı" color="error" treeData={REGIONS} placeholder="Bölge seçin" />
      <TreeSelect aria-label="Devre dışı" disabled treeData={REGIONS} defaultValue="eskisehir" />
      <TreeSelect treeData={REGIONS} skeleton />
    </div>
  ),
};
