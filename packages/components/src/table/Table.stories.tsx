/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Drawer } from "../drawer";
import { Field } from "../field";
import { Input } from "../input";
import { Pagination } from "../pagination";
import { Switch } from "../switch";
import { Tag } from "../tag";
import { Table } from "./Table";
import type { ColumnDef } from "./types";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";

interface DataType {
  id: string;
  name: string;
  age: number;
  city: string;
  status: string;
}

const NAMES = ["Aykut Yılmaz", "Deniz Kaya", "Elif Şahin", "Mert Demir", "Zeynep Arslan", "Can Öztürk", "Ayşe Çelik", "Burak Koç"];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
const STATUSES = ["Aktif", "Pasif", "Beklemede"];

const initialData: DataType[] = [
  { id: "1", name: "Aykut Yılmaz", age: 32, city: "İstanbul", status: "Aktif" },
  { id: "2", name: "Deniz Kaya", age: 28, city: "Ankara", status: "Aktif" },
  { id: "3", name: "Elif Şahin", age: 41, city: "İzmir", status: "Pasif" },
];

/** Sayfalama örnekleri için daha büyük, gerçekçi bir veri seti. */
const largeData: DataType[] = Array.from({ length: 47 }, (_, i) => ({
  id: String(i + 1),
  name: NAMES[i % NAMES.length]!,
  age: 24 + (i % 30),
  city: CITIES[i % CITIES.length]!,
  status: STATUSES[i % STATUSES.length]!,
}));

const meta: Meta<typeof Table<DataType>> = {
  title: "Veri Gösterimi/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Tip güvenli veri tablosu. Her sütun bir `ColumnDef<T>` ile tanımlanır: `header` başlık metni, " +
            "`columnName` verinin hangi alandan okunacağı (`keyof T`), `render` hücrenin özel içeriği (Tag, Avatar, " +
            "tutar…), `actions` satır içi düzenleme, düzenleme çağrısı (`editRow`), silme ve detay, `info` " +
            "değeri bir tooltip içinde de gösterir, `align` metin hizalamasını belirler (varsayılan `\"start\"`). Sayfalama " +
            "`footer` yuvasına verilen `Pagination`; tablo veriyi dilimlemez.",
          whenToUse: ["Satır/sütun yapısında, tipik olarak sıralanabilir/eylem içeren tablo verisi göstermek için."],
          whenNotToUse: ["Basit bir liste yeterliyse — bir tablo overhead getirir, `Card`/düz liste daha sade olabilir."],
          a11y:
            "`label` tabloya ekran okuyucu başlığı (`<caption>`) verir. Başlık hücreleri (`<th>`) `scope=\"col\"` taşır. " +
            "Satır eylem düğmeleri satırın adını taşır (\"Sil: Aykut Yılmaz\"). Tablo taşıyorsa kaydırma bölgesi " +
            "klavyeyle odaklanıp ←/→ ile kaydırılabilir. Sayfalama düğmeleri `aria-label`/`aria-current` taşır. " +
            "**Not:** eskiden `tableHeader: string[]` ve `tableBody: ColumnProps[]` iki ayrı, elle senkron tutulan " +
            "dizi olarak geçiliyordu — artık tek bir `columns` dizisi hem başlığı hem veri eşlemesini taşıyor. " +
            "Ayrıca `0`/`false`/`\"\"` gibi falsy ama geçerli değerler eskiden \"-\" olarak gösteriliyordu (yalnızca " +
            "`null`/`undefined` için \"-\" gösterilecek şekilde düzeltildi).",
        }),
      },
    },
  },
  argTypes: {
    responsive: { control: "select", options: ["scroll", "accordion"], description: "`scroll` (varsayılan) yatay kaydırma. `accordion` dar ekranda satırları açılır/kapanır kartlara çevirir." },
  },
};

export default meta;
type Story = StoryObj<typeof Table<DataType>>;

export const Playground: Story = {
  ...storyDoc("Sütunlar `columns` (başlık, alan adı, hizalama), satırlar `data`. Kontrollerden `label` ve diğer seçenekleri deneyin."),
  args: {
    label: "Kullanıcılar",
    data: initialData,
    columns: [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age", align: "end" },
      { header: "Şehir", columnName: "city" },
    ],
  },
};

export const Default: Story = {
  name: "Varsayılan",
  ...storyDoc(
    "Tüm sütunlar varsayılan olarak sola hizalıdır (kullanıcı bulgusu: eskiden DOM sırasına göre sol/merkez/sağ " +
      "karışık hizalanıyordu). `age` gibi sayısal bir sütun `align: \"end\"` ile açıkça sağa hizalanabilir.",
    `
const columns: ColumnDef<User>[] = [
  { header: "İsim", columnName: "name" },
  { header: "Yaş", columnName: "age", align: "end" },
  { header: "Şehir", columnName: "city", info: true },
];

<Table label="Kullanıcılar" data={users} columns={columns} />`
  ),
  render: () => {
    const columns: ColumnDef<DataType>[] = [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age", align: "end" },
      { header: "Şehir", columnName: "city", info: true },
    ];
    return <Table<DataType> label="Kullanıcılar" data={initialData} columns={columns} />;
  },
};

export const EmptyData: Story = {
  name: "Boş Veri",
  ...storyDoc(
    "`data` boş dizi olduğunda gerçek `Empty` component'i render edilir. `emptyState` ile başlık/açıklama özelleştirilebilir.",
    `
<Table
  data={[]}
  columns={columns}
  emptyState={{ title: "Kayıt Bulunamadı", description: "Henüz eklenmiş bir kullanıcı yok." }}
/>`
  ),
  render: () => {
    // Not: `align: "end"` kasıtlı olarak burada YOK — sayısal bir sütunu
    // sağa hizalamak "Varsayılan" story'sinde gerçek değerlerle anlamlı,
    // ama veri hiç yokken sadece başlıkların birbirinden kopuk uçlara
    // (biri sol, biri sağ) dağılmış görünmesine yol açıyordu (kullanıcı
    // bulgusu). Boş durumda tüm başlıklar aynı (varsayılan) hizada.
    const columns: ColumnDef<DataType>[] = [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age" },
    ];
    return <Table<DataType> data={[]} columns={columns} emptyState={{ title: "Kayıt Bulunamadı", description: "Henüz eklenmiş bir kullanıcı yok." }} />;
  },
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "Aktif" | "Pasif" | "Davet edildi";
  phone: string;
  joinDate: string;
  orders: number;
}

/** Sütunlar dar ekrana kasıtlı olarak SIĞMASIN diye geniş — yatay kaydırma + sabit işlemler sütunu görünsün. */
const users: UserRow[] = [
  { id: "1", name: "Aykut Yılmaz", email: "aykut@example.com", department: "Mühendislik", status: "Aktif", phone: "0532 111 22 33", joinDate: "12.03.2021", orders: 128 },
  { id: "2", name: "Deniz Kaya", email: "deniz@example.com", department: "Tasarım", status: "Davet edildi", phone: "0533 222 33 44", joinDate: "05.07.2022", orders: 0 },
  { id: "3", name: "Elif Şahin", email: "elif@example.com", department: "Satış", status: "Pasif", phone: "0534 333 44 55", joinDate: "20.11.2019", orders: 1542 },
  { id: "4", name: "Mert Demir", email: "mert.demir@example.com", department: "Müşteri Başarısı", status: "Aktif", phone: "0535 444 55 66", joinDate: "01.02.2024", orders: 37 },
];

const STATUS_COLOR = { Aktif: "success", Pasif: "neutral", "Davet edildi": "info" } as const;

function userColumns(actions?: ColumnDef<UserRow>["actions"]): ColumnDef<UserRow>[] {
  const columns: ColumnDef<UserRow>[] = [
    {
      header: "Kullanıcı",
      columnName: "name",
      render: (_, row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Avatar size="sm" alt={row.name} />
          <div className="min-w-0">
            <p className="font-medium text-mari-foreground">{row.name}</p>
            <p className="text-xs text-mari-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Departman", columnName: "department" },
    {
      header: "Durum",
      columnName: "status",
      render: (value) => <Tag color={STATUS_COLOR[value as UserRow["status"]]}>{String(value)}</Tag>,
    },
    { header: "Telefon", columnName: "phone", render: (value) => <span className="whitespace-nowrap tabular-nums">{String(value)}</span> },
    { header: "Katılım", columnName: "joinDate", render: (value) => <span className="whitespace-nowrap tabular-nums">{String(value)}</span> },
    { header: "Sipariş", columnName: "orders", align: "end", render: (value) => <span className="tabular-nums">{Number(value).toLocaleString("tr-TR")}</span> },
  ];
  return actions ? [...columns, { header: "İşlemler", align: "end", actions }] : columns;
}

const WithActionsStory = () => {
  const [data, setData] = useState(users);
  const columns = userColumns({
    editRowInInline: {
      onChange: (updated) => setData((prev) => prev.map((row) => (row.id === updated.id ? updated : row))),
    },
    deleteRow: (id) => setData((prev) => prev.filter((row) => row.id !== id)),
  });
  return <Table<UserRow> label="Kullanıcılar" data={data} columns={columns} />;
};

export const WithActions: Story = {
  name: "Özel Hücreler ve İşlemler",
  ...storyDoc(
    "`render` ile hücreye özel içerik: kullanıcı (Avatar + isim + e-posta), durum `Tag`'i, satır kırılmayan telefon/" +
      "tarih ve sağa hizalı, binlik ayraçlı sayı. `actions.editRowInInline` satırı düzenlenebilir hücrelere çevirir " +
      "(`columnName`'li sütunlar `Input` olur). Sütunlar sığmadığında tablo yatay kaydırılır — işlemler sütunu dar " +
      "kalır ve sağda sabittir. Eylem düğmeleri satırın adını taşır (\"Sil: Aykut Yılmaz\").",
    `
const columns: ColumnDef<User>[] = [
  {
    header: "Kullanıcı",
    columnName: "name",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar size="sm" alt={row.name} />
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-mari-muted">{row.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Durum", columnName: "status", render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag> },
  { header: "Sipariş", columnName: "orders", align: "end", render: (v) => v.toLocaleString("tr-TR") },
  { header: "İşlemler", align: "end", actions: { editRowInInline: { onChange: save }, deleteRow: remove } },
];

<Table label="Kullanıcılar" data={users} columns={columns} />`
  ),
  render: () => <WithActionsStory />,
};

export const Accordion: Story = {
  name: "Duyarlı — Accordion",
  ...storyDoc(
    "`responsive=\"accordion\"` iken dar ekranda (`md` altı — Storybook'un viewport aracıyla mobil önizlemeye " +
      "geçin) tablo yerine her satır açılır/kapanır bir kart olarak gösterilir; geniş ekranda normal tablo kalır. " +
      "İlk sütun (`render`'ıyla) satır başlığı olur, diğerleri açılınca etiket/değer listesi; işlemler satırda kalır.",
    `
<Table label="Kullanıcılar" responsive="accordion" data={users} columns={columns} />`
  ),
  render: () => {
    const [data, setData] = useState(users);
    return (
      <Table<UserRow>
        label="Kullanıcılar"
        responsive="accordion"
        data={data}
        columns={userColumns({ deleteRow: (id) => setData((prev) => prev.filter((row) => row.id !== id)) })}
      />
    );
  },
};

const EditInDrawerStory = () => {
  const [data, setData] = useState(users);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [draftName, setDraftName] = useState("");

  const save = () => {
    if (editing) setData((prev) => prev.map((row) => (row.id === editing.id ? { ...row, name: draftName } : row)));
    setEditing(null);
  };

  return (
    <>
      <Table<UserRow>
        label="Kullanıcılar"
        data={data}
        columns={userColumns({
          editRow: (row) => {
            setDraftName(row.name);
            setEditing(row);
          },
        })}
      />
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Kullanıcıyı düzenle"
        description={editing?.email}
        footer={
          <>
            <Button variant="outline" color="neutral" onClick={() => setEditing(null)}>
              Vazgeç
            </Button>
            <Button onClick={save}>Kaydet</Button>
          </>
        }
      >
        <Field label="Ad soyad">
          <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
        </Field>
      </Drawer>
    </>
  );
};

export const EditInDrawer: Story = {
  name: "Çekmecede Düzenleme",
  ...storyDoc(
    "`actions.editRow` \"Düzenle\" düğmesini satırla çağırır; düzenleme yüzeyini (Drawer, Modal, ayrı sayfa) tüketici " +
      "açar — tablo kendi çekmecesini taşımaz, `Drawer` yalnız onu kullanana gelir.",
    `
import { Table } from "@mari-ui/components/table";
import { Drawer } from "@mari-ui/components/drawer";
import { Button } from "@mari-ui/components/button";
import { Field } from "@mari-ui/components/field";
import { Input } from "@mari-ui/components/input";

const [editing, setEditing] = useState(null);
const [draftName, setDraftName] = useState("");

const columns = [
  { header: "Kullanıcı", columnName: "name" },
  {
    header: "İşlemler",
    align: "end",
    actions: {
      editRow: (row) => {
        setDraftName(row.name);
        setEditing(row);
      },
    },
  },
];

<Table label="Kullanıcılar" data={users} columns={columns} />
<Drawer
  open={editing !== null}
  onClose={() => setEditing(null)}
  title="Kullanıcıyı düzenle"
  description={editing?.email}
  footer={
    <>
      <Button variant="outline" color="neutral" onClick={() => setEditing(null)}>Vazgeç</Button>
      <Button onClick={() => { save(editing.id, draftName); setEditing(null); }}>Kaydet</Button>
    </>
  }
>
  <Field label="Ad soyad">
    <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
  </Field>
</Drawer>`
  ),
  render: () => <EditInDrawerStory />,
};

const PaginationClientStory = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = largeData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Table<DataType>
      data={rows}
      columns={responsiveColumns}
      footer={
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={largeData.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          showTotal
        />
      }
    />
  );
};

export const PaginationClient: Story = {
  name: "Sayfalama — İstemci Taraflı",
  ...storyDoc(
    "Sayfalama `footer` yuvasına verilen `Pagination`'dır — tablo veriyi dilimlemez, yalnız o sayfanın satırlarını " +
      "alır. İstemci taraflıda tüm veri elde: tek satırlık `slice` yeter, sunucuya istek yok. `onPageSizeChange` " +
      "verildiğinde sayfa başına satır sayısı seçilebilir. `Pagination` yalnız onu kullanan tabloya gelir.",
    `
import { Table } from "@mari-ui/components/table";
import { Pagination } from "@mari-ui/components/pagination";

const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<Table
  data={allUsers.slice((page - 1) * pageSize, page * pageSize)}
  columns={columns}
  footer={
    <Pagination
      currentPage={page}
      pageSize={pageSize}
      totalItems={allUsers.length}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      showTotal
    />
  }
/>`
  ),
  render: () => <PaginationClientStory />,
};

const PaginationServerStory = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  // Gerçek kullanımda bu, `page` değiştiğinde bir API çağrısıyla gelir
  // (örn. `fetch(`/api/users?page=${page}&pageSize=${pageSize}`)`) — burada
  // simüle etmek için aynı diziden dilimleniyor, ama `Table`'a SADECE o
  // sayfanın verisi veriliyor.
  const currentPageData = largeData.slice(start, start + pageSize);

  return (
    <Table<DataType>
      data={currentPageData}
      columns={responsiveColumns}
      footer={<Pagination currentPage={page} pageSize={pageSize} totalItems={largeData.length} onPageChange={setPage} showTotal />}
    />
  );
};

export const PaginationServer: Story = {
  name: "Sayfalama — Sunucu Taraflı",
  ...storyDoc(
    "Sunucu taraflıda `data` her zaman o sayfanın dilimidir; `onPageChange`'de tüketici yeni sayfanın verisini kendisi " +
      "getirir (API çağrısı vb.), toplamı `totalItems`'a verir. Burada gösterim amaçlı yerel diziden simüle edildi.",
    `
import { Table } from "@mari-ui/components/table";
import { Pagination } from "@mari-ui/components/pagination";

const [page, setPage] = useState(1);
const { data, total } = useUsers({ page, pageSize: 10 }); // sunucudan yalnız bu sayfa

<Table
  data={data}
  columns={columns}
  footer={<Pagination currentPage={page} pageSize={10} totalItems={total} onPageChange={setPage} showTotal />}
/>`
  ),
  render: () => <PaginationServerStory />,
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` başlıkları, hücreleri ve işlemler sütununu iskelete çevirir (sayfalamaya da aynı `skeleton`'ı verin). Veri varken (yenileme) " +
      "gerçek hücreler görünmez olarak yerinde kalır → satır yükseklikleri korunur, zıplama olmaz. Veri henüz yokken " +
      "(ilk yükleme) `skeletonRows` kadar (en çok 10, varsayılan 5) tek satırlık sahte satır çizilir. Tablo `aria-busy` alır.",
    `
<Table
  label="Kullanıcılar"
  skeleton={isLoading}
  skeletonRows={4}
  data={data ?? []}
  columns={columns}
  footer={<Pagination skeleton={isLoading} currentPage={page} pageSize={4} totalItems={total} onPageChange={setPage} showTotal />}
/>`
  ),
  render: () => {
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    return (
      <SkeletonDemo>
        {(skeleton) => (
          <div className="space-y-4">
            <Switch checked={firstLoad} onChange={setFirstLoad} label="İlk yükleme (veri yok)" size="sm" />
            <Table<UserRow>
              label="Kullanıcılar"
              skeleton={skeleton}
              data={skeleton && firstLoad ? [] : users}
              columns={userColumns({ deleteRow: () => {} })}
              skeletonRows={4}
              footer={<Pagination skeleton={skeleton} currentPage={page} pageSize={4} totalItems={users.length} onPageChange={setPage} showTotal />}
            />
          </div>
        )}
      </SkeletonDemo>
    );
  },
};

const responsiveColumns: ColumnDef<DataType>[] = [
  { header: "İsim", columnName: "name" },
  { header: "Yaş", columnName: "age", align: "end" },
  { header: "Şehir", columnName: "city" },
  { header: "Durum", columnName: "status" },
];
