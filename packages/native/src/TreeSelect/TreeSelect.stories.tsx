import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { TreeSelect } from "./TreeSelect";
import type { TreeNode } from "../Tree/types";
import { Field } from "../Field";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNarrow, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof TreeSelect> = {
  title: "Native/Veri Girişi/TreeSelect",
  component: TreeSelect,
  tags: ["autodocs"],
  decorators: [withNarrow, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Ağaçtan değer seçme alanı. Kapalıyken Input kutusu; dokununca BottomSheet'te aşağı inen menü: yol gösterimi (Tümü › Elektronik › Bilgisayar), çocuklu satır içeri iner, dalın kendisi seviyenin başındaki \"(tümü)\" satırıyla seçilir. Arama düz sonuç listesine geçer (her sonucun altında yolu). Tekli, çoklu (`multiple`) ve onay kutulu (`checkable`, üst ↔ alt yayılım, `showCheckedStrategy`) kipler, tembel yükleme (`loadData`).",
    whenToUse: ["Kategori, bölge, departman gibi hiyerarşik bir listeden seçim.", "Derin ve uzun ağaçlar — her seviye ayrı ekran olduğu için telefonda sığar."],
    whenNotToUse: ["Düz liste — Select.", "Ağacı yalnız göstermek / yerinde işaretlemek — Tree."],
    vsWeb: "API web TreeSelect ile aynı; panel açılır liste yerine BottomSheet ve girintili ağaç yerine aşağı inen menü (telefonda derin ağaç sağa sıkışmasın). Bu yüzden `treeDefaultExpandAll`, `treeExpandedKeys`, `treeLine`, `placement`, `listHeight` yok; `rootLabel` (yol gösteriminin kökü) var. Panel seçili ilk değerin seviyesinde açılır. Field içinde etiket / hata / iskelet Field'dan gelir.",
  }) } } },
  argTypes: {
    showSearch: { control: "boolean" },
    allowClear: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    skeleton: { control: "boolean" },
  },
  args: { showSearch: true, allowClear: true, disabled: false, size: "md", skeleton: false, placeholder: "Kategori seçin" },
};
export default meta;
type Story = StoryObj<typeof TreeSelect>;

const CATEGORIES: TreeNode[] = [
  { key: "el", title: "Elektronik", children: [
    { key: "el.pc", title: "Bilgisayar", children: [{ key: "el.pc.laptop", title: "Laptop" }, { key: "el.pc.desk", title: "Masaüstü" }, { key: "el.pc.mon", title: "Monitör" }, { key: "el.pc.parts", title: "Bileşenler", children: [{ key: "el.pc.parts.gpu", title: "Ekran Kartı" }, { key: "el.pc.parts.ram", title: "Bellek" }] }] },
    { key: "el.phone", title: "Telefon", children: [{ key: "el.phone.ios", title: "iPhone" }, { key: "el.phone.and", title: "Android" }] },
    { key: "el.audio", title: "Kulaklık ve Ses" },
  ] },
  { key: "home", title: "Ev ve Yaşam", children: [{ key: "home.light", title: "Aydınlatma" }, { key: "home.kitchen", title: "Mutfak" }, { key: "home.textile", title: "Ev Tekstili" }] },
  { key: "book", title: "Kitap", children: [{ key: "book.novel", title: "Roman" }, { key: "book.hist", title: "Tarih" }, { key: "book.child", title: "Çocuk" }] },
  { key: "sport", title: "Spor ve Outdoor", disabled: true },
];

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => <TreeSelect {...(args as object)} treeData={CATEGORIES} accessibilityLabel="Kategori" />,
};

function ProductCategoryDemo() {
  const [value, setValue] = useState<string | null>("el.pc.laptop");
  return (
    <View style={{ gap: 8 }}>
      <Field label="Kategori" required hint="Ürünün listeleneceği en alt kategori.">
        <TreeSelect treeData={CATEGORIES} value={value} onChange={(v) => setValue(v)} showSearch allowClear placeholder="Kategori seçin" />
      </Field>
      <Text muted>{`Değer: ${value ?? "—"}`}</Text>
    </View>
  );
}

export const ProductCategory: Story = {
  name: "Ürün Kategorisi",
  ...storyDoc(
    "Tekli seçim: yaprağa dokununca seçilir ve panel kapanır. Panel seçili değerin seviyesinde açılır (Bilgisayar); yol gösterimindeki önceki adımlara dokunarak geri dönülür. Bir dalın kendisini seçmek için seviyenin başındaki \"(tümü)\" satırı. Aramada her sonucun altında yolu yazar.",
    `<Field label="Kategori" required>
  <TreeSelect treeData={categories} value={value} onChange={setValue} showSearch allowClear />
</Field>`
  ),
  render: () => <ProductCategoryDemo />,
};

const REGIONS: TreeNode[] = [
  { key: "marmara", title: "Marmara", children: [
    { key: "ist", title: "İstanbul", children: [{ key: "ist.kad", title: "Kadıköy" }, { key: "ist.bes", title: "Beşiktaş" }, { key: "ist.usk", title: "Üsküdar" }] },
    { key: "bur", title: "Bursa" },
    { key: "koc", title: "Kocaeli" },
  ] },
  { key: "ege", title: "Ege", children: [{ key: "izm", title: "İzmir" }, { key: "ayd", title: "Aydın" }, { key: "mug", title: "Muğla" }] },
  { key: "ic", title: "İç Anadolu", children: [{ key: "ank", title: "Ankara" }, { key: "kon", title: "Konya" }] },
];

function RegionsDemo() {
  const [value, setValue] = useState<string[]>(["ist.kad", "ist.bes", "ege"]);
  return (
    <View style={{ gap: 8 }}>
      <Field label="Teslimat bölgeleri">
        <TreeSelect mode="checkable" showCheckedStrategy="parent" treeData={REGIONS} value={value} onChange={(v) => setValue(v)} showSearch maxTagCount={3} placeholder="Bölge seçin" />
      </Field>
      <Text muted>{`Değer (parent): ${value.join(", ") || "—"}`}</Text>
    </View>
  );
}

export const DeliveryRegions: Story = {
  name: "Teslimat Bölgeleri (Onay Kutulu)",
  ...storyDoc(
    "`mode=\"checkable\"`: satırdaki kutu dalı içeri inmeden işaretler; üst ↔ alt yayılım ve kısmi (−) durum. `showCheckedStrategy=\"parent\"`: tamamı işaretli bir dal tek değer (Ege). `maxTagCount`: fazlası \"+N\". Panel \"Tamam\" ile kapanır.",
    `<TreeSelect mode="checkable" showCheckedStrategy="parent" treeData={regions} value={value} onChange={setValue} maxTagCount={3} />`
  ),
  render: () => <RegionsDemo />,
};

const TEAMS: TreeNode[] = [
  { key: "eng", title: "Mühendislik", selectable: false, children: [{ key: "eng.web", title: "Web" }, { key: "eng.mobile", title: "Mobil" }, { key: "eng.platform", title: "Platform" }] },
  { key: "design", title: "Tasarım", selectable: false, children: [{ key: "design.product", title: "Ürün Tasarımı" }, { key: "design.brand", title: "Marka" }] },
  { key: "ops", title: "Operasyon", selectable: false, children: [{ key: "ops.support", title: "Destek" }, { key: "ops.finance", title: "Finans" }] },
];

export const TeamAssignment: Story = {
  name: "Ekip Ataması (Çoklu)",
  ...storyDoc("`mode=\"multiple\"`: düğümler bağımsız seçilir (yayılım yok). Gruplar `selectable: false` — \"(tümü)\" satırı çıkmaz, yalnız ekipler seçilir.", `<TreeSelect mode="multiple" treeData={teams} defaultValue={["eng.mobile"]} />`),
  render: () => (
    <Field label="Ekipler">
      <TreeSelect mode="multiple" treeData={TEAMS} defaultValue={["eng.mobile", "design.product"]} placeholder="Ekip seçin" />
    </Field>
  ),
};

const DISTRICTS: Record<string, string[]> = { ist: ["Kadıköy", "Beşiktaş", "Üsküdar"], ank: ["Çankaya", "Keçiören"], izm: ["Karşıyaka", "Bornova"] };
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const districtsOf = (city: string): TreeNode[] => (DISTRICTS[city] ?? []).map((d) => ({ key: `${city}.${d}`, title: d, isLeaf: true }));
const attachDistricts = (nodes: TreeNode[], city: string) => nodes.map((n) => (n.key === city ? { ...n, children: districtsOf(city) } : n));

function LazyDemo() {
  const [data, setData] = useState<TreeNode[]>([
    { key: "ist", title: "İstanbul" },
    { key: "ank", title: "Ankara" },
    { key: "izm", title: "İzmir" },
  ]);
  // Sunucu isteği yerine 800 ms bekleme.
  const loadData = async (node: TreeNode) => {
    await wait(800);
    setData((prev) => attachDistricts(prev, node.key));
  };
  return (
    <Field label="İlçe">
      <TreeSelect treeData={data} loadData={loadData} placeholder="İl / ilçe seçin" />
    </Field>
  );
}

export const LazyLoading: Story = {
  name: "Tembel Yükleme",
  ...storyDoc("`loadData`: çocukları yüklenmemiş ile dokununca çağrılır; çözülene kadar satırda gösterge, sonra içeri iner. `treeData`yı siz güncellersiniz.", `<TreeSelect treeData={data} loadData={loadDistricts} />`),
  render: () => <LazyDemo />,
};

export const SizesAndStates: Story = {
  name: "Boyutlar ve Durumlar",
  ...storyDoc("Alan Input ölçeğinde (sm / md / lg); pasif ve hata durumu.", `<TreeSelect size="sm" />  <TreeSelect disabled />  <TreeSelect color="error" />`),
  render: () => (
    <View style={{ gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <TreeSelect key={size} size={size} treeData={CATEGORIES} defaultValue="book.novel" accessibilityLabel={`Kategori ${size}`} />
      ))}
      <TreeSelect disabled treeData={CATEGORIES} defaultValue="home.light" accessibilityLabel="Pasif" />
      <Field label="Kategori" error="Kategori seçin.">
        <TreeSelect treeData={CATEGORIES} placeholder="Kategori seçin" />
      </Field>
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Alan kendi kutusunda; Field içindeyse etiket ve ipucu da.", `<Field label="Kategori" skeleton={isLoading}><TreeSelect treeData={data} /></Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Kategori" hint="Ürünün listeleneceği kategori." skeleton={skeleton}>
          <TreeSelect treeData={CATEGORIES} defaultValue="el.pc.laptop" />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
