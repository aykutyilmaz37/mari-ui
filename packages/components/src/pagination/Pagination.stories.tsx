/**
 * Storybook CSF3'te `render` obje property'si Storybook tarafından gerçek
 * bir React function component GİBİ çağrılır (hook kuralları geçerlidir) —
 * ama `eslint-plugin-react-hooks`ın adlandırma sezgisi obje property'lerini
 * component olarak TANIMIYOR, bu yüzden burada yanlış pozitif üretiyor.
 * `render`i ayrı bir component'e çıkarmak "Show code" panelini anlamsız
 * kılıyordu (Faz 13.5 kullanıcı bulgusu) — bilinçli olarak devre dışı.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { baseSizeArgType, classNameArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";

const meta: Meta<typeof Pagination> = {
  title: "Navigasyon/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Sayfalanmış bir veri kümesinde gezinme kontrolü. Controlled (`currentPage` + `onPageChange`) ya da " +
            "uncontrolled (`defaultPage`) kullanılabilir. Görünür sayfa listesi sabit sayıda slottan oluşur — sayfa " +
            "değiştikçe bileşenin genişliği zıplamaz.",
          whenToUse: [
            "Bir liste/tablo çok fazla satır içerdiğinde, tek seferde küçük bir dilimini gösterip geri kalanına gezinme sağlamak için.",
            "Kullanıcının belirli bir sayfaya doğrudan gitmesi gerekiyorsa (`showQuickJumper`).",
          ],
          whenNotToUse: ["Akış tarzı içerikte (sosyal akış, bildirimler) — \"Daha fazla yükle\" veya sonsuz kaydırma daha uygundur."],
          a11y:
            "`<nav aria-label=\"Sayfalama\">` içinde bir `<ul>` listesi. Aktif sayfa `aria-current=\"page\"` taşır; tüm " +
            "düğmelerin açıklayıcı `aria-label`'ı vardır. Kenardaki Önceki/Sonraki düğmeleri `disabled` yerine " +
            "`aria-disabled` kullanır — son sayfaya ulaşıldığında klavye odağı kaybolmaz. **Not:** Table'ın sayfalama " +
            "kontrolü (`TablePagination`) bu component'i sarmalar.",
        }),
      },
    },
  },
  argTypes: {
    currentPage: { control: false, description: "Aktif sayfa (1 tabanlı). Verilirse controlled.", table: { category: "Durum" } },
    defaultPage: { control: false, description: "Uncontrolled modda ilk sayfa. Varsayılan: `1`.", table: { category: "Durum" } },
    pageSize: { control: false, description: "Sayfa başına öğe. Verilirse controlled.", table: { category: "Durum" } },
    defaultPageSize: { control: false, description: "Uncontrolled ilk sayfa boyutu. Varsayılan: `10`.", table: { category: "Durum" } },
    totalItems: { control: "number", description: "Toplam öğe sayısı — toplam sayfa buradan hesaplanır." },
    onPageChange: { description: "`(page, pageSize)` — sayfa gerçekten değiştiğinde çağrılır.", table: { category: "Olaylar" } },
    onPageSizeChange: { description: "`(pageSize, page)` — `page`, ilk görünen kaydı koruyan yeni sayfadır.", table: { category: "Olaylar" } },
    showSizeChanger: { control: "boolean", description: "Sayfa boyutu seçicisi. Varsayılan: `onPageSizeChange` verildiyse açık." },
    pageSizeOptions: { control: "object", description: "Varsayılan: `[10, 20, 50, 100, 1000]`." },
    showTotal: { control: "boolean", description: "`true` veya `(total, [start, end]) => ReactNode`." },
    showQuickJumper: { control: "boolean", description: "`Git [ ]` alanı — sayfa numarası yazıp Enter." },
    simple: { control: "boolean", description: "Sadece `‹ [3] / 10 ›` — dar alanlar için." },
    siblingCount: { control: { type: "number", min: 0, max: 3 }, description: "Aktif sayfanın iki yanındaki komşu sayısı. Varsayılan: `1`." },
    hideOnSinglePage: { control: "boolean", description: "Tek sayfa varsa hiçbir şey render etmez." },
    align: { control: "inline-radio", options: ["start", "center", "end", "between"], description: "Varsayılan: `between`.", table: { category: "Konum" } },
    size: baseSizeArgType,
    color: colorArgType,
    variant: { control: "inline-radio", options: ["outline", "soft", "solid"], description: "Aktif sayfa görünümü. Varsayılan: `outline`.", table: { category: "Görünüm" } },
    disabled: disabledArgType,
    className: classNameArgType,
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { totalItems: 500, showTotal: true, showSizeChanger: true, showQuickJumper: false, size: "md", color: "primary", variant: "outline" },
};

export const Basic: Story = {
  name: "Temel (Controlled)",
  ...storyDoc(
    "Sayfa değiştikçe düğme sayısı sabit kalır (7 slot); \"…\" tek bir sayfayı asla gizlemez. \"…\" üzerine gelince " +
      "çift ok belirir ve 5 sayfa atlar.",
    `
const [page, setPage] = useState(6);

<Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} />`
  ),
  render: () => {
    const [page, setPage] = useState(6);
    return <Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} />;
  },
};

export const FewPages: Story = {
  name: "Az Sayfa",
  ...storyDoc(
    "Toplam sayfa 7 veya daha azsa tüm sayfalar gösterilir.",
    `
const [page, setPage] = useState(1);

<Pagination currentPage={page} pageSize={10} totalItems={50} onPageChange={setPage} />`
  ),
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} pageSize={10} totalItems={50} onPageChange={setPage} />;
  },
};

export const MoreSiblings: Story = {
  name: "Daha Fazla Komşu",
  ...storyDoc(
    "`siblingCount={2}` — aktif sayfanın iki yanında 2'şer sayfa (9 slot, ant.design varsayılanı).",
    `
const [page, setPage] = useState(10);

<Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} siblingCount={2} />`
  ),
  render: () => {
    const [page, setPage] = useState(10);
    return <Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} siblingCount={2} />;
  },
};

export const WithTotalAndPageSize: Story = {
  name: "Kayıt Bilgisi + Sayfa Boyutu",
  ...storyDoc(
    "`showTotal` + `onPageSizeChange` — Table'ın sayfalama kontrolüyle aynı görünüm. Sayfa boyutu değiştiğinde " +
      "baktığınız ilk kayıt görünür kalır (sayfa 1'e sıfırlanmaz, aralık dışına da düşmez).",
    `
const [page, setPage] = useState(8);
const [pageSize, setPageSize] = useState(10);

<Pagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={247}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  showTotal
/>`
  ),
  render: () => {
    const [page, setPage] = useState(8);
    const [pageSize, setPageSize] = useState(10);
    return <Pagination currentPage={page} pageSize={pageSize} totalItems={247} onPageChange={setPage} onPageSizeChange={setPageSize} showTotal />;
  },
};

export const QuickJumper: Story = {
  name: "Hızlı Atlama",
  ...storyDoc(
    "`showQuickJumper` — sayfa numarasını yazıp Enter'a basın. Aralık dışı değerler sınırlanır.",
    `
const [page, setPage] = useState(1);

<Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} showQuickJumper showSizeChanger />`
  ),
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} pageSize={10} totalItems={500} onPageChange={setPage} showQuickJumper showSizeChanger />;
  },
};

export const CustomTotal: Story = {
  name: "Özel Toplam Metni",
  ...storyDoc(
    "`showTotal` bir fonksiyon da olabilir: `(total, [start, end]) => ReactNode`.",
    `
const [page, setPage] = useState(1);

<Pagination
  currentPage={page}
  pageSize={20}
  totalItems={85}
  onPageChange={setPage}
  showTotal={(total, [start, end]) => \`\${total} üründen \${start}-\${end} arası\`}
/>`
  ),
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        currentPage={page}
        pageSize={20}
        totalItems={85}
        onPageChange={setPage}
        showTotal={(total, [start, end]) => `${total} üründen ${start}-${end} arası`}
      />
    );
  },
};

export const Simple: Story = {
  name: "Simple",
  ...storyDoc(
    "`simple` — dar alanlar için `‹ [3] / 10 ›`. Alana sayfa yazıp Enter'a basılabilir. Ayrıca vermeniz gerekmeyebilir: " +
      "Pagination kendi genişliğini izler, sayfa listesi sığmazsa önce komşu sayısını azaltır, hiç sığmazsa (ör. 320px'te " +
      "`lg`) kendiliğinden bu görünüme geçer.",
    `
const [page, setPage] = useState(3);

<Pagination simple currentPage={page} pageSize={10} totalItems={95} onPageChange={setPage} />`
  ),
  render: () => {
    const [page, setPage] = useState(3);
    return <Pagination simple currentPage={page} pageSize={10} totalItems={95} onPageChange={setPage} />;
  },
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "`size` — `sm` / `md` / `lg`.",
    `
<Pagination size="sm" totalItems={200} showSizeChanger />
<Pagination size="md" totalItems={200} showSizeChanger />
<Pagination size="lg" totalItems={200} showSizeChanger />`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      {/* Sayfada birden çok sayfalama varsa her biri ayrı ad taşımalı (axe landmark-unique). */}
      <Pagination size="sm" defaultPage={4} totalItems={200} showSizeChanger align="start" aria-label="Sayfalama (sm)" />
      <Pagination size="md" defaultPage={4} totalItems={200} showSizeChanger align="start" aria-label="Sayfalama (md)" />
      <Pagination size="lg" defaultPage={4} totalItems={200} showSizeChanger align="start" aria-label="Sayfalama (lg)" />
    </div>
  ),
};

export const Variants: Story = {
  name: "Aktif Sayfa Görünümü",
  ...storyDoc(
    "`variant` — `outline` (varsayılan) / `soft` / `solid`; `color` ile rol değiştirilebilir.",
    `
<Pagination variant="outline" totalItems={100} />
<Pagination variant="soft" totalItems={100} />
<Pagination variant="solid" totalItems={100} />
<Pagination variant="solid" color="accent" totalItems={100} />`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      <Pagination variant="outline" defaultPage={3} totalItems={100} align="start" aria-label="Sayfalama (outline)" />
      <Pagination variant="soft" defaultPage={3} totalItems={100} align="start" aria-label="Sayfalama (soft)" />
      <Pagination variant="solid" defaultPage={3} totalItems={100} align="start" aria-label="Sayfalama (solid)" />
      <Pagination variant="solid" color="accent" defaultPage={3} totalItems={100} align="start" aria-label="Sayfalama (solid, accent)" />
    </div>
  ),
};

export const Disabled: Story = {
  name: "Durumlar",
  ...storyDoc("`disabled` — tüm kontroller etkileşimsiz.", `<Pagination disabled totalItems={100} showSizeChanger />`),
  render: () => <Pagination disabled defaultPage={3} totalItems={100} showSizeChanger />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — toplam kayıt sayısı henüz gelmemişken: her düğme kendi kare kutusunda, kayıt bilgisi/seçici/atlama alanı " +
      "kendi genişliğinde yer tutucu. Gerçek kontroller görünmez olarak yerinde kaldığı için yüklenince zıplama olmaz; " +
      "iskeletteyken hiçbir yol sayfa değiştirmez. `Table`ın `skeleton`'ı da bunu kullanır.",
    `
<Pagination
  skeleton={!data}
  currentPage={page}
  pageSize={pageSize}
  totalItems={data?.total ?? 0}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  showTotal
  showQuickJumper
/>`
  ),
  render: () => {
    const [page, setPage] = useState(6);
    return (
      <SkeletonDemo>
        {(skeleton) => (
          <Pagination skeleton={skeleton} currentPage={page} pageSize={10} totalItems={195} onPageChange={setPage} onPageSizeChange={() => {}} showTotal showQuickJumper />
        )}
      </SkeletonDemo>
    );
  },
};
