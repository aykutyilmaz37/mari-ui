import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { File, FileCode, Folder, Image as ImageIcon } from "lucide-react-native";
import { Tree, type TreeNode, type TreeProps } from "./Tree";
import { SearchInput } from "../Input";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Tree> = {
  title: "Native/Veri Gösterimi/Tree",
  component: Tree,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Hiyerarşik veri görünümü: girintili satırlar, aç/kapa, seçim (tek / çok), üst ↔ alt yayılımlı onay kutuları (kısmi durum), tembel yükleme (`loadData`), arama vurgusu (`searchValue`), kılavuz çizgileri (`showLine`).",
    whenToUse: ["Klasör / dosya, kategori, organizasyon gibi iç içe yapıyı göstermek.", "Rol izinleri gibi hiyerarşik çoklu işaretleme."],
    whenNotToUse: ["Ağaçtan bir değer seçtirmek (form alanı) — TreeSelect.", "Düz liste — List.", "Uygulama gezinmesi — Sidebar."],
    vsWeb: "API web Tree ile aynı (`className` → `style`, `aria-label` → `accessibilityLabel`). Ok tuşu yok → klavye gezinmesi yok; `expandAction` yalnız `click`. Aç/kapa oku ayrı dokunma hedefi (32pt), satırın geri kalanı seçer / işaretler. Çok büyük ağaçlarda sanallaştırma yok — binlerce düğüm için TreeSelect'in aşağı inen menüsünü kullanın. Ölçüler `nativeConfig.tree`.",
  }) } } },
  argTypes: {
    checkable: { control: "boolean" },
    multiple: { control: "boolean" },
    showLine: { control: "boolean" },
    defaultExpandAll: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { checkable: false, multiple: false, showLine: false, defaultExpandAll: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Tree>;

const iconFor = (name: string) => {
  if (/\.(tsx?|js)$/.test(name)) return FileCode;
  if (/\.(svg|png)$/.test(name)) return ImageIcon;
  return File;
};

function FileIcon({ name }: Readonly<{ name: string }>) {
  const theme = useTheme();
  const Icon = iconFor(name);
  return <Icon size={18} color={theme.color.canvas.muted} />;
}

function FolderIcon() {
  const theme = useTheme();
  return <Folder size={18} color={theme.color.primary.text} />;
}

const file = (key: string, title: string): TreeNode => ({ key, title, icon: <FileIcon name={title} />, isLeaf: true });
const folder = (key: string, title: string, children: TreeNode[]): TreeNode => ({ key, title, icon: <FolderIcon />, children });

const FILES: TreeNode[] = [
  folder("apps", "apps", [
    folder("apps/docs", "docs", [file("apps/docs/main.ts", "main.ts"), file("apps/docs/preview.tsx", "preview.tsx")]),
    folder("apps/native-studio", "native-studio", [file("apps/native-studio/App.tsx", "App.tsx")]),
  ]),
  folder("packages", "packages", [
    folder("packages/native", "native", [
      folder("pn/src", "src", [file("pn/src/tree.tsx", "Tree.tsx"), file("pn/src/utils.ts", "treeUtils.ts"), file("pn/src/logo.svg", "logo.svg")]),
    ]),
    folder("packages/tokens", "tokens", [file("pt/index.ts", "index.ts")]),
  ]),
  file("readme", "README.md"),
];

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args: Omit<TreeProps, "treeData">) => <Tree {...args} treeData={FILES} accessibilityLabel="Dosyalar" />,
};

function FileExplorerDemo() {
  const [selected, setSelected] = useState<string[]>(["pn/src/tree.tsx"]);
  return (
    <View style={{ gap: 12 }}>
      <Tree treeData={FILES} showLine expandAction="click" defaultExpandedKeys={["packages", "packages/native", "pn/src"]} selectedKeys={selected} onSelect={setSelected} accessibilityLabel="Proje dosyaları" />
      <Text muted>{`Seçili: ${selected[0] ?? "—"}`}</Text>
    </View>
  );
}

export const FileExplorer: Story = {
  name: "Dosya Gezgini",
  ...storyDoc(
    "`expandAction=\"click\"`: klasöre dokunmak hem seçer hem açar (dosya gezgini). `showLine`: girinti kılavuzları. Gerçek yapraklar `isLeaf: true`.",
    `<Tree
  treeData={files}
  showLine
  expandAction="click"
  selectedKeys={selected}
  onSelect={setSelected}
  accessibilityLabel="Proje dosyaları"
/>`
  ),
  render: () => <FileExplorerDemo />,
};

const PERMISSIONS: TreeNode[] = [
  {
    key: "orders",
    title: "Siparişler",
    children: [
      { key: "orders.view", title: "Görüntüle" },
      { key: "orders.edit", title: "Düzenle" },
      { key: "orders.refund", title: "İade et" },
      { key: "orders.delete", title: "Sil", disabled: true },
    ],
  },
  {
    key: "catalog",
    title: "Katalog",
    children: [
      { key: "catalog.products", title: "Ürünler", children: [{ key: "catalog.products.view", title: "Görüntüle" }, { key: "catalog.products.edit", title: "Düzenle" }] },
      { key: "catalog.prices", title: "Fiyatlar" },
    ],
  },
  { key: "reports", title: "Raporlar" },
];

function PermissionsDemo() {
  const [checked, setChecked] = useState<string[]>(["orders.view", "catalog.products"]);
  return (
    <View style={{ gap: 12 }}>
      <Tree treeData={PERMISSIONS} checkable selectable={false} defaultExpandAll checkedKeys={checked} onCheck={setChecked} accessibilityLabel="Rol izinleri" />
      <Text muted>{`${checked.length} izin işaretli`}</Text>
    </View>
  );
}

export const Permissions: Story = {
  name: "Rol İzinleri (checkable)",
  ...storyDoc(
    "Üst ↔ alt yayılım: üst düğüm altlarını işaretler, bazı altlar işaretliyse üst kısmi (−). Devre dışı düğüm (Sil) yayılıma katılmaz. `selectable={false}`: satırın tamamına dokunmak işaretler.",
    `<Tree treeData={permissions} checkable selectable={false} checkedKeys={checked} onCheck={setChecked} />`
  ),
  render: () => <PermissionsDemo />,
};

const CATEGORIES: TreeNode[] = [
  { key: "el", title: "Elektronik", children: [
    { key: "el.pc", title: "Bilgisayar", children: [{ key: "el.pc.laptop", title: "Laptop" }, { key: "el.pc.desk", title: "Masaüstü" }, { key: "el.pc.mon", title: "Monitör" }] },
    { key: "el.phone", title: "Telefon", children: [{ key: "el.phone.ios", title: "iPhone" }, { key: "el.phone.and", title: "Android" }] },
  ] },
  { key: "home", title: "Ev ve Yaşam", children: [{ key: "home.light", title: "Aydınlatma" }, { key: "home.kitchen", title: "Mutfak" }] },
  { key: "book", title: "Kitap", children: [{ key: "book.novel", title: "Roman" }, { key: "book.hist", title: "Tarih" }] },
];

function SearchDemo() {
  const [query, setQuery] = useState("AYDIN");
  return (
    <View style={{ gap: 12 }}>
      <SearchInput value={query} onChangeText={setQuery} allowClear placeholder="Kategori ara" accessibilityLabel="Kategori ara" />
      <Tree treeData={CATEGORIES} searchValue={query} accessibilityLabel="Kategoriler" />
    </View>
  );
}

export const SearchCategories: Story = {
  name: "Kategori Arama (searchValue)",
  ...storyDoc(
    "`searchValue`: eşleşen düğümler ve ataları gösterilir, atalar kendiliğinden açılır, eşleşme vurgulanır. Türkçe harf duyarsız: \"AYDIN\" yazınca \"Aydınlatma\" bulunur (I / ı / İ / i aynı sayılır).",
    `<SearchInput value={query} onChangeText={setQuery} />
<Tree treeData={categories} searchValue={query} />`
  ),
  render: () => <SearchDemo />,
};

const DISTRICTS: Record<string, string[]> = {
  ist: ["Kadıköy", "Beşiktaş", "Üsküdar"],
  ank: ["Çankaya", "Keçiören"],
  izm: ["Karşıyaka", "Bornova"],
};

const districtsOf = (city: string): TreeNode[] => (DISTRICTS[city] ?? []).map((d) => ({ key: `${city}.${d}`, title: d, isLeaf: true }));

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
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
  return <Tree treeData={data} loadData={loadData} accessibilityLabel="İller" />;
}

export const LazyLoad: Story = {
  name: "İl / İlçe (tembel yükleme)",
  ...storyDoc(
    "`loadData`: çocukları olmayan (ve `isLeaf` olmayan) düğüm açılınca çağrılır; çözülene kadar okta dönen gösterge. `treeData`yı siz güncellersiniz. Reddedilirse dal kapalı kalır.",
    `const loadData = async (node) => {
  const districts = await api.districts(node.key);
  setData((prev) => attachChildren(prev, node.key, districts));
};

<Tree treeData={data} loadData={loadData} />`
  ),
  render: () => <LazyDemo />,
};

export const MultipleSelect: Story = {
  name: "Çoklu Seçim (multiple)",
  ...storyDoc("`multiple`: dokunma seçimi aç/kapar, birden çok düğüm seçili kalır.", `<Tree treeData={categories} multiple defaultSelectedKeys={["el.pc.laptop", "book"]} />`),
  render: () => <Tree treeData={CATEGORIES} multiple defaultExpandAll defaultSelectedKeys={["el.pc.laptop", "book"]} accessibilityLabel="Kategoriler" />,
};

export const CheckStrictly: Story = {
  name: "Bağımsız İşaret (checkStrictly)",
  ...storyDoc("`checkStrictly`: üst ↔ alt bağlantısı yok, her düğüm bağımsız işaretlenir (kısmi durum da yok).", `<Tree treeData={permissions} checkable checkStrictly />`),
  render: () => <Tree treeData={PERMISSIONS} checkable checkStrictly selectable={false} defaultExpandAll defaultCheckedKeys={["catalog"]} accessibilityLabel="İzinler" />,
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Ok, onay kutusu ve ikon kendi şekillerinde, başlıklar ince çubuk; satırlar dokunulamaz.", `<Tree skeleton={isLoading} treeData={data} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Tree skeleton={skeleton} treeData={FILES} checkable defaultExpandedKeys={["packages", "packages/native"]} accessibilityLabel="Dosyalar" />}</SkeletonDemo>,
};
