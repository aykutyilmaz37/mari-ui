/**
 * Storybook CSF3'te `render` obje property'si Storybook tarafından gerçek
 * bir React function component GİBİ çağrılır (hook kuralları geçerlidir) —
 * ama `eslint-plugin-react-hooks`ın adlandırma sezgisi obje property'lerini
 * (isim büyük harfle başlamıyor/`use` ile başlamıyor) component olarak
 * TANIMIYOR, bu yüzden burada yanlış pozitif üretiyor. `render`i ayrı,
 * büyük harfli bir component'e çıkarmak yerine (bkz. Faz 13.5 kullanıcı
 * bulgusu: Storybook'un "Show code" paneli o zaman `<HelperComponent />`
 * gibi anlamsız bir referans gösteriyordu, gerçek kullanım kodunu değil)
 * bilinçli olarak devre dışı bırakılıyor.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";
import { componentDoc, storyDoc } from "../lib/storyMeta";

const meta: Meta<typeof Pagination> = {
  title: "Navigasyon/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Sayfalanmış bir veri kümesinde gezinme kontrolü. Tamamen controlled — `currentPage` ve `onPageChange` zorunludur, dahili state tutmaz.",
          whenToUse: ["Bir liste/tablo çok fazla satır içerdiğinde, tek seferde küçük bir dilimini gösterip geri kalanına gezinme sağlamak için."],
          a11y:
            "Aktif sayfa düğmesi `aria-current=\"page\"` taşır; tüm düğmeler `aria-label` ile açıklayıcı isimlere " +
            "sahiptir (\"3. sayfa\", \"Önceki sayfa\" vb.). Hook kullanmaz, sunucu bileşeni olarak render edilebilir. " +
            "**Not:** Table component'inin kendi sayfalama kontrolü (`TablePagination`) bu component'i sarmalar — " +
            "sayfa-numarası/ellipsis mantığı tek bir yerde yaşar.",
        }),
      },
    },
  },
  argTypes: {
    currentPage: { control: "number", description: "Aktif sayfa (1 tabanlı)." },
    pageSize: { control: "number", description: "Sayfa başına öğe sayısı." },
    totalItems: { control: "number", description: "Toplam öğe sayısı — toplam sayfa buradan hesaplanır." },
    onPageChange: { description: "Bir sayfa numarasına tıklandığında çağrılır." },
    showTotal: { control: "boolean", description: "\"1-10 / 95 kayıt\" bilgisini sol tarafta gösterir. Varsayılan: `false`." },
    onPageSizeChange: { description: "Verilirse sağ tarafta \"Sayfa başına\" seçici render edilir." },
    pageSizeOptions: { control: false, description: "`onPageSizeChange` ile birlikte kullanılır. Varsayılan: `[10, 20, 50, 100, 1000]`." },
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

/**
 * Faz 13.5 kullanıcı bulgusu: story'ler eskiden ayrı, adlandırılmış bir
 * `InteractivePagination` yardımcı component'ine yönlendiriyordu — Storybook'un
 * "Show code" paneli bu durumda JSX'i açamayıp `<InteractivePagination />`
 * gibi ANLAMSIZ, tüketiciye hiçbir şey öğretmeyen kod gösteriyordu. Artık her
 * story kendi `useState`'ini DOĞRUDAN `render` callback'inin içinde tutuyor —
 * "Show code" bu sayede gerçek, kopyalanabilir kullanım kodunu gösteriyor.
 */
export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} pageSize={10} totalItems={95} onPageChange={setPage} />;
  },
};

export const MiddlePage: Story = {
  name: "Orta Sayfa",
  ...storyDoc("Geçerli sayfa ortadayken hem sol hem sağ ellipsis görünür."),
  render: () => {
    const [page, setPage] = useState(5);
    return <Pagination currentPage={page} pageSize={10} totalItems={95} onPageChange={setPage} />;
  },
};

export const LastPage: Story = {
  name: "Son Sayfa",
  ...storyDoc("Son sayfadayken \"Sonraki sayfa\" düğmesi devre dışı kalır."),
  render: () => {
    const [page, setPage] = useState(10);
    return <Pagination currentPage={page} pageSize={10} totalItems={95} onPageChange={setPage} />;
  },
};

export const FewPages: Story = {
  name: "Az Sayfa (Ellipsis Yok)",
  ...storyDoc("Toplam sayfa sayısı azken tüm sayfalar gösterilir, ellipsis'e gerek kalmaz."),
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} pageSize={10} totalItems={40} onPageChange={setPage} />;
  },
};

export const WithTotalAndPageSize: Story = {
  name: "Kayıt Bilgisi + Sayfa Boyutu",
  ...storyDoc(
    "`showTotal` + `onPageSizeChange` birlikte — Table'ın sayfalama kontrolüyle aynı görünüm. Sayfa boyutu " +
      "değiştirildiğinde sayfa 1'e döner."
  ),
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    return (
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={247}
        onPageChange={setPage}
        showTotal
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    );
  },
};
