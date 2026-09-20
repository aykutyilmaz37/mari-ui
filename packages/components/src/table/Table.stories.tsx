import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from "./Table";
import type { ColumnDef, TablePaginationConfig } from "./types";
import { componentDoc, storyDoc } from "../lib/storyMeta";

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
            "`columnName` verinin hangi alandan okunacağı (`keyof T`), `actions` satır içi düzenleme/silme, `info` " +
            "değeri bir tooltip içinde de gösterir, `align` metin hizalamasını belirler (varsayılan `\"start\"`).",
          whenToUse: ["Satır/sütun yapısında, tipik olarak sıralanabilir/eylem içeren tablo verisi göstermek için."],
          whenNotToUse: ["Basit bir liste yeterliyse — bir tablo overhead getirir, `Card`/düz liste daha sade olabilir."],
          a11y:
            "Başlık hücreleri (`<th>`) `scope=\"col\"` taşır. Sayfalama düğmeleri `aria-label`/`aria-current` taşır. " +
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

export const Default: Story = {
  name: "Varsayılan",
  ...storyDoc(
    "Tüm sütunlar varsayılan olarak sola hizalıdır (kullanıcı bulgusu: eskiden DOM sırasına göre sol/merkez/sağ " +
      "karışık hizalanıyordu). `age` gibi sayısal bir sütun `align: \"end\"` ile açıkça sağa hizalanabilir."
  ),
  render: () => {
    const columns: ColumnDef<DataType>[] = [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age", align: "end" },
      { header: "Şehir", columnName: "city", info: true },
    ];
    return <Table<DataType> data={initialData} columns={columns} />;
  },
};

export const EmptyData: Story = {
  name: "Boş Veri",
  ...storyDoc("`data` boş dizi olduğunda artık gerçek `Empty` component'i render edilir — eskiki düz \"Veri yok.\" metni yerine. `emptyState` ile başlık/açıklama özelleştirilebilir."),
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

interface WideDataType {
  id: string;
  name: string;
  age: number;
  city: string;
  status: string;
  email: string;
  phone: string;
  department: string;
  joinDate: string;
}

/** Sütunlar Storybook canvas'ının normal genişliğine kasıtlı olarak SIĞMASIN diye — yatay kaydırmayı gerçekten tetiklemek için. */
const wideData: WideDataType[] = [
  { id: "1", name: "Aykut Yılmaz", age: 32, city: "İstanbul", status: "Aktif", email: "aykut@example.com", phone: "0532 111 22 33", department: "Mühendislik", joinDate: "12.03.2021" },
  { id: "2", name: "Deniz Kaya", age: 28, city: "Ankara", status: "Aktif", email: "deniz@example.com", phone: "0533 222 33 44", department: "Tasarım", joinDate: "05.07.2022" },
  { id: "3", name: "Elif Şahin", age: 41, city: "İzmir", status: "Pasif", email: "elif@example.com", phone: "0534 333 44 55", department: "Satış", joinDate: "20.11.2019" },
];

const WithActionsStory = () => {
  const [data, setData] = useState(wideData);

  const columns: ColumnDef<WideDataType>[] = [
    { header: "İsim", columnName: "name" },
    { header: "Yaş", columnName: "age", align: "end" },
    { header: "Şehir", columnName: "city" },
    { header: "Durum", columnName: "status" },
    { header: "E-posta", columnName: "email" },
    { header: "Telefon", columnName: "phone" },
    { header: "Departman", columnName: "department" },
    { header: "Katılım Tarihi", columnName: "joinDate" },
    {
      header: "İşlemler",
      actions: {
        editRowInInline: {
          onChange: (updated) => setData((prev) => prev.map((row) => (row.id === updated.id ? updated : row))),
        },
        deleteRow: (id) => setData((prev) => prev.filter((row) => row.id !== id)),
      },
    },
  ];

  return <Table<WideDataType> data={data} columns={columns} />;
};

export const WithActions: Story = {
  name: "İşlem Sütunlu",
  ...storyDoc(
    "`actions.editRowInInline` satırı düzenlenebilir hücrelere çevirir. Sütunlar sığmadığında tablo yatay kaydırılır " +
      "— işlemler sütunu ikonlara göre DAR kalır (kullanıcı bulgusu: eskiden gereksiz yere genişti, başlık ikonlarla " +
      "aynı hizada değildi) ve kaydırma sırasında sağda sabit (`sticky`) kalır."
  ),
  render: () => <WithActionsStory />,
};

const responsiveColumns: ColumnDef<DataType>[] = [
  { header: "İsim", columnName: "name" },
  { header: "Yaş", columnName: "age", align: "end" },
  { header: "Şehir", columnName: "city" },
  { header: "Durum", columnName: "status" },
];

export const Accordion: Story = {
  name: "Duyarlı — Accordion",
  ...storyDoc(
    "`responsive=\"accordion\"` iken dar ekranda (`md` altı — Storybook'un viewport aracıyla mobil önizlemeye " +
      "geçin) tablo yerine her satır açılır/kapanır bir kart olarak gösterilir; geniş ekranda normal tablo kalır."
  ),
  args: {
    data: initialData,
    columns: responsiveColumns,
    responsive: "accordion",
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
      "sayfa başına satır sayısı seçilebilir."
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
      "çağrısı vb.); burada gösterim amaçlı yerel diziden simüle edildi."
  ),
  render: () => <PaginationServerStory />,
};
