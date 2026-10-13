import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDownIcon, CopyIcon, DownloadIcon, LogOutIcon, MoreVerticalIcon, PencilIcon, SettingsIcon, Share2Icon, Trash2Icon, UserIcon } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";
import { DropdownDivider, DropdownItem, DropdownLabel } from "./_components/DropdownItem";
import { Avatar } from "../avatar";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";

/**
 * Not: bu story dosyası eskiden gerçek API ile uyuşmuyordu (`trigger`/
 * `placement`'ı doğrudan `Dropdown`a prop olarak geçiriyordu, ama gerçek
 * API compound-component deseni: `<Dropdown><DropdownTrigger/>
 * <DropdownContent/></Dropdown>`). Düzeltildi.
 */
const meta: Meta<typeof Dropdown> = {
  title: "Navigasyon/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir tetikleyiciye tıklandığında (veya `hover` ile üzerine gelindiğinde) açılan içerik paneli. " +
            "Compound-component deseni kullanır: `<Dropdown><DropdownTrigger/><DropdownContent/></Dropdown>`. " +
            "`Dropdown` kendi state Provider'ını içine gömer — ayrıca sarmalamanıza gerek yok.",
          whenToUse: [
            "Bir hesap menüsü, satır işlemleri (\"⋮\") veya birkaç ilgili aksiyon içeren herhangi bir panel için.",
            "İçerik gerçek bir `menuitem` listesi değil, herhangi bir React node olabilir (bkz. Kullanıcı Menüsü story'si).",
          ],
          whenNotToUse: [
            "Sayfanın ana gezinmesi için — `BasicMenu`/`MegaMenu`/`Sidebar` kullanın.",
            "Bir değer SEÇTİRİYORSANIZ (form alanı) — seçili değeri gösteren bir seçim kontrolü daha uygundur.",
          ],
          a11y:
            "Tetikleyici gerçek bir `<button>`dır — Tab ile odaklanılıp Enter/Boşluk ile açılıp kapatılabilir " +
            "(`hover` modunda bile); **↓** açıp ilk öğeye, **↑** açıp son öğeye odaklanır. Panelde **↑/↓** öğeler " +
            "arasında gezer (devre dışıları atlar, sarar), **Home/End** uçlara gider, bir **harf** o harfle başlayan " +
            "sonraki öğeye atlar. Panel açıkken **Escape** kapatır, panelin **dışına tıklamak** da kapatır. " +
            "İçerik keyfi olduğundan (gerçek `menuitem`ler değil) sarmalayıcıya `role=\"menu\"` UYGULANMAZ. " +
            "`placement` 12 değerlidir (`bottom-start`, `bottom-end`, `left-start` …), varsayılan `bottom-end`: `-start`/`-end` panelin tetikleyicinin hangi kenarıyla hizalanacağını belirler; `arrow` panele tetikleyiciyi gösteren bir üçgen ekler, " +
            "yer yoksa panel karşı yöne çevrilir ve viewport dışına taşmaz. **Konumlama:** panel `document.body`'e portal edilir ve `position: fixed` ile konumlanır — " +
            "Storybook docs canvas'ı gibi `overflow: hidden` olan bir atanın İÇİNDE render edilse bile KIRPILMAZ " +
            "(Faz 13.5 kullanıcı bulgusu — eskiden panel tetikleyicisini saran `relative` kutunun İÇİNDE " +
            "`position: absolute` idi, bu kutu dar bir kapsayıcının içindeyse panel kırpılıyordu).",
        }),
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Playground: Story = {
  ...storyDoc("Tetikleyici + panel; kontrollerden üzerine gelince açılma (`hover`) ve iskelet."),
  args: { hover: false, skeleton: false },
  render: (args) => (
    <Dropdown {...args}>
      <DropdownTrigger className="rounded-md border border-mari-border px-3 py-1.5 text-sm">Menü</DropdownTrigger>
      <DropdownContent className="w-48">
        <DropdownItem>Düzenle</DropdownItem>
        <DropdownItem>Kopyala</DropdownItem>
        <DropdownDivider />
        <DropdownItem danger>Sil</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const UserMenu: Story = {
  name: "Kullanıcı Menüsü",
  ...storyDoc(
    "Gerçek bir kullanım örneği: avatar tetikleyici + hesap işlemleri (Profilim, Ayarlar, Çıkış Yap).",
    `
<Dropdown>
  <DropdownTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-mari-surface-alt">
    <Avatar size="sm" icon={<UserIcon size={16} />} />
    <span className="text-sm font-medium">Aykut Yılmaz</span>
    <ChevronDownIcon size={16} className="text-mari-muted" />
  </DropdownTrigger>
  <DropdownContent placement="bottom-start" arrow className="w-56">
    <DropdownLabel>aykut@example.com</DropdownLabel>
    <DropdownItem icon={<UserIcon />} href="/profil">Profilim</DropdownItem>
    <DropdownItem icon={<SettingsIcon />} href="/ayarlar">Ayarlar</DropdownItem>
    <DropdownDivider />
    <DropdownItem icon={<LogOutIcon />} danger onClick={signOut}>
      Çıkış Yap
    </DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <Dropdown>
      <DropdownTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-mari-surface-alt">
        <Avatar size="sm" icon={<UserIcon size={16} />} />
        <span className="text-sm font-medium">Aykut Yılmaz</span>
        <ChevronDownIcon size={16} className="text-mari-muted" />
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" arrow className="w-56">
        <DropdownLabel>aykut@example.com</DropdownLabel>
        <DropdownItem icon={<UserIcon />}>Profilim</DropdownItem>
        <DropdownItem icon={<SettingsIcon />}>Ayarlar</DropdownItem>
        <DropdownDivider />
        <DropdownItem icon={<LogOutIcon />} danger>
          Çıkış Yap
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const RowActions: Story = {
  name: "Satır İşlemleri (Kebab Menü)",
  ...storyDoc(
    "Gerçek bir kullanım örneği: bir tablo/liste satırının sağındaki \"⋮\" işlem menüsü.",
    `
<Dropdown>
  <DropdownTrigger aria-label="Satır işlemleri" className="rounded-full p-1.5 text-mari-muted hover:bg-mari-surface-alt">
    <MoreVerticalIcon size={16} />
  </DropdownTrigger>
  <DropdownContent arrow={{ pointAtCenter: true }} offset={6} className="w-40">
    <DropdownItem icon={<PencilIcon />}>Düzenle</DropdownItem>
    <DropdownItem icon={<CopyIcon />}>Kopyala</DropdownItem>
    <DropdownDivider />
    <DropdownItem icon={<Trash2Icon />} danger>Sil</DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <div className="flex w-72 items-center justify-between rounded-md border border-mari-border px-3 py-1.5">
      <span className="text-sm">rapor-2026-q1.pdf</span>
      <Dropdown>
        <DropdownTrigger aria-label="Satır işlemleri" className="rounded-full p-1.5 text-mari-muted hover:bg-mari-surface-alt hover:text-mari-foreground">
          <MoreVerticalIcon size={16} />
        </DropdownTrigger>
        <DropdownContent arrow={{ pointAtCenter: true }} offset={6} className="w-40">
          <DropdownItem icon={<PencilIcon />}>Düzenle</DropdownItem>
          <DropdownItem icon={<CopyIcon />}>Kopyala</DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<Trash2Icon />} danger>
            Sil
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
};

export const WithArrow: Story = {
  name: "Ok (Üçgen) ile",
  ...storyDoc(
    "`arrow` — panele tetikleyiciyi gösteren küçük bir üçgen ekler; ok, panelin hizalandığı kenardan sabit 12px içeride durur (ant.design gibi). " +
      "Küçük tetikleyicilerde `arrow={{ pointAtCenter: true }}` paneli, ok tetikleyicinin tam ortasını gösterecek şekilde kaydırır.",
    `
<Dropdown>
  <DropdownTrigger color="primary" variant="outline">bottom-start</DropdownTrigger>
  <DropdownContent placement="bottom-start" arrow className="w-48">
    <DropdownItem>1. seçenek</DropdownItem>
    <DropdownItem>2. seçenek</DropdownItem>
  </DropdownContent>
</Dropdown>

{/* Küçük (ikon) tetikleyici: ok tetikleyicinin ortasını göstersin */}
<Dropdown>
  <DropdownTrigger aria-label="Diğer işlemler"><MoreVerticalIcon /></DropdownTrigger>
  <DropdownContent placement="bottom-end" arrow={{ pointAtCenter: true }}>
    <DropdownItem>Düzenle</DropdownItem>
    <DropdownItem>Sil</DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <div className="flex flex-col gap-24 py-8">
      <div className="flex flex-wrap items-start gap-x-16">
        {(["bottom-start", "bottom", "bottom-end"] as const).map((placement) => (
          <Dropdown key={placement}>
            <DropdownTrigger color="primary" variant="outline" className="w-32">
              {placement}
            </DropdownTrigger>
            <DropdownContent placement={placement} arrow className="w-48">
              <DropdownItem>1. seçenek</DropdownItem>
              <DropdownItem>2. seçenek</DropdownItem>
              <DropdownItem>3. seçenek</DropdownItem>
            </DropdownContent>
          </Dropdown>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-x-16">
        {(["bottom-start", "bottom-end"] as const).map((placement) => (
          <Dropdown key={placement}>
            <DropdownTrigger aria-label={`${placement} ortayı gösteren`} className="rounded-full p-1.5 text-mari-muted hover:bg-mari-surface-alt hover:text-mari-foreground">
              <MoreVerticalIcon size={16} />
            </DropdownTrigger>
            <DropdownContent placement={placement} arrow={{ pointAtCenter: true }} className="w-40">
              <DropdownItem>1. seçenek</DropdownItem>
              <DropdownItem>2. seçenek</DropdownItem>
            </DropdownContent>
          </Dropdown>
        ))}
      </div>
    </div>
  ),
};

export const Hoverable: Story = {
  name: "Hover ile",
  ...storyDoc(
    "`hover` prop'uyla üzerine gelince açılır — yine de tetikleyici gerçek bir düğme olduğundan klavyeyle de açılıp kapatılabilir.",
    `
<Dropdown hover>
  <DropdownTrigger color="neutral" variant="soft">Üzerine Gel</DropdownTrigger>
  <DropdownContent placement="bottom" className="w-48 p-3">
    Hover ile açılan içerik
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <Dropdown hover>
      <DropdownTrigger color="neutral" variant="soft">
        Üzerine Gel
      </DropdownTrigger>
      <DropdownContent placement="bottom" className="w-48 p-3">
        Hover ile açılan içerik
      </DropdownContent>
    </Dropdown>
  ),
};

export const CloseBehaviors: Story = {
  name: "Kapanma Davranışları",
  ...storyDoc(
    "Escape tuşu ve panelin dışına tıklamak paneli kapatır (Faz 13.5 kullanıcı bulgusu — eskiden bunların hiçbiri yoktu).",
    `
<Dropdown>
  <DropdownTrigger color="primary" variant="solid">Menüyü Aç</DropdownTrigger>
  <DropdownContent placement="bottom" className="w-48 p-3">
    Escape veya dışarı tıklama ile kapanır.
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-mari-muted">Açtıktan sonra Escape'e basın veya dışarı tıklayın.</p>
      <Dropdown>
        <DropdownTrigger color="primary" variant="solid">
          Menüyü Aç
        </DropdownTrigger>
        <DropdownContent placement="bottom" className="w-48 p-3">
          Escape veya dışarı tıklama ile kapanır.
        </DropdownContent>
      </Dropdown>
    </div>
  ),
};

export const KeyboardAndShortcuts: Story = {
  name: "Kısayollu Menü (Klavye)",
  ...storyDoc(
    "Bir dosya işlemleri menüsü: `DropdownLabel` grup başlıkları, `extra` ile sağda klavye kısayolları. " +
      "Tetikleyiciye odaklanıp **↓** ile açın; **↑/↓**, **Home/End** ve harf tuşlarıyla (ör. **S** → Sil) gezinin.",
    `
<Dropdown>
  <DropdownTrigger color="neutral" variant="outline">
    Dosya <ChevronDownIcon size={16} />
  </DropdownTrigger>
  <DropdownContent placement="bottom-start" className="w-64">
    <DropdownLabel>Düzen</DropdownLabel>
    <DropdownItem icon={<PencilIcon />} extra="⌘E">Yeniden adlandır</DropdownItem>
    <DropdownItem icon={<CopyIcon />} extra="⌘D">Çoğalt</DropdownItem>
    <DropdownDivider />
    <DropdownLabel>Paylaş</DropdownLabel>
    <DropdownItem icon={<Share2Icon />} extra="⌘⇧S">Bağlantı paylaş</DropdownItem>
    <DropdownItem icon={<DownloadIcon />} href="/indir/rapor.pdf">İndir</DropdownItem>
    <DropdownDivider />
    <DropdownItem icon={<Trash2Icon />} extra="⌫" danger>Sil</DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <Dropdown>
      <DropdownTrigger color="neutral" variant="outline" className="inline-flex items-center gap-1.5">
        Dosya <ChevronDownIcon size={16} />
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" className="w-64">
        <DropdownLabel>Düzen</DropdownLabel>
        <DropdownItem icon={<PencilIcon />} extra="⌘E">
          Yeniden adlandır
        </DropdownItem>
        <DropdownItem icon={<CopyIcon />} extra="⌘D">
          Çoğalt
        </DropdownItem>
        <DropdownDivider />
        <DropdownLabel>Paylaş</DropdownLabel>
        <DropdownItem icon={<Share2Icon />} extra="⌘⇧S">
          Bağlantı paylaş
        </DropdownItem>
        <DropdownItem icon={<DownloadIcon />} href="#indir">
          İndir
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem icon={<Trash2Icon />} extra="⌫" danger>
          Sil
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

function DropdownSkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <Dropdown skeleton={skeleton}>
          <DropdownTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-mari-surface-alt">
            <Avatar size="sm" icon={<UserIcon size={16} />} />
            <span className="text-sm font-medium">Aykut Yılmaz</span>
            <ChevronDownIcon size={16} className="text-mari-muted" />
          </DropdownTrigger>
          <DropdownContent placement="bottom-start" className="w-56">
            <DropdownItem icon={<UserIcon />}>Profilim</DropdownItem>
            <DropdownItem icon={<LogOutIcon />} danger>
              Çıkış Yap
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      )}
    </SkeletonDemo>
  );
}

export const Placements: Story = {
  name: "Yerleşimler",
  ...storyDoc(
    "`placement` — panelin tetikleyiciye göre hangi yönde açılacağını belirler.",
    `
<Dropdown>
  <DropdownTrigger color="primary" variant="solid">top</DropdownTrigger>
  <DropdownContent placement="top" className="w-40 p-3">
    Dropdown İçeriği
  </DropdownContent>
</Dropdown>
{/* placement: "top" | "bottom" | "left" | "right" (+ "-start" / "-end") */}`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-24 py-16">
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Dropdown key={placement}>
          <DropdownTrigger color="primary" variant="solid">
            {placement}
          </DropdownTrigger>
          <DropdownContent placement={placement} className="w-40 p-3">
            Dropdown İçeriği
          </DropdownContent>
        </Dropdown>
      ))}
    </div>
  ),
};

export const Alignments: Story = {
  name: "Hizalama",
  ...storyDoc(
    "`-start` / `-end` — panelin tetikleyicinin sol/sağ (veya üst/alt) kenarıyla hizalanmasını sağlar. Sağ kenardaki bir kebab menü için `bottom-end` doğru seçimdir.",
    `
<Dropdown>
  <DropdownTrigger color="primary" variant="solid" className="w-32">bottom-start</DropdownTrigger>
  <DropdownContent placement="bottom-start" className="w-56 p-3">
    Tetikleyiciden geniş bir panel
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-24 py-8">
      {(["bottom-start", "bottom", "bottom-end"] as const).map((placement) => (
        <Dropdown key={placement}>
          <DropdownTrigger color="primary" variant="solid" className="w-32">
            {placement}
          </DropdownTrigger>
          <DropdownContent placement={placement} className="w-56 p-3">
            Tetikleyiciden geniş bir panel
          </DropdownContent>
        </Dropdown>
      ))}
    </div>
  ),
};

export const ItemStates: Story = {
  name: "Öğe Durumları",
  ...storyDoc(
    "`DropdownItem` — normal, `disabled` ve `danger` (yıkıcı işlem) durumları; `DropdownDivider` ile gruplanır. Bir öğeye tıklanınca panel kapanır.",
    `
<Dropdown>
  <DropdownTrigger color="neutral" variant="outline">Öğe Durumları</DropdownTrigger>
  <DropdownContent placement="bottom-start" className="w-56">
    <DropdownItem>1. menü öğesi</DropdownItem>
    <DropdownItem disabled icon={<CopyIcon />}>2. menü öğesi (devre dışı)</DropdownItem>
    <DropdownItem disabled>3. menü öğesi (devre dışı)</DropdownItem>
    <DropdownDivider />
    <DropdownItem danger icon={<Trash2Icon />}>Tehlikeli öğe</DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => (
    <Dropdown>
      <DropdownTrigger color="neutral" variant="outline">
        Öğe Durumları
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" className="w-56">
        <DropdownItem>1. menü öğesi</DropdownItem>
        <DropdownItem disabled icon={<CopyIcon />}>
          2. menü öğesi (devre dışı)
        </DropdownItem>
        <DropdownItem disabled>3. menü öğesi (devre dışı)</DropdownItem>
        <DropdownDivider />
        <DropdownItem danger icon={<Trash2Icon />}>
          Tehlikeli öğe
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` tetikleyiciyi kendi kutusunda (boyut, radius, düzen aynı) bir yer tutucuya çevirir; içerik görünmez " +
      "olarak yerinde kaldığı için kullanıcı adı gelince kutu zıplamaz. İskeletteyken panel açılmaz.",
    `
<Dropdown skeleton={!user}>
  <DropdownTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3">
    <Avatar size="sm" src={user?.avatar} />
    <span className="text-sm font-medium">{user?.name ?? "Kullanıcı adı"}</span>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Profilim</DropdownItem>
    <DropdownItem>Çıkış yap</DropdownItem>
  </DropdownContent>
</Dropdown>`
  ),
  render: () => <DropdownSkeleton />,
};
