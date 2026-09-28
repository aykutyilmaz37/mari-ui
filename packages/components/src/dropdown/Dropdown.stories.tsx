import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDownIcon, CopyIcon, LogOutIcon, MoreVerticalIcon, PencilIcon, SettingsIcon, Trash2Icon, UserIcon } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";
import { DropdownDivider, DropdownItem } from "./_components/DropdownItem";
import { Avatar } from "../avatar";
import { componentDoc, storyDoc } from "../lib/storyMeta";

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
          whenNotToUse: ["İçerik gerçek, klavyeyle gezinen bir menü listesiyse (ok tuşlarıyla öğe seçimi) — bu durumda ayrı bir Menu component'i tercih edilmeli."],
          a11y:
            "Tetikleyici gerçek bir `<button>`dır — Tab ile odaklanılıp Enter/Boşluk ile açılıp kapatılabilir " +
            "(`hover` modunda bile). Panel açıkken **Escape** kapatır, panelin **dışına tıklamak** da kapatır. " +
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

export const UserMenu: Story = {
  name: "Kullanıcı Menüsü",
  ...storyDoc("Gerçek bir kullanım örneği: avatar tetikleyici + hesap işlemleri (Profilim, Ayarlar, Çıkış Yap)."),
  render: () => (
    <Dropdown>
      <DropdownTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-mari-surface-alt">
        <Avatar size="sm" icon={<UserIcon size={16} />} />
        <span className="text-sm font-medium">Aykut Yılmaz</span>
        <ChevronDownIcon size={16} className="text-mari-muted" />
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" arrow className="w-56">
        <div className="px-3 py-1.5 text-xs text-mari-muted">aykut@example.com</div>
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
  ...storyDoc("Gerçek bir kullanım örneği: bir tablo/liste satırının sağındaki \"⋮\" işlem menüsü."),
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

export const Placements: Story = {
  name: "Yerleşimler",
  ...storyDoc("`placement` — panelin tetikleyiciye göre hangi yönde açılacağını belirler."),
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
  ...storyDoc("`-start` / `-end` — panelin tetikleyicinin sol/sağ (veya üst/alt) kenarıyla hizalanmasını sağlar. Sağ kenardaki bir kebab menü için `bottom-end` doğru seçimdir."),
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

export const WithArrow: Story = {
  name: "Ok (Üçgen) ile",
  ...storyDoc(
    "`arrow` — panele tetikleyiciyi gösteren küçük bir üçgen ekler; ok, panelin hizalandığı kenardan sabit 12px içeride durur (ant.design gibi). " +
      "Küçük tetikleyicilerde `arrow={{ pointAtCenter: true }}` paneli, ok tetikleyicinin tam ortasını gösterecek şekilde kaydırır."
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

export const ItemStates: Story = {
  name: "Öğe Durumları",
  ...storyDoc("`DropdownItem` — normal, `disabled` ve `danger` (yıkıcı işlem) durumları; `DropdownDivider` ile gruplanır. Bir öğeye tıklanınca panel kapanır."),
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

export const Hoverable: Story = {
  name: "Hover ile",
  ...storyDoc("`hover` prop'uyla üzerine gelince açılır — yine de tetikleyici gerçek bir düğme olduğundan klavyeyle de açılıp kapatılabilir."),
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
  ...storyDoc("Escape tuşu ve panelin dışına tıklamak paneli kapatır (Faz 13.5 kullanıcı bulgusu — eskiden bunların hiçbiri yoktu)."),
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
