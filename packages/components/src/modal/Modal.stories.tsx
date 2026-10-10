/**
 * Faz 13.6: örnekler gerçek senaryolar — yıkıcı silme onayı, oturum süresi
 * uyarısı, davet formu, ödeme başarılı, uzun kullanım koşulları. "Show code"
 * her story'de `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kodu
 * gösterir. Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MailPlusIcon, ReceiptIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Modal } from "./Modal";
import { Field } from "../field";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { RadioGroup } from "../radio";

const meta: Meta<typeof Modal> = {
  title: "Geri Bildirim/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Modal document.body'ye portal edilir — docs'ta her story ayrı iframe'de.
      story: { inline: false, height: "560px" },
      description: {
        component: componentDoc({
          summary:
            "Kullanıcının dikkatini tek bir göreve toplayan diyalog: onay, kısa form, önemli bilgi. `title` + " +
            "`description` başlığı, `confirmButtonText`/`cancelButtonText` (ya da özel `footer`) alt çubuğu oluşturur. " +
            "`color` verilirse ant.design confirm düzeni: solda tonlu durum ikonu. Uzun içerikte gövde kendi içinde " +
            "kayar. Mobilde ekranın altına yaslanır, düğmeler tam genişlik olur.",
          whenToUse: [
            "Geri alınamaz bir işlemden önce onay almak (sil, iptal et, yayınla).",
            "Bağlamdan kopmadan 1-3 alanlık kısa bir form (davet et, yeniden adlandır).",
          ],
          whenNotToUse: [
            "Uzun formlar ya da kullanıcının sayfaya bakarak dolduracağı içerik için — Drawer kullanın.",
            "Engellemeyen bilgi için — Toast kullanın; modal kullanıcıyı durdurur.",
          ],
          a11y:
            "`role=\"dialog\"` + `aria-modal`; başlık erişilebilir ad, açıklama `aria-describedby`. `color` `error`/" +
            "`warning` ve onay düğmesi varsa `role=\"alertdialog\"` olur ve ilk odak \"Vazgeç\"e gider — yıkıcı işlem " +
            "Enter ile yanlışlıkla tetiklenmez. Diğer durumlarda ilk odak `data-autofocus`'a ya da gövdedeki ilk alana. " +
            "Tab modalın içinde döner, Escape (`keyboard`) ve örtü (`maskClosable`) kapatır, kapanınca odak tetikleyiciye " +
            "döner, sayfa kaydırması kilitlenir. `onConfirm` Promise dönerse onay düğmesi `aria-busy` olur.",
        }),
      },
    },
  },
  argTypes: {
    open: { control: false },
    onClose: { table: { category: "Olaylar" } },
    onConfirm: { description: "Promise dönerse çözülene kadar onay düğmesi yükleniyor.", table: { category: "Olaylar" } },
    onCancel: { table: { category: "Olaylar" } },
    title: { control: "text" },
    description: { control: "text" },
    color: { ...colorArgType, description: "Durum rengi — ikon + onay düğmesi. `error`/`warning` → alertdialog." },
    size: { ...baseSizeArgType, description: "400 / 520 / 720px. Varsayılan: `md`." },
    width: { control: "text", description: "Özel genişlik." },
    footer: { control: false, description: "Özel alt çubuk; `null` kaldırır." },
    footerButtonPosition: { control: "inline-radio", options: ["left", "right"], description: "Varsayılan: `right`." },
    closeButtonPosition: { control: "inline-radio", options: ["left", "right"] },
    showCloseButton: { control: "boolean" },
    confirmButtonText: { control: "text" },
    cancelButtonText: { control: "text" },
    confirmLoading: { control: "boolean" },
    maskClosable: { control: "boolean", description: "Varsayılan: `true`." },
    keyboard: { control: "boolean", description: "Escape kapatsın. Varsayılan: `true`." },
    skeleton: {
      control: "boolean",
      description: "Veri gelene kadar başlık, gövde ve alt çubuk içeriğin kendi şeklinde iskelet; Kapat çalışır.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────── 1. Yıkıcı onay ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    title: "Değişiklikleri kaydet?",
    description: "Kaydetmezseniz son düzenlemeleriniz kaybolur.",
    color: "warning",
    size: "md",
    cancelButtonText: "Kaydetme",
    confirmButtonText: "Kaydet",
    footerButtonPosition: "right",
    closeButtonPosition: "right",
    showCloseButton: true,
    maskClosable: true,
    keyboard: true,
    skeleton: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Modalı aç</Button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} onCancel={() => setOpen(false)} onConfirm={() => wait(800).then(() => setOpen(false))} />
      </>
    );
  },
};

export const DeleteConfirm: Story = {
  name: "Silme Onayı (Yıkıcı)",
  ...storyDoc(
    "`color=\"error\"` → `alertdialog`, ilk odak \"Vazgeç\"te. Geri alınamaz işlemde ek güvence olarak proje adını " +
      "yazdırıyoruz; eşleşene kadar \"Sil\" pasif (`confirmDisabled`). `onConfirm` Promise döndüğü için düğme işlem bitene kadar yükleniyor.",
    `
<Modal
  open={open}
  onClose={close}
  color="error"
  title="Projeyi sil"
  description="Bu işlem geri alınamaz. Tüm görevler ve dosyalar kalıcı olarak silinir."
  cancelButtonText="Vazgeç"
  confirmButtonText="Projeyi sil"
  confirmDisabled={typed !== project.name}
  onConfirm={async () => {
    await api.deleteProject(id);
    close();
  }}
>
  <Input value={typed} onChange={…} />
</Modal>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [typed, setTyped] = useState("");
    const [deleted, setDeleted] = useState(false);
    const name = "mobil-uygulama-v3";
    const matches = typed === name;

    return (
      <>
        {deleted ? (
          <p className="text-sm text-mari-muted">
            Proje silindi.{" "}
            <button type="button" className="cursor-pointer text-mari-primary underline" onClick={() => setDeleted(false)}>
              Başa dön
            </button>
          </p>
        ) : (
          <Button color="error" variant="outline" icon={<Trash2Icon size={16} aria-hidden />} onClick={() => setOpen(true)}>
            Projeyi sil
          </Button>
        )}
        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
            setTyped("");
          }}
          color="error"
          title="Projeyi sil"
          description="Bu işlem geri alınamaz. Projedeki 128 görev, 42 dosya ve tüm yorumlar kalıcı olarak silinir."
          cancelButtonText="Vazgeç"
          confirmButtonText="Projeyi sil"
          confirmDisabled={!matches}
          onConfirm={async () => {
            await wait(1200);
            setOpen(false);
            setTyped("");
            setDeleted(true);
          }}
        >
          <Field
            label="Onaylamak için proje adını yazın"
            hint={
              <>
                Yazmanız gereken: <code className="rounded-sm bg-mari-surface-alt px-1 py-0.5 font-mono text-mari-foreground">{name}</code>
              </>
            }
          >
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} status={typed && !matches ? "error" : undefined} />
          </Field>
        </Modal>
      </>
    );
  },
};

/* ─────────────────────────── 2. Oturum süresi ─────────────────────────── */

export const SessionTimeout: Story = {
  name: "Oturum Süresi Doluyor",
  ...storyDoc(
    "`color=\"warning\"` + geri sayım. Örtüye tıklamak ve Escape kapatmaz (`maskClosable={false}`, " +
      "`keyboard={false}`) — kullanıcı bilinçli bir seçim yapmalı. İlk odak `initialFocus=\"confirm\"` ile \"Oturumu uzat\"ta: " +
      "burada \"Vazgeç\" konumundaki düğme (çıkış) yıkıcı olan. Kalan süre ekran okuyucuya her saniye değil, " +
      "sadece metin olarak sunulur (canlı bölge spam'i yok).",
    `
<Modal
  open={open}
  onClose={extend}
  color="warning"
  title="Oturumunuz sona ermek üzere"
  description={\`\${seconds} saniye içinde güvenlik nedeniyle çıkış yapılacak.\`}
  maskClosable={false}
  keyboard={false}
  showCloseButton={false}
  initialFocus="confirm"
  cancelButtonText="Çıkış yap"
  confirmButtonText="Oturumu uzat"
  onCancel={logout}
  onConfirm={extend}
/>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [seconds, setSeconds] = useState(60);
    const [status, setStatus] = useState<string | null>(null);
    useEffect(() => {
      if (!open) return;
      if (seconds <= 0) {
        setOpen(false);
        setStatus("Oturum kapatıldı.");
        return;
      }
      const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }, [open, seconds]);
    const restart = () => {
      setSeconds(60);
      setStatus(null);
      setOpen(true);
    };

    return (
      <>
        <div className="flex items-center gap-3">
          <Button variant="outline" color="neutral" onClick={restart}>
            Uyarıyı göster
          </Button>
          {status && <span className="text-sm text-mari-muted">{status}</span>}
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          color="warning"
          title="Oturumunuz sona ermek üzere"
          description={
            <>
              <span className="font-semibold tabular-nums text-mari-foreground">{seconds} saniye</span> içinde güvenlik nedeniyle çıkış yapılacak.
              Kaydedilmemiş değişiklikleriniz kaybolabilir.
            </>
          }
          size="sm"
          maskClosable={false}
          keyboard={false}
          showCloseButton={false}
          // "Vazgeç" konumundaki düğme burada yıkıcı (çıkış) — güvenli seçenek odakta olsun.
          initialFocus="confirm"
          cancelButtonText="Çıkış yap"
          confirmButtonText="Oturumu uzat"
          onCancel={() => {
            setOpen(false);
            setStatus("Çıkış yapıldı.");
          }}
          onConfirm={() => {
            setOpen(false);
            setStatus("Oturum 30 dakika uzatıldı.");
          }}
        />
      </>
    );
  },
};

/* ─────────────────────────── 3. Davet formu ─────────────────────────── */

const roles = [
  {
    value: "member",
    label: (
      <span className="flex flex-col">
        <span className="font-medium">Üye</span>
        <span className="text-xs text-mari-muted">Projeleri görüntüler ve düzenler</span>
      </span>
    ),
  },
  {
    value: "admin",
    label: (
      <span className="flex flex-col">
        <span className="font-medium">Yönetici</span>
        <span className="text-xs text-mari-muted">Faturalama ve üyeleri de yönetir</span>
      </span>
    ),
  },
];

export const InviteForm: Story = {
  name: "Davet Formu",
  ...storyDoc(
    "Kısa form modalı: özel `icon` + `color=\"primary\"`, ilk alan `data-autofocus` ile odaklanır. Alanlar `Field` ile: " +
      "doğrulama hatası (`error`) alanın altında, alana bağlı ve ekran okuyucuya okunur; Rol grubunun adı da Field'ın " +
      "etiketi. Gönderim sırasında `confirmLoading`.",
    `
<Modal
  open={open}
  onClose={close}
  color="primary"
  icon={<UserPlusIcon />}
  title="Ekibe davet et"
  description="Davet bağlantısı 7 gün geçerlidir."
  cancelButtonText="Vazgeç"
  confirmButtonText="Davet gönder"
  confirmLoading={sending}
  onConfirm={send}
>
  <Field label="E-posta adresi" required error={emailError}>
    <Input data-autofocus type="email" … />
  </Field>
  <Field label="Rol">
    <RadioGroup options={roles} … />
  </Field>
</Modal>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [sending, setSending] = useState(false);
    const [touched, setTouched] = useState(false);
    const [sent, setSent] = useState<string | null>(null);
    // Basit kontrol (demo): "@" ve sonrasında nokta.
    const at = email.indexOf("@");
    const valid = at > 0 && email.indexOf(".", at) > at + 1 && !email.endsWith(".") && !/\s/.test(email);

    return (
      <>
        <div className="flex items-center gap-3">
          <Button icon={<MailPlusIcon size={16} aria-hidden />} onClick={() => setOpen(true)}>
            Üye davet et
          </Button>
          {sent && <span className="text-sm text-mari-success">{sent} adresine davet gönderildi.</span>}
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          color="primary"
          icon={<UserPlusIcon size={20} />}
          title="Ekibe davet et"
          description="Davet bağlantısı 7 gün geçerlidir."
          cancelButtonText="Vazgeç"
          confirmButtonText="Davet gönder"
          confirmLoading={sending}
          onConfirm={async () => {
            setTouched(true);
            if (!valid) return;
            setSending(true);
            await wait(1000);
            setSending(false);
            setSent(email);
            setEmail("");
            setTouched(false);
            setOpen(false);
          }}
        >
          <div className="space-y-5 pb-1">
            <Field label="E-posta adresi" required error={touched && !valid ? "Geçerli bir e-posta adresi girin." : undefined}>
              <Input
                data-autofocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="ad@sirket.com"
              />
            </Field>
            <Field label="Rol" hint="Yöneticiler üye davet edebilir ve faturalamayı görür.">
              <RadioGroup options={roles} value={role} onChange={(v) => setRole(String(v))} />
            </Field>
          </div>
        </Modal>
      </>
    );
  },
};

/* ─────────────────────────── 3b. Veri yüklenirken ─────────────────────────── */

const orderLines = [
  ["Kablosuz kulaklık", "1 adet", "1.899,00 ₺"],
  ["Şarj kablosu (USB-C)", "2 adet", "298,00 ₺"],
] as const;

export const OrderDetail: Story = {
  name: "Sipariş Detayı (Yükleniyor)",
  // Controls'taki `skeleton` açıkken modal iskelette kalır (incelemek için);
  // kapalıyken "Detay" 1.2 sn'lik gerçek bir yükleme taklidi yapar.
  args: { skeleton: false },
  ...storyDoc(
    "Veri modal açıldıktan sonra geliyor: `skeleton` başlığı, gövdeyi ve alt çubuğu içeriğin kendi şeklinde " +
      "iskelete çevirir (satır satır metin, düğme düğme alt çubuk) — yüklenince yükseklik zıplamaz. Kapat ve " +
      "Escape bu sırada da çalışır; veri gelince odak ilk düğmeye taşınır.",
    `
<Modal
  open={open}
  onClose={close}
  skeleton={isLoading}
  title="Sipariş #10482"
  description="12 Eylül 2026 · 2 ürün"
  cancelButtonText="Tamam"
  confirmButtonText="Faturayı indir"
>
  <OrderLines order={order} />
</Modal>`
  ),
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const openModal = () => {
      setOpen(true);
      setLoading(true);
      setTimeout(() => setLoading(false), 1200);
    };
    return (
      <>
        <Button variant="outline" color="neutral" icon={<ReceiptIcon size={16} aria-hidden />} onClick={openModal}>
          Detay
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          skeleton={args.skeleton || loading}
          title="Sipariş #10482"
          description="12 Eylül 2026 · 2 ürün"
          cancelButtonText="Tamam"
          confirmButtonText="Faturayı indir"
          onConfirm={() => setOpen(false)}
        >
          <dl className="divide-y divide-mari-border">
            {orderLines.map(([name, qty, price]) => (
              <div key={name} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="min-w-0">
                  <span className="block font-medium text-mari-foreground">{name}</span>
                  <span className="text-xs text-mari-muted">{qty}</span>
                </dt>
                <dd className="tabular-nums">{price}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-2.5 font-semibold">
              <dt>Toplam</dt>
              <dd className="tabular-nums">2.197,00 ₺</dd>
            </div>
          </dl>
        </Modal>
      </>
    );
  },
};

/* ─────────────────────────── 4. Başarı ─────────────────────────── */

export const PaymentSuccess: Story = {
  name: "Ödeme Başarılı",
  ...storyDoc(
    "Bilgilendirme modalı: `color=\"success\"`, tek birincil aksiyon (özel `footer`), gövdede özet. Engelleyici " +
      "olması gerekmeyen başarı mesajları için Toast daha uygundur — bu örnekte kullanıcı makbuzu görmeli.",
    `
<Modal
  open={open}
  onClose={close}
  color="success"
  title="Ödeme alındı"
  description="Makbuz e-posta adresinize gönderildi."
  footer={<Button block onClick={close}>Tamam</Button>}
>
  <dl>…</dl>
</Modal>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" color="neutral" icon={<ReceiptIcon size={16} aria-hidden />} onClick={() => setOpen(true)}>
          Ödemeyi tamamla
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          color="success"
          size="sm"
          title="Ödeme alındı"
          description="Makbuz deniz@mari-ui.com adresine gönderildi."
          footer={
            <Button block onClick={() => setOpen(false)}>
              Tamam
            </Button>
          }
        >
          <dl className="divide-y divide-mari-border rounded-xl border border-mari-border text-sm">
            {[
              ["Plan", "Ekip · aylık"],
              ["Tutar", "1.192,00 ₺"],
              ["Kart", "•••• 4242"],
              ["Sonraki ödeme", "1 Kasım 2026"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-mari-muted">{k}</dt>
                <dd className="font-medium tabular-nums text-mari-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      </>
    );
  },
};

/* ─────────────────────────── 5. Uzun içerik ─────────────────────────── */

const sections: [string, string][] = [
  ["1. Taraflar", "Bu sözleşme, mari-ui A.Ş. (\"Hizmet Sağlayıcı\") ile hizmeti kullanan gerçek veya tüzel kişi (\"Kullanıcı\") arasında akdedilmiştir."],
  ["2. Hizmetin kapsamı", "Hizmet; tasarım sistemi bileşenleri, tema stüdyosu ve ilgili belgelere çevrim içi erişimi kapsar. Hizmet Sağlayıcı kapsamı önceden bildirmek kaydıyla değiştirebilir."],
  ["3. Hesap güvenliği", "Kullanıcı, hesap bilgilerinin gizliliğinden sorumludur. Yetkisiz kullanımı fark ettiğinde derhal bildirmelidir."],
  ["4. Ücretlendirme", "Ücretli planlar aylık veya yıllık olarak peşin tahsil edilir. Plan değişiklikleri bir sonraki fatura döneminde geçerli olur."],
  ["5. Kişisel veriler", "Kişisel veriler KVKK kapsamında, Aydınlatma Metni'nde belirtilen amaçlarla işlenir ve saklanır."],
  ["6. Fesih", "Kullanıcı aboneliğini dilediği zaman sonlandırabilir; ödenmiş dönem sonuna kadar erişim devam eder."],
  ["7. Uyuşmazlıklar", "Bu sözleşmeden doğan uyuşmazlıklarda İstanbul (Çağlayan) mahkemeleri ve icra daireleri yetkilidir."],
];

export const LongContent: Story = {
  name: "Uzun İçerik (Kullanım Koşulları)",
  ...storyDoc(
    "Ekrandan uzun içerikte başlık ve alt çubuk sabit kalır, sadece gövde kayar. \"Kabul et\" metnin sonuna " +
      "kaydırılana kadar pasif — yasal metinlerde yaygın desen. `size=\"lg\"`.",
    `
<Modal
  open={open}
  onClose={close}
  size="lg"
  title="Kullanım koşulları"
  description="Son güncelleme: 1 Eylül 2026"
  footer={<Button disabled={!readToEnd} onClick={accept}>Kabul et</Button>}
>
  <div onScroll={trackScroll}>…</div>
</Modal>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [readToEnd, setReadToEnd] = useState(false);
    const [agree, setAgree] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!open) return;
      const el = endRef.current;
      if (!el || typeof IntersectionObserver === "undefined") return;
      const io = new IntersectionObserver(([e]) => e?.isIntersecting && setReadToEnd(true));
      io.observe(el);
      return () => io.disconnect();
    }, [open]);

    return (
      <>
        <Button variant="outline" color="neutral" onClick={() => setOpen(true)}>
          Koşulları oku
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          title="Kullanım koşulları"
          description="Son güncelleme: 1 Eylül 2026"
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Checkbox label="Okudum ve kabul ediyorum" checked={agree} disabled={!readToEnd} onChange={(e) => setAgree(e.target.checked)} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" color="neutral" onClick={() => setOpen(false)}>
                  Vazgeç
                </Button>
                <Button disabled={!agree} onClick={() => setOpen(false)}>
                  Kabul et
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {[...sections, ...sections.map(([h, t], i): [string, string] => [h.replace(/^\d+/, String(i + 8)), t])].map(([h, t]) => (
              <section key={h}>
                <h3 className="mb-1 font-semibold text-mari-foreground">{h}</h3>
                <p className="leading-relaxed text-mari-muted">{t}</p>
              </section>
            ))}
            <div ref={endRef} className="h-px" />
          </div>
        </Modal>
      </>
    );
  },
};

/* ─────────────────────────── Temel seçenekler ─────────────────────────── */

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm` 400 / `md` 520 / `lg` 720px; `width` ile özel genişlik.", `<Modal size="lg" …>…</Modal>`),
  render: () => {
    // Açık/kapalı ayrı state: kapanırken boyut SABİT kalmalı — eskiden
    // `size` null'a çekilip `md`'ye düşüyordu, büyük modal kapanış
    // animasyonunu küçülmüş olarak oynatıyordu (kullanıcı bulgusu).
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<"sm" | "md" | "lg">("md");
    return (
      <div className="flex gap-2">
        {(["sm", "md", "lg"] as const).map((s) => (
          <Button
            key={s}
            variant="outline"
            color="neutral"
            onClick={() => {
              setSize(s);
              setOpen(true);
            }}
          >
            {s}
          </Button>
        ))}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size={size}
          title={`size="${size}"`}
          description="Başlık ve açıklama; altta varsayılan düğmeler."
          cancelButtonText="Vazgeç"
          confirmButtonText="Tamam"
          onConfirm={() => setOpen(false)}
        >
          <p className="text-mari-muted">Gövde içeriği.</p>
        </Modal>
      </div>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

function SkeletonOverlayDemo({ skeleton }: { skeleton: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Pencereyi aç</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Sipariş #48213" description="3 ürün · ₺1.240" skeleton={skeleton}>
        <p className="text-sm">Kargo yarın teslim edilecek.</p>
      </Modal>
    </>
  );
}

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Modal open title="Sipariş #48213" skeleton>…</Modal>`),
  render: () => <SkeletonDemo>{(skeleton) => <SkeletonOverlayDemo skeleton={skeleton} />}</SkeletonDemo>,
};
