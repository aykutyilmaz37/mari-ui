/**
 * Faz 16.4: gerçek senaryolar — rol yetkileri (Field + arama + açıklama),
 * e-posta alıcıları (oneWay sepet + özel satır), rapor sütunları (footer ile
 * varsayılana dönme), durumlar (boş/devre dışı/iskelet). "Show code" her
 * story'de `storyDoc`'un 2. argümanı. Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Field } from "../field";
import { Transfer } from "./Transfer";
import type { TransferItem } from "./types";

const meta: Meta<typeof Transfer> = {
  title: "Veri Girişi/Transfer",
  component: Transfer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "İki liste arasında öğe taşıtan kontrol: soldaki kaynakta işaretlenenler ok düğmesiyle sağdaki hedefe geçer (ve geri). " +
            "Başlıkta tümünü seç + sayaç, isteğe bağlı Türkçe/aksansız arama, Shift ile aralık seçimi. `oneWay` hedefi bir " +
            "\"seçilenler\" sepetine çevirir (satır başına kaldır). Dar ekranda listeler alt alta.",
          whenToUse: [
            "Uzun bir listeden birden çok öğe seçilirken seçilenlerin ayrıca, bütün olarak görülmesi gerekiyorsa (rol yetkileri, alıcılar, sütunlar).",
            "Seçimin sırası anlam taşıyorsa — hedef, taşınma sırasını korur.",
          ],
          whenNotToUse: [
            "Az sayıda seçenek — Checkbox grubu ya da çoklu Select yeterli ve daha az yer kaplar.",
            "Hiyerarşik veri — Tree (işaret kutulu) ya da TreeSelect.",
          ],
          a11y:
            "Bileşen `role=\"group\"` (Field etiketi adıdır); her liste başlığıyla adlandırılmış bir bölge, satırlar gerçek işaret " +
            "kutuları (Tab + Boşluk). Taşıma düğmelerinin adı eylemi söyler; seçim yokken `aria-disabled` (odak düğmede kalır). " +
            "Taşıma sonucu `role=\"status\"` ile duyurulur. oneWay'de bir satır kaldırılınca odak sonraki satıra geçer.",
        }),
      },
    },
  },
  argTypes: {
    dataSource: { control: false },
    targetKeys: { control: false },
    selectedKeys: { control: false },
    render: { control: false },
    footer: { control: false },
    filterOption: { control: false },
    onChange: { table: { category: "Olaylar" } },
    onSelectChange: { table: { category: "Olaylar" } },
    onSearch: { table: { category: "Olaylar" } },
    showSearch: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    oneWay: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    showSelectAll: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    listHeight: { control: "text", table: { defaultValue: { summary: "14rem" } } },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof Transfer>;

const CITIES: TransferItem[] = ["Adana", "Ankara", "Antalya", "Bursa", "Çanakkale", "Diyarbakır", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kayseri", "Konya", "Muğla", "Samsun", "Trabzon"].map((t) => ({ key: t, title: t }));

export const Playground: Story = {
  args: { dataSource: CITIES, defaultTargetKeys: ["İstanbul", "Ankara"], showSearch: true, titles: ["Şehirler", "Teslimat bölgesi"], "aria-label": "Teslimat bölgesi" },
};

/* ─────────────────────────── 1. Rol yetkileri ─────────────────────────── */

const PERMISSIONS: TransferItem[] = [
  { key: "orders.read", title: "Siparişleri görüntüle", description: "Liste ve sipariş detayı" },
  { key: "orders.edit", title: "Siparişleri düzenle", description: "Adres, not ve kargo bilgisi" },
  { key: "orders.refund", title: "İade başlat", description: "Ödeme sağlayıcıya iade isteği gönderir" },
  { key: "products.read", title: "Ürünleri görüntüle", description: "Katalog ve stok" },
  { key: "products.edit", title: "Ürünleri düzenle", description: "Fiyat, açıklama, görseller" },
  { key: "customers.read", title: "Müşterileri görüntüle", description: "İletişim ve sipariş geçmişi" },
  { key: "customers.export", title: "Müşteri verisini dışa aktar", description: "KVKK kaydı tutulur" },
  { key: "reports.read", title: "Raporları görüntüle", description: "Satış ve stok raporları" },
  { key: "settings.billing", title: "Faturalandırma ayarları", description: "Yalnız hesap sahibi", disabled: true },
];

export const RolePermissions: Story = {
  name: "Rol Yetkileri",
  ...storyDoc(
    "Field içinde: etiket grubun adı, ipucu açıklaması. Satırda açıklama, arama açık, düğmelerde metin. " +
      "Devre dışı satır (\"Yalnız hesap sahibi\") seçilemez ve taşınmaz.",
    `<Field label="Destek ekibi yetkileri" hint="Bu roldeki herkes seçilen işlemleri yapabilir.">
  <Transfer dataSource={permissions} targetKeys={keys} onChange={setKeys} titles={["Tüm yetkiler", "Role verilenler"]} operations={["Ekle", "Çıkar"]} showSearch />
</Field>`
  ),
  render: () => {
    const [keys, setKeys] = useState(["orders.read", "customers.read"]);
    return (
      <div className="max-w-3xl">
        <Field label="Destek ekibi yetkileri" hint="Bu roldeki herkes seçilen işlemleri yapabilir.">
          <Transfer dataSource={PERMISSIONS} targetKeys={keys} onChange={setKeys} titles={["Tüm yetkiler", "Role verilenler"]} operations={["Ekle", "Çıkar"]} showSearch listHeight="16rem" />
        </Field>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Alıcılar (oneWay) ─────────────────────────── */

const PEOPLE = [
  ["ayse", "Ayşe Demir", "ayse.demir@mari-ui.com"],
  ["mehmet", "Mehmet Kaya", "mehmet.kaya@mari-ui.com"],
  ["zeynep", "Zeynep Arslan", "zeynep.arslan@mari-ui.com"],
  ["can", "Can Öztürk", "can.ozturk@mari-ui.com"],
  ["elif", "Elif Şahin", "elif.sahin@mari-ui.com"],
  ["burak", "Burak Yıldız", "burak.yildiz@mari-ui.com"],
  ["selin", "Selin Aydın", "selin.aydin@mari-ui.com"],
  ["emre", "Emre Çelik", "emre.celik@mari-ui.com"],
];
const RECIPIENTS: TransferItem[] = PEOPLE.map(([key, name, email]) => ({ key: key!, title: name, description: email, searchText: `${name} ${email}` }));

export const Recipients: Story = {
  name: "E-posta Alıcıları (oneWay)",
  ...storyDoc(
    "`oneWay`: hedef bir sepet — işaret kutusu yok, her satırda kaldır, başlıkta \"Tümünü kaldır\". `render` ile avatar + " +
      "e-posta; `searchText` aramanın e-postada da çalışmasını sağlar.",
    `<Transfer oneWay showSearch dataSource={people} targetKeys={keys} onChange={setKeys} titles={["Ekip", "Alıcılar"]} render={(item) => <Person item={item} />} />`
  ),
  render: () => {
    const [keys, setKeys] = useState(["zeynep"]);
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <Transfer
          aria-label="Rapor alıcıları"
          oneWay
          showSearch
          searchPlaceholder="İsim ya da e-posta"
          dataSource={RECIPIENTS}
          targetKeys={keys}
          onChange={setKeys}
          titles={["Ekip", "Alıcılar"]}
          render={(item) => (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar size="sm" alt={String(item.title)} />
              <span className="min-w-0">
                <span className="block truncate">{item.title}</span>
                <span className="block truncate text-xs text-mari-muted">{item.description}</span>
              </span>
            </span>
          )}
        />
        <p className="text-sm text-mari-muted">Haftalık rapor {keys.length} kişiye gönderilecek.</p>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Rapor sütunları ─────────────────────────── */

const COLUMNS: TransferItem[] = [
  { key: "no", title: "Sipariş no", disabled: true },
  { key: "date", title: "Tarih" },
  { key: "customer", title: "Müşteri" },
  { key: "city", title: "Şehir" },
  { key: "items", title: "Ürün adedi" },
  { key: "total", title: "Tutar" },
  { key: "payment", title: "Ödeme yöntemi" },
  { key: "cargo", title: "Kargo firması" },
  { key: "status", title: "Durum" },
];
const DEFAULT_COLUMNS = ["no", "date", "customer", "total", "status"];

export const ReportColumns: Story = {
  name: "Rapor Sütunları",
  ...storyDoc(
    "Hedef taşınma sırasını korur — yeni eklenen sütun tablonun sonuna gelir. `footer` her listenin altına eylem koyar; " +
      "\"Sipariş no\" zorunlu (devre dışı, hedeften çıkarılamaz).",
    `<Transfer dataSource={columns} targetKeys={keys} onChange={setKeys} titles={["Kullanılabilir", "Tabloda"]}
  footer={({ direction }) => direction === "right" && <Button size="sm" variant="ghost" onClick={reset}>Varsayılana dön</Button>} />`
  ),
  render: () => {
    const [keys, setKeys] = useState(DEFAULT_COLUMNS);
    const titleOf = (k: string) => COLUMNS.find((c) => c.key === k)?.title;
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Transfer
          aria-label="Rapor sütunları"
          dataSource={COLUMNS}
          targetKeys={keys}
          onChange={setKeys}
          titles={["Kullanılabilir", "Tabloda"]}
          listHeight="12rem"
          footer={({ direction }) =>
            direction === "right" ? (
              <Button size="sm" variant="ghost" onClick={() => setKeys(DEFAULT_COLUMNS)}>
                Varsayılana dön
              </Button>
            ) : null
          }
        />
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- yatay kaydırılan bölge klavyeyle de kaydırılabilsin */}
        <div role="region" aria-label="Tablo önizlemesi" tabIndex={0} className="overflow-x-auto rounded-lg border border-mari-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-mari-surface-alt">
              <tr>
                {keys.map((k) => (
                  <th key={k} className="px-3 py-2 font-medium whitespace-nowrap">
                    {titleOf(k)}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Durumlar ─────────────────────────── */

export const States: Story = {
  name: "Durumlar",
  ...storyDoc(
    "Boş kaynak (`notFoundContent`) ve devre dışı.",
    `<Transfer dataSource={[]} notFoundContent="Henüz ürün yok" />
<Transfer dataSource={items} defaultTargetKeys={["İzmir"]} disabled />`
  ),
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <Transfer aria-label="Boş" dataSource={[]} notFoundContent="Henüz ürün yok" listHeight="8rem" />
      <Transfer aria-label="Devre dışı" dataSource={CITIES.slice(0, 5)} defaultTargetKeys={["Bursa"]} disabled listHeight="8rem" />
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Transfer dataSource={permissions} showSearch skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <Transfer aria-label="Yetkiler" dataSource={PERMISSIONS} defaultTargetKeys={["orders.read"]} showSearch listHeight="12rem" skeleton={skeleton} />}</SkeletonDemo>,
};
