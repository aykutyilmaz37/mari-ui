/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Switch } from "../switch";
import { Tag } from "../tag";
import { Table } from "./Table";
import type { ColumnDef, TablePaginationConfig } from "./types";
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
            "tutar…), `actions` satır içi düzenleme/silme, `info` " +
            "değeri bir tooltip içinde de gösterir, `align` metin hizalamasını belirler (varsayılan `\"start\"`).",
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

const PaginationClientStory = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagination: TablePaginationConfig = {
    page,
    pageSize,
    total: largeData.length,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setPageSize(size);
      setPage(1);
    },
  };

  return <Table<DataType> data={largeData} columns={responsiveColumns} pagination={pagination} paginationMode="client" />;
};

export const PaginationClient: Story = {
  name: "Sayfalama — İstemci Taraflı",
  ...storyDoc(
    "`paginationMode=\"client\"` iken `Table` TÜM veriyi (`largeData`, 47 satır) alır ve `page`/`pageSize`'a göre " +
      "kendi diler — sunucuya istek atmadan, sadece sayfa state'i güncellenir. `onPageSizeChange` verildiğinde " +
      "sayfa başına satır sayısı seçilebilir.",
    `
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<Table
  data={allUsers}
  columns={columns}
  paginationMode="client"
  pagination={{
    page,
    pageSize,
    total: allUsers.length,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setPageSize(size);
      setPage(1);
    },
  }}
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
  // sayfanın verisi veriliyor (component kendi dilimlemiyor).
  const currentPageData = largeData.slice(start, start + pageSize);

  const pagination: TablePaginationConfig = {
    page,
    pageSize,
    total: largeData.length,
    onPageChange: setPage,
  };

  return <Table<DataType> data={currentPageData} columns={responsiveColumns} pagination={pagination} paginationMode="server" />;
};

export const PaginationServer: Story = {
  name: "Sayfalama — Sunucu Taraflı",
  ...storyDoc(
    "`paginationMode=\"server\"` (varsayılan) iken `Table` hiçbir dilimleme yapmaz — `data` her zaman zaten o " +
      "sayfaya ait dilim olarak verilir. `onPageChange`'de tüketici yeni sayfanın verisini kendisi getirir (API " +
      "çağrısı vb.); burada gösterim amaçlı yerel diziden simüle edildi.",
    `
const [page, setPage] = useState(1);
const { data, total } = useUsers({ page, pageSize: 10 }); // sunucudan yalnız bu sayfa

<Table
  data={data}
  columns={columns}
  paginationMode="server"
  pagination={{ page, pageSize: 10, total, onPageChange: setPage }}
/>`
  ),
  render: () => <PaginationServerStory />,
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` başlıkları, hücreleri, işlemler sütununu ve sayfalamayı iskelete çevirir. Veri varken (yenileme) " +
      "gerçek hücreler görünmez olarak yerinde kalır → satır yükseklikleri korunur, zıplama olmaz. Veri henüz yokken " +
      "(ilk yükleme) sayfa boyu kadar (en çok 10, varsayılan 5) tek satırlık sahte satır çizilir. Tablo `aria-busy` alır.",
    `
<Table label="Kullanıcılar" skeleton={isLoading} data={data ?? []} columns={columns} pagination={pagination} />`
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
              pagination={{ page, pageSize: 4, total: users.length, onPageChange: setPage }}
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
