import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, classNameArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Divider } from "./Divider";
import type { DividerProps } from "./types";

const meta: Meta<typeof Divider> = {
  title: "Genel/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "İçerik bloklarını görsel olarak ayıran ince bir çizgi. Yatayda bir başlık/etiket taşıyabilir, dikeyde satır içi " +
            "öğeleri böler. Komşu içeriğe yapışmaması için kendi varsayılan boşluğu vardır (yatayda `my-4`, dikeyde `mx-3`) — " +
            "`className` ile ezilebilir. Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
          whenToUse: [
            "Bir sayfa veya kartın içindeki ilgisiz bölümleri görsel olarak ayırmak için.",
            "Bir bölümün başında kısa bir başlık göstermek için (`children` + `labelAlign`).",
            "Satır içi meta bilgileri (yazar · tarih · süre) veya araç çubuğu eylemlerini bölmek için (`orientation=\"vertical\"`).",
          ],
          whenNotToUse: [
            "Yapısal bir gruplama gerekiyorsa — `Card` veya `<fieldset>` semantik bir sınır oluşturur, Divider yalnızca çizgidir.",
            "Öğeler arasında yalnızca boşluk gerekiyorsa — `gap`/`margin` yeterli.",
          ],
          a11y:
            "Kök öğe `role=\"separator\"` taşır; dikey modda `aria-orientation=\"vertical\"` eklenir (yatay zaten varsayılan). " +
            "Odaklanabilir değildir — saf bir ayraçtır.",
        }),
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Yatay modda çizginin üzerinde gösterilecek etiket." },
    className: classNameArgType,
    lineStyle: { control: "select", options: ["solid", "dashed", "dotted"], description: "Çizgi stili.", table: { defaultValue: { summary: "solid" } } },
    orientation: { control: "select", options: ["horizontal", "vertical"], description: "Yön.", table: { defaultValue: { summary: "horizontal" } } },
    labelAlign: { control: "select", options: ["start", "center", "end"], description: "Yatay modda etiketin hizası.", table: { defaultValue: { summary: "center" } } },
    labelMargin: { control: "text", description: "Etiketin yaslandığı kenardan uzaklığı (start/end hizasında)." },
    plain: { control: "boolean", description: "`true` iken etiket soluk/nötr; `false` iken vurgulu (medium font).", table: { defaultValue: { summary: "true" } } },
    style: { control: false },
    size: baseSizeArgType,
    height: { control: "text", description: "Sadece dikey modda — `rem` önerilir; sayı verilirse `px` kabul edilir.", table: { defaultValue: { summary: "3rem" } } },
  },
};

export default meta;

export const Playground: StoryObj<DividerProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin — tam genişlikte bir bölüm ayracı."),
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <p className="text-mari-foreground">
          Hesap bilgileriniz aşağıda görüntüleniyor. Değişiklikleri kaydetmeden sayfadan ayrılırsanız düzenlemeleriniz
          kaybolur.
        </p>
        <Story />
        <p className="text-mari-neutral">Son güncelleme: 3 gün önce · Oturum: Chrome · İstanbul</p>
      </div>
    ),
  ],
  args: {
    children: "Tercihler",
    lineStyle: "solid",
    orientation: "horizontal",
    labelAlign: "center",
    plain: true,
  },
};

export const SectionSeparator: StoryObj = {
  name: "Bölüm Ayracı (etiketsiz)",
  ...storyDoc(
    "En yaygın kullanım: iki paragraf/blok arasına tam genişlikte sade bir çizgi. Etiket yok.",
    `<h3>Teslimat</h3>
<p>Siparişiniz 2–4 iş günü içinde kargoya verilir.</p>
<Divider />
<h3>İade</h3>
<p>Ürünü teslim aldıktan sonra 14 gün içinde koşulsuz iade edebilirsiniz.</p>`
  ),
  render: () => (
    <article className="w-full max-w-2xl text-mari-foreground">
      <h3 className="text-lg font-semibold">Teslimat</h3>
      <p className="mt-1 text-mari-neutral">Siparişiniz 2–4 iş günü içinde kargoya verilir. Kargo ücreti alıcıya aittir.</p>
      <Divider />
      <h3 className="text-lg font-semibold">İade</h3>
      <p className="mt-1 text-mari-neutral">Ürünü teslim aldıktan sonra 14 gün içinde koşulsuz iade edebilirsiniz.</p>
    </article>
  ),
};

export const LabeledSections: StoryObj = {
  name: "Başlıklı Bölümler (hizalama)",
  ...storyDoc(
    "Bir formu/listeyi bölümlere ayırmak için başlıklı divider. `labelAlign` etiketi ortaya (varsayılan), başa veya sona " +
      "yaslar — yaslanan kenardaki çizgi parçası kısalır.",
    `<Divider labelAlign="start">Profil</Divider>
<Divider>Bildirimler</Divider>
<Divider labelAlign="end" plain={false}>Tehlikeli Bölge</Divider>`
  ),
  render: () => (
    <div className="w-full max-w-2xl flex flex-col gap-8">
      <section>
        <Divider labelAlign="start">Profil</Divider>
        <p className="mt-2 text-mari-neutral">Ad, soyad ve herkese açık kullanıcı adınız.</p>
      </section>
      <section>
        <Divider>Bildirimler</Divider>
        <p className="mt-2 text-mari-neutral">E-posta ve anlık bildirim tercihleri.</p>
      </section>
      <section>
        <Divider labelAlign="end" plain={false}>
          Tehlikeli Bölge
        </Divider>
        <p className="mt-2 text-mari-neutral">Hesabı kalıcı olarak silme. `plain={false}` ile başlık vurgulanır.</p>
      </section>
    </div>
  ),
};

export const LineStyles: StoryObj = {
  name: "Çizgi Stilleri",
  ...storyDoc(
    "`solid` kalıcı/net ayrımlar için (varsayılan); `dashed` geçici veya taslak bir sınır için; `dotted` en hafif, " +
      "yalnızca hafif bir ipucu gereken yerde.",
    `<Divider lineStyle="solid" />
<Divider lineStyle="dashed" />
<Divider lineStyle="dotted" />`
  ),
  render: () => (
    <div className="w-full max-w-2xl flex flex-col gap-8 text-mari-foreground">
      <div>
        <p>Kayıtlı adresler</p>
        <Divider lineStyle="solid" />
        <p className="text-mari-neutral">Ev · İş · Fatura</p>
      </div>
      <div>
        <p>Yeni adres (kaydedilmedi)</p>
        <Divider lineStyle="dashed" />
        <p className="text-mari-neutral">Taslak — henüz onaylanmadı</p>
      </div>
      <div>
        <p>Önerilenler</p>
        <Divider lineStyle="dotted" />
        <p className="text-mari-neutral">Konumunuza göre otomatik doldurma</p>
      </div>
    </div>
  ),
};

export const VerticalInline: StoryObj = {
  name: "Dikey (satır içi)",
  ...storyDoc(
    "Satır içi meta bilgi ve araç çubuğu eylemlerini bölmek için. Yükseklik içeriğe göre ayarlanır (`height`). Dar ekranda satır kaydırmak için kapsayıcıya `flex-wrap` verin.",
    `<div className="flex flex-wrap items-center text-sm">
  <span>Ayşe Yılmaz</span>
  <Divider orientation="vertical" height="1rem" />
  <span>10 Eylül 2026</span>
  <Divider orientation="vertical" height="1rem" />
  <span>5 dk okuma</span>
</div>`
  ),
  render: () => (
    <div className="w-full max-w-2xl flex flex-col gap-6 text-mari-foreground">
      <div className="flex flex-wrap items-center gap-y-1 text-sm text-mari-neutral">
        <span>Ayşe Yılmaz</span>
        <Divider orientation="vertical" height="1rem" />
        <span>10 Eylül 2026</span>
        <Divider orientation="vertical" height="1rem" />
        <span>5 dk okuma</span>
        <Divider orientation="vertical" height="1rem" />
        <span>12 yorum</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <button type="button" className="px-2 py-1 text-mari-primary hover:underline">
          Düzenle
        </button>
        <Divider orientation="vertical" height="1.25rem" />
        <button type="button" className="px-2 py-1 text-mari-primary hover:underline">
          Kopyala
        </button>
        <Divider orientation="vertical" height="1.25rem" />
        <button type="button" className="px-2 py-1 text-mari-error hover:underline">
          Sil
        </button>
      </div>
    </div>
  ),
};

export const LongLabel: StoryObj = {
  name: "Uzun Etiket (mobil)",
  ...storyDoc(
    "Etiket kapsayıcıdan uzunsa kırılır ve ortalanır; iki yandaki çizgiler en az 1.5rem görünür kalır — 375px'te yatay kaydırma oluşmaz.",
    `<Divider>Siparişinizle birlikte sıkça satın alınan diğer ürünler</Divider>`
  ),
  render: () => (
    <div className="w-full max-w-xs rounded-lg border border-dashed border-mari-border px-3">
      <Divider>Siparişinizle birlikte sıkça satın alınan diğer ürünler</Divider>
    </div>
  ),
};

