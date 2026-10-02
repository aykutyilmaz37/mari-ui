/**
 * Faz 16.3: gerçek senaryolar — dosya gezgini (ikonlar, kılavuz çizgileri,
 * tıklayınca aç), rol izinleri (onay kutuları + yayılım), kategori arama,
 * tembel yüklenen il/ilçe ağacı, çoklu seçim, bağımsız işaret, iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileCodeIcon, FileJsonIcon, FileTextIcon, FolderIcon, FolderOpenIcon, ImageIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Tree, buildIndex, conductCheck } from ".";
import type { TreeNode } from ".";
import { Input } from "../input";
import { Switch } from "../switch";
import { Tag } from "../tag";

const meta: Meta<typeof Tree> = {
  title: "Veri Gösterimi/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Hiyerarşik veriyi açılır-kapanır düğümlerle gösterir: klasörler, kategoriler, organizasyon şeması, izinler. " +
            "Seçim (tekli/çoklu), onay kutuları (üst ↔ alt yayılım ve kısmi durum ya da `checkStrictly` ile bağımsız), " +
            "tembel yükleme (`loadData`), kılavuz çizgileri (`showLine`), arama + vurgu (`searchValue`).",
          whenToUse: [
            "Derinliği değişken, iç içe veri: dosya gezgini, kategori ağacı, departmanlar.",
            "Bir dalın tamamını tek tıkla seçmek/işaretlemek (rol izinleri, bölge seçimi).",
          ],
          whenNotToUse: [
            "Tek seviyeli liste — List ya da Checkbox grubu.",
            "Form alanında ağaçtan değer seçmek — TreeSelect (16.4).",
            "Sayfa gezinmesi — Menu/Sidebar (ağaç rolü gezinme için değildir).",
          ],
          a11y:
            "WAI-ARIA APG Tree View: `role=\"tree\"` + `treeitem` (`aria-level`, `aria-posinset`, `aria-setsize`; açılabilirse " +
            "`aria-expanded`, seçilebilirse `aria-selected`, onay kutuluysa `aria-checked` true/false/mixed). Ağaç tek Tab " +
            "durağıdır. ↑/↓ görünür düğümler, → aç / ilk çocuğa in, ← kapa / ebeveyne çık, Home/End, `*` kardeşleri aç, " +
            "harfle ada atla; Enter seçer, Space onay kutulu ağaçta işaretler. Ağaca `aria-label` verin. Dokunmatikte " +
            "satırlar 44px yüksekliğe çıkar.",
        }),
      },
    },
  },
  argTypes: {
    treeData: { control: false },
    checkable: { control: "boolean" },
    checkStrictly: { control: "boolean" },
    selectable: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    multiple: { control: "boolean" },
    showLine: { control: "boolean" },
    blockNode: { control: "boolean" },
    defaultExpandAll: { control: "boolean" },
    expandAction: { control: "inline-radio", options: [false, "click", "doubleClick"] },
    searchValue: { control: "text" },
    skeleton: { control: "boolean" },
    onExpand: { table: { category: "Olaylar" } },
    onSelect: { table: { category: "Olaylar" } },
    onCheck: { table: { category: "Olaylar" } },
  },
};

export default meta;
type Story = StoryObj<typeof Tree>;

/* ─────────────────────────── Veri ─────────────────────────── */

const file = (key: string, title: string): TreeNode => {
  let icon = <FileTextIcon />;
  if (/\.(tsx?|jsx?)$/.test(title)) icon = <FileCodeIcon />;
  else if (title.endsWith(".json")) icon = <FileJsonIcon />;
  else if (/\.(svg|png)$/.test(title)) icon = <ImageIcon />;
  return { key, title, icon, isLeaf: true };
};

const project: TreeNode[] = [
  {
    key: "apps",
    title: "apps",
    children: [
      { key: "apps/docs", title: "docs", children: [file("apps/docs/main.ts", "main.ts"), file("apps/docs/preview.tsx", "preview.tsx")] },
      { key: "apps/studio", title: "studio", children: [file("apps/studio/page.tsx", "page.tsx")] },
    ],
  },
  {
    key: "packages",
    title: "packages",
    children: [
      {
        key: "packages/components",
        title: "components",
        children: [
          { key: "pc/src", title: "src", children: [file("pc/src/tree.tsx", "Tree.tsx"), file("pc/src/utils.ts", "utils.ts"), file("pc/src/logo.svg", "logo.svg")] },
          file("pc/package.json", "package.json"),
        ],
      },
      { key: "packages/tokens", title: "tokens", children: [file("pt/index.ts", "index.ts")] },
    ],
  },
  file("readme", "README.md"),
  file("pkg", "package.json"),
];

/** Klasörlere açık/kapalı klasör ikonu (açık durumu bilen controlled ağaç). */
function withFolderIcons(nodes: TreeNode[], expanded: string[]): TreeNode[] {
  return nodes.map((n) =>
    n.children ? { ...n, icon: expanded.includes(n.key) ? <FolderOpenIcon /> : <FolderIcon />, children: withFolderIcons(n.children, expanded) } : n
  );
}

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  args: { treeData: project, defaultExpandedKeys: ["packages"], showLine: false, checkable: false, multiple: false, blockNode: false },
  render: (args) => (
    <div className="max-w-sm">
      <Tree aria-label="Proje dosyaları" {...args} />
    </div>
  ),
};

/* ─────────────────────────── 1. Dosya gezgini ─────────────────────────── */

export const FileExplorer: Story = {
  name: "Dosya Gezgini",
  ...storyDoc(
    "Dosya gezgini düzeni: `blockNode` (seçim zemini tam satır), `showLine` (girinti kılavuzları), " +
      "`expandAction=\"click\"` (klasöre tıklamak hem seçer hem açar). Açık klasör ikonu için `expandedKeys` controlled.",
    `
const [expanded, setExpanded] = useState(["packages", "packages/components"]);

<Tree
  aria-label="Proje dosyaları"
  blockNode
  showLine
  expandAction="click"
  expandedKeys={expanded}
  onExpand={setExpanded}
  defaultSelectedKeys={["pc/src/tree.tsx"]}
  treeData={withFolderIcons(project, expanded)}
/>`
  ),
  render: () => {
    const [expanded, setExpanded] = useState(["packages", "packages/components", "pc/src"]);
    return (
      <div className="max-w-xs rounded-xl border border-mari-border bg-mari-surface p-2">
        <Tree
          aria-label="Proje dosyaları"
          blockNode
          showLine
          expandAction="click"
          expandedKeys={expanded}
          onExpand={setExpanded}
          defaultSelectedKeys={["pc/src/tree.tsx"]}
          treeData={withFolderIcons(project, expanded)}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 2. Rol izinleri ─────────────────────────── */

const permissions: TreeNode[] = [
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

const permissionIndex = buildIndex(permissions);

export const Permissions: Story = {
  name: "Rol İzinleri (checkable)",
  ...storyDoc(
    "`checkable`: üst düğümü işaretlemek tüm (devre dışı olmayan) altları işaretler; altların bir kısmı işaretliyse üst " +
      "\"kısmi\" (`aria-checked=\"mixed\"`). Devre dışı düğüm (\"Sil\" — yalnız yöneticiler) yayılıma katılmaz. " +
      "`onCheck` kesin işaretlileri ve kısmi olanları verir.",
    `
const [checked, setChecked] = useState(["orders.view", "catalog.products"]);

<Tree
  aria-label="Editör rolü izinleri"
  checkable
  selectable={false}
  defaultExpandAll
  checkedKeys={checked}
  onCheck={(keys) => setChecked(keys)}
  treeData={permissions}
/>`
  ),
  render: () => {
    const [checked, setChecked] = useState<string[]>(["orders.view", "catalog.products"]);
    // `checkedKeys` ham girdidir ("Ürünler" → altları); sayım yayılmış durumdan, yalnız yapraklar.
    const leaves = conductCheck(checked, permissionIndex).checked.filter((k) => permissionIndex.get(k)!.childKeys.length === 0).length;
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <Tree
          aria-label="Editör rolü izinleri"
          checkable
          selectable={false}
          defaultExpandAll
          checkedKeys={checked}
          onCheck={(keys) => setChecked(keys)}
          treeData={permissions}
        />
        <p className="text-sm text-mari-muted" aria-live="polite">
          {leaves} izin seçili
        </p>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Kategori arama ─────────────────────────── */

const categories: TreeNode[] = [
  {
    key: "elektronik",
    title: "Elektronik",
    children: [
      { key: "bilgisayar", title: "Bilgisayar", children: [{ key: "laptop", title: "Dizüstü bilgisayar" }, { key: "masaustu", title: "Masaüstü bilgisayar" }, { key: "tablet", title: "Tablet" }] },
      { key: "telefon", title: "Telefon", children: [{ key: "akilli", title: "Akıllı telefon" }, { key: "kilif", title: "Kılıf ve aksesuar" }] },
      { key: "ses", title: "Ses sistemleri", children: [{ key: "kulaklik", title: "Kulaklık" }, { key: "hoparlor", title: "Hoparlör" }] },
    ],
  },
  {
    key: "ev",
    title: "Ev ve yaşam",
    children: [
      { key: "mutfak", title: "Mutfak", children: [{ key: "isitici", title: "Su ısıtıcı" }, { key: "kahve", title: "Kahve makinesi" }] },
      { key: "aydinlatma", title: "Aydınlatma" },
    ],
  },
  { key: "kitap", title: "Kitap" },
];

export const SearchCategories: Story = {
  name: "Kategori Arama (searchValue)",
  ...storyDoc(
    "`searchValue`: eşleşen düğümler + ataları gösterilir, atalar kendiliğinden açılır, eşleşme vurgulanır. Türkçe " +
      "harf duyarsız (\"ISI\" → \"Su ısıtıcı\", \"akıllı\" → \"Akıllı telefon\"). Başlık metin değilse `searchText` verin.",
    `
const [q, setQ] = useState("");

<Input placeholder="Kategori ara" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kategori ara" />
<Tree aria-label="Kategoriler" searchValue={q} treeData={categories} />`
  ),
  render: () => {
    const [q, setQ] = useState("bilgisayar");
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <Input placeholder="Kategori ara" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kategori ara" allowClear />
        <Tree aria-label="Kategoriler" searchValue={q} treeData={categories} />
      </div>
    );
  },
};

/* ─────────────────────────── 4. Tembel yükleme ─────────────────────────── */

const DISTRICTS: Record<string, string[]> = {
  istanbul: ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli"],
  ankara: ["Çankaya", "Keçiören", "Yenimahalle"],
  izmir: ["Konak", "Karşıyaka", "Bornova"],
};

const districtNodes = (city: string): TreeNode[] => (DISTRICTS[city] ?? []).map((d) => ({ key: `${city}-${d}`, title: d, isLeaf: true }));

export const LazyLoad: Story = {
  name: "İl / İlçe (tembel yükleme)",
  ...storyDoc(
    "`loadData`: çocuğu olmayan (ve `isLeaf` olmayan) düğüm açılınca çağrılır; çözülene kadar açma yerinde dönen gösterge " +
      "ve `aria-busy`. Gelen çocukları `treeData`ya siz eklersiniz. Gerçek yaprakları `isLeaf: true` ile işaretleyin.",
    `
const [tree, setTree] = useState<TreeNode[]>([
  { key: "istanbul", title: "İstanbul" }, { key: "ankara", title: "Ankara" }, { key: "izmir", title: "İzmir" },
]);

const loadData = async (node: TreeNode) => {
  const districts = await api.getDistricts(node.key);
  setTree((t) => t.map((n) => n.key === node.key ? { ...n, children: districts.map((d) => ({ key: d.id, title: d.name, isLeaf: true })) } : n));
};

<Tree aria-label="İl ve ilçeler" checkable loadData={loadData} treeData={tree} />`
  ),
  render: () => {
    const [tree, setTree] = useState<TreeNode[]>([
      { key: "istanbul", title: "İstanbul" },
      { key: "ankara", title: "Ankara" },
      { key: "izmir", title: "İzmir" },
    ]);
    const loadData = async (node: TreeNode) => {
      await new Promise((resolve) => setTimeout(resolve, 900)); // sahte ağ gecikmesi
      const children = districtNodes(node.key);
      setTree((t) => t.map((n) => (n.key === node.key ? { ...n, children } : n)));
    };
    return (
      <div className="max-w-xs">
        <Tree aria-label="İl ve ilçeler" checkable loadData={loadData} treeData={tree} />
      </div>
    );
  },
};

/* ─────────────────────────── 5. Çoklu seçim ─────────────────────────── */

const categoryIndex = buildIndex(categories);
const titleOf = (key: string) => String(categoryIndex.get(key)?.node.title ?? key);

/** Seçim/işaret sonucunu gösteren kutu: ağacın NE ürettiği görünsün. */
function ResultPanel({ title, keys, empty }: { title: string; keys: string[]; empty: string }) {
  return (
    <section aria-live="polite" className="flex flex-col gap-2 rounded-lg border border-mari-border bg-mari-surface-alt p-3 text-sm">
      <h3 className="font-medium text-mari-foreground">{title}</h3>
      {keys.length === 0 ? (
        <p className="text-mari-muted">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {keys.map((k) => (
            <li key={k}>
              <Tag color="primary">{titleOf(k)}</Tag>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const MultipleSelect: Story = {
  name: "Çoklu Seçim (multiple)",
  ...storyDoc(
    "Senaryo: karşılaştırma sayfası — kullanıcı yan yana karşılaştırmak istediği kategorileri seçer. `multiple`: her tıklama " +
      "(ya da Enter) o düğümün seçimini aç/kapar, seçimler birikir; Ctrl gerekmez. Seçim onay kutusundan farklıdır: " +
      "üst düğümü seçmek alt düğümleri seçmez. Sonuç `onSelect` ile gelir — sağda karşılaştırma listesi.",
    `
const [selected, setSelected] = useState(["laptop", "tablet"]);

<Tree aria-label="Karşılaştırılacak kategoriler" multiple selectedKeys={selected} onSelect={setSelected} treeData={categories} />
<ul>{selected.map((k) => <li key={k}>{titleOf(k)}</li>)}</ul>`
  ),
  render: () => {
    const [selected, setSelected] = useState<string[]>(["laptop", "tablet"]);
    return (
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-mari-muted">Karşılaştırmak istediğiniz kategorilere tıklayın (tekrar tıklamak çıkarır).</p>
          <Tree
            aria-label="Karşılaştırılacak kategoriler"
            multiple
            defaultExpandedKeys={["elektronik", "bilgisayar", "telefon"]}
            selectedKeys={selected}
            onSelect={setSelected}
            treeData={categories}
          />
        </div>
        <ResultPanel title={`Karşılaştırma (${selected.length})`} keys={selected} empty="Henüz kategori seçmediniz." />
      </div>
    );
  },
};

/* ─────────────────────────── 6. Bağımsız işaret ─────────────────────────── */

export const CheckStrictly: Story = {
  name: "Bağımsız İşaret (checkStrictly)",
  ...storyDoc(
    "Senaryo: ana sayfa vitrini — hangi kategori kartları vitrinde gösterilsin? \"Elektronik\" kartını koymak, altındaki " +
      "\"Bilgisayar\"ı da koymak anlamına GELMEZ. Varyasyonlu işarette (solda) üst düğüm tüm altları işaretler; " +
      "`checkStrictly`de (sağda) her düğüm yalnız kendisidir, kısmi durum yoktur. Aynı tıklamaların sonucu altta.",
    `
// Varsayılan: "Elektronik" → altındaki 10 kategori de işaretlenir
<Tree aria-label="Filtre" checkable treeData={categories} onCheck={setFilter} />

// checkStrictly: "Elektronik" → yalnız Elektronik
<Tree aria-label="Vitrindeki kategoriler" checkable checkStrictly treeData={categories} onCheck={setShowcase} />`
  ),
  render: () => {
    const [linked, setLinked] = useState<string[]>(["elektronik"]);
    const [strict, setStrict] = useState<string[]>(["elektronik"]);
    const linkedAll = conductCheck(linked, categoryIndex).checked;
    return (
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mari-foreground">Varsayılan (bağlı) — ör. ürün filtresi</h3>
          <p className="text-sm text-mari-muted">"Elektronik" işaretli → tüm alt kategoriler de işaretli.</p>
          <Tree aria-label="Ürün filtresi" checkable selectable={false} defaultExpandedKeys={["elektronik"]} checkedKeys={linked} onCheck={setLinked} treeData={categories} />
          {/* `checkedKeys` ham girdi; ağacın gösterdiği (yayılmış) küme conductCheck ile. */}
          <ResultPanel title={`Filtrede (${linkedAll.length})`} keys={linkedAll} empty="Filtre yok." />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mari-foreground">checkStrictly — ör. vitrin kartları</h3>
          <p className="text-sm text-mari-muted">"Elektronik" işaretli → yalnız Elektronik kartı; alt kategoriler ayrı ayrı seçilir.</p>
          <Tree aria-label="Vitrindeki kategoriler" checkable checkStrictly selectable={false} defaultExpandedKeys={["elektronik"]} checkedKeys={strict} onCheck={setStrict} treeData={categories} />
          <ResultPanel title={`Vitrinde (${strict.length})`} keys={strict} empty="Vitrin boş." />
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 6. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton`: veri varsa her düğüm kendi başlık genişliğinde yer tutucu olur (girinti ve açma yerleri korunur); " +
      "veri yokken genel bir ağaç şekli çizilir.",
    `
<Tree skeleton={loading} aria-label="Kategoriler" treeData={categories} />
<Tree skeleton aria-label="Kategoriler" treeData={[]} />  // ilk yükleme`
  ),
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Switch checked={on} onChange={setOn} label="İskelet" />
        <div className="grid gap-8 md:grid-cols-2">
          <Tree skeleton={on} aria-label="Kategoriler" checkable defaultExpandedKeys={["elektronik", "bilgisayar"]} treeData={categories} />
          <Tree skeleton={on} aria-label="Kategoriler (ilk yükleme)" treeData={on ? [] : categories} />
        </div>
      </div>
    );
  },
};
