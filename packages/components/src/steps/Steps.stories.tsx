/**
 * Storybook CSF3'te `render` obje property'si gerçek bir React function
 * component GİBİ çağrılır (hook kuralları geçerlidir) — ama
 * `eslint-plugin-react-hooks` obje property'lerini component olarak
 * tanımıyor. Bilinçli olarak devre dışı.
 *
 * Faz 13.6 kullanıcı isteği: "örneklendirmeyi gerçekçi ve kaliteli tasarımla
 * yapalım" — eskiden örnekler "Bilet / Bilet Seç" gibi yer tutucu adımlardan
 * oluşuyordu. Artık her story gerçek bir ürün senaryosu (ödeme, hesap
 * kurulumu, sipariş takibi, kimlik doğrulama, yayınlama hattı). "Show code"
 * her story'de `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kodu
 * gösterir (bkz. lib/storyMeta.ts).
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BadgeCheckIcon,
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  FlaskConicalIcon,
  HammerIcon,
  PackageIcon,
  RocketIcon,
  ScanFaceIcon,
  ShieldAlertIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
  UserRoundIcon,
  UsersRoundIcon,
  WatchIcon,
  HeadphonesIcon,
  CircleCheckBigIcon,
} from "lucide-react";
import { Steps } from "./Steps";
import { StepsContent } from "./_components/StepsContent";
import type { StepItem } from "./types";
import { Button } from "../button";
import { Input } from "../input";
import { RadioGroup } from "../radio";
import { Tag } from "../tag";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";

const meta: Meta<typeof Steps> = {
  title: "Navigasyon/Steps",
  component: Steps,
  tags: ["autodocs"],
  parameters: {
    // Story seviyesinde `parameters` yazmayın — `...storyDoc(...)`'un
    // `parameters`'ını (açıklama + "Show code" kodu) tamamen ezer.
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Çok adımlı bir süreçte kullanıcının nerede olduğunu gösteren adım göstergesi. Dört durum " +
            "(`wait` / `process` / `finish` / `error`), yatay/dikey, başlık yanında/altında, nokta, ilerleme halkası " +
            "ve `filled` / `outlined` görünüm destekler. Dar kapsayıcıda yatay Steps kendiliğinden dikeye geçer.",
          whenToUse: [
            "Bir görev birbirini izleyen birkaç aşamaya bölündüğünde (ödeme, kayıt, kurulum sihirbazı).",
            "Bir sürecin mevcut durumunu salt okunur göstermek için (sipariş/kargo takibi, başvuru durumu, dağıtım hattı).",
          ],
          whenNotToUse: [
            "Tek adımlı formlarda — gereksiz görsel yük.",
            "Sıralı olmayan, serbestçe gezilen bölümler için — Tabs daha uygundur.",
          ],
          a11y:
            "Adımlar bir `<ol>` listesidir. `onChange` verildiğinde her adım gerçek bir `<button>`'dır (Tab/Enter/Space " +
            "tarayıcıdan gelir); `disabled` adım gerçekten devre dışıdır. Geçerli adım `aria-current=\"step\"` taşır. " +
            "Durum yalnızca renk/ikonla değil, başlığa eklenen görünmez metinle de bildirilir (\"tamamlandı\", \"hata\", " +
            "\"devam ediyor, %64\"). Gösterge dairesi dekoratiftir (`aria-hidden`). Geçişler " +
            "`prefers-reduced-motion`'a uyar.",
        }),
      },
    },
  },
  argTypes: {
    data: { control: "object", description: "Adımlar: `{ title, subTitle?, description?, icon?, step?, status?, disabled? }[]`." },
    currentStep: { control: { type: "number", min: 1 }, description: "Geçerli adım (1 tabanlı)." },
    status: { control: "inline-radio", options: ["process", "finish", "error"], description: "Geçerli adımın durumu. Varsayılan: `process`." },
    variant: { control: "inline-radio", options: ["filled", "outlined"], description: "Varsayılan: `filled`.", table: { category: "Görünüm" } },
    size: { control: "inline-radio", options: ["sm", "md"], description: "Gösterge 24px / 32px. Varsayılan: `md`.", table: { category: "Görünüm" } },
    color: { ...colorArgType, description: "Aktif/tamamlanmış adımların rengi. Varsayılan: `primary`." },
    labelPlacement: { control: "inline-radio", options: ["horizontal", "vertical"], description: "Başlık göstergenin yanında / altında.", table: { category: "Görünüm" } },
    vertical: { control: "boolean", table: { category: "Görünüm" } },
    dot: { control: "boolean", description: "Numara yerine küçük nokta.", table: { category: "Görünüm" } },
    percent: { control: { type: "range", min: 0, max: 100 }, description: "Geçerli adımın ilerleme halkası (0-100)." },
    responsive: { control: "number", description: "Kapsayıcı bu genişliğin (px) altındaysa dar düzene geçer. `false` kapatır. Varsayılan: `520`." },
    responsiveLayout: { control: "inline-radio", options: ["vertical", "compact"], description: "Dar düzen: dikey liste ya da kompakt gösterge. Varsayılan: `vertical`." },
    showActions: { control: "boolean", description: "Geri/İleri çubuğu. Varsayılan: `onChange` verildiyse açık." },
    onChange: { description: "Verilirse adımlar tıklanabilir olur.", table: { category: "Olaylar" } },
    onComplete: { description: "Son adımda \"Tamamla\".", table: { category: "Olaylar" } },
    content: { control: false, description: "Adımların altında render edilen içerik (bkz. `StepsContent`)." },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

const basicSteps: StepItem[] = [
  { title: "Başvuru", description: "Form gönderildi" },
  { title: "İnceleme", description: "Ekip değerlendiriyor" },
  { title: "Mülakat", description: "Takvim bekleniyor" },
  { title: "Teklif" },
];

/* ─────────────────────────── Story yardımcıları ─────────────────────────── */

/** Görünür etiketli form alanı — placeholder-only etiket kullanmıyoruz. */
function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-medium text-mari-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-mari-muted">{hint}</span>}
    </label>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-base font-semibold text-mari-foreground" : "text-sm text-mari-muted"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

const tl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

/* ─────────────────────────── 1. Ödeme akışı ─────────────────────────── */

const checkoutSteps: StepItem[] = [
  { title: "Sepet", icon: ShoppingBagIcon },
  { title: "Teslimat", icon: TruckIcon },
  { title: "Ödeme", icon: CreditCardIcon },
  { title: "Onay", icon: BadgeCheckIcon },
];

const cartItems = [
  { name: "Kablosuz Kulaklık Pro", variant: "Gece mavisi · Gürültü engelleme", qty: 1, price: 2499, Icon: HeadphonesIcon },
  { name: "Akıllı Saat S3", variant: "44 mm · Siyah silikon kordon", qty: 1, price: 3799, Icon: WatchIcon },
];

const shippingOptions = [
  {
    value: "standard",
    price: 0,
    label: (
      <span className="flex flex-col">
        <span className="font-medium">Standart teslimat — Ücretsiz</span>
        <span className="text-xs text-mari-muted">2-4 iş günü</span>
      </span>
    ),
  },
  {
    value: "express",
    price: 49.9,
    label: (
      <span className="flex flex-col">
        <span className="font-medium">Hızlı teslimat — 49,90 ₺</span>
        <span className="text-xs text-mari-muted">Yarın 12:00'ye kadar kapında</span>
      </span>
    ),
  },
];

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    data: basicSteps,
    currentStep: 2,
    status: "process",
    variant: "filled",
    size: "md",
    color: "primary",
    labelPlacement: "horizontal",
    vertical: false,
    dot: false,
  },
};

export const Checkout: Story = {
  name: "Ödeme Akışı",
  ...storyDoc(
    "E-ticaret ödeme sihirbazı: ikonlu adımlar, her adımda gerçek içerik (`StepsContent`), yerleşik Geri/İleri " +
      "çubuğu ve son adımda `onComplete`. Mobilde `responsiveLayout=\"compact\"` ile adım listesi tek satıra iner. Tamamlanan adımlara tıklayarak geri dönülebilir; henüz ulaşılmamış " +
      "adımlar `disabled` — kullanıcı ödeme bilgisini atlayıp onaya geçemez.",
    `
const [step, setStep] = useState(1);
const [maxReached, setMaxReached] = useState(1);

const go = (next: number) => {
  setStep(next);
  setMaxReached((m) => Math.max(m, next));
};

<Steps
  data={[
    { title: "Sepet", icon: ShoppingBagIcon },
    { title: "Teslimat", icon: TruckIcon, disabled: maxReached < 2 },
    { title: "Ödeme", icon: CreditCardIcon, disabled: maxReached < 3 },
    { title: "Onay", icon: BadgeCheckIcon, disabled: maxReached < 4 },
  ]}
  currentStep={step}
  onChange={go}
  onComplete={placeOrder}
  responsiveLayout="compact" // mobilde: göstergeler + "Adım 2/4 · Teslimat"
  content={
    <>
      <StepsContent value={1} currentSteps={step}><CartList /></StepsContent>
      <StepsContent value={2} currentSteps={step}><AddressForm /></StepsContent>
      <StepsContent value={3} currentSteps={step}><PaymentForm /></StepsContent>
      <StepsContent value={4} currentSteps={step}><OrderReview /></StepsContent>
    </>
  }
/>`
  ),
  render: () => {
    const [step, setStep] = useState(1);
    const [maxReached, setMaxReached] = useState(1);
    const [shipping, setShipping] = useState("standard");
    const [placed, setPlaced] = useState(false);

    const go = (next: number) => {
      setStep(next);
      setMaxReached((m) => Math.max(m, next));
    };
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingFee = shippingOptions.find((o) => o.value === shipping)?.price ?? 0;
    const total = subtotal + shippingFee;

    if (placed) {
      return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-mari-border bg-mari-surface px-8 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-mari-success-subtle text-mari-success">
            <CircleCheckBigIcon size={28} aria-hidden />
          </span>
          <h3 className="text-lg font-semibold text-mari-foreground">Siparişiniz alındı</h3>
          <p className="max-w-sm text-sm text-mari-muted">
            Sipariş numaranız <span className="font-medium text-mari-foreground">#TR-48213</span>. Onay e-postası
            gönderildi; kargoya verildiğinde SMS ile bilgilendireceğiz.
          </p>
          <Button
            variant="outline"
            color="neutral"
            onClick={() => {
              setPlaced(false);
              setStep(1);
              setMaxReached(1);
            }}
          >
            Başa dön
          </Button>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-mari-border bg-mari-surface p-5 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-mari-foreground">Ödeme</h3>
          <p className="text-sm text-mari-muted">Siparişinizi 4 adımda tamamlayın.</p>
        </div>
        <Steps
          data={checkoutSteps.map((s, i) => ({ ...s, disabled: i + 1 > maxReached }))}
          responsiveLayout="compact"
          currentStep={step}
          onChange={go}
          onComplete={() => setPlaced(true)}
          content={
            <div className="min-h-64">
              <StepsContent value={1} currentSteps={step}>
                <ul className="divide-y divide-mari-border">
                  {cartItems.map(({ name, variant, qty, price, Icon }) => (
                    <li key={name} className="flex items-center gap-4 py-4 first:pt-0">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-mari-surface-alt text-mari-muted">
                        <Icon size={24} aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="line-clamp-2 text-sm font-medium text-mari-foreground">{name}</span>
                        <span className="truncate text-xs text-mari-muted">{variant}</span>
                        <span className="text-xs text-mari-muted">Adet: {qty}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-mari-foreground">{tl(price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 space-y-1.5 rounded-xl bg-mari-surface-alt p-4">
                  <SummaryRow label="Ara toplam" value={tl(subtotal)} />
                  <SummaryRow label="Kargo" value="Bir sonraki adımda" />
                </div>
              </StepsContent>

              <StepsContent value={2} currentSteps={step}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ad soyad">
                    <Input placeholder="Ayşe Yılmaz" defaultValue="Ayşe Yılmaz" />
                  </Field>
                  <Field label="Telefon">
                    <Input mask="(___) ___ __ __" replacement={{ _: /\d/ }} placeholder="(5__) ___ __ __" defaultValue="(532) 000 00 00" />
                  </Field>
                  <Field label="Adres" className="sm:col-span-2">
                    <Input placeholder="Mahalle, sokak, bina ve daire no" defaultValue="Moda Cd. No: 12 D: 4" />
                  </Field>
                  <Field label="İl">
                    <Input defaultValue="İstanbul" />
                  </Field>
                  <Field label="İlçe">
                    <Input defaultValue="Kadıköy" />
                  </Field>
                </div>
                <fieldset className="mt-6">
                  <legend className="mb-2 text-sm font-medium text-mari-foreground">Teslimat seçeneği</legend>
                  <RadioGroup aria-label="Teslimat seçeneği" options={shippingOptions} value={shipping} onChange={(v) => setShipping(String(v))} />
                </fieldset>
              </StepsContent>

              <StepsContent value={3} currentSteps={step}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kart üzerindeki isim" className="sm:col-span-2">
                    <Input placeholder="AYŞE YILMAZ" />
                  </Field>
                  <Field label="Kart numarası" className="sm:col-span-2" hint="Bu bir örnektir — gerçek kart bilgisi girmeyin.">
                    <Input mask="____ ____ ____ ____" replacement={{ _: /\d/ }} placeholder="0000 0000 0000 0000" icon={<CreditCardIcon size={16} aria-hidden />} />
                  </Field>
                  <Field label="Son kullanma">
                    <Input mask="__/__" replacement={{ _: /\d/ }} placeholder="AA/YY" />
                  </Field>
                  <Field label="Güvenlik kodu">
                    <Input mask="___" replacement={{ _: /\d/ }} placeholder="CVC" />
                  </Field>
                </div>
              </StepsContent>

              <StepsContent value={4} currentSteps={step}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-mari-border p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-mari-muted">Teslimat</p>
                    <p className="text-sm text-mari-foreground">Ayşe Yılmaz</p>
                    <p className="text-sm text-mari-muted">Moda Cd. No: 12 D: 4, Kadıköy / İstanbul</p>
                  </div>
                  <div className="rounded-xl border border-mari-border p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-mari-muted">Ödeme</p>
                    <p className="text-sm text-mari-foreground">Kredi kartı</p>
                    <p className="text-sm text-mari-muted">Tek çekim</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 rounded-xl bg-mari-surface-alt p-4">
                  <SummaryRow label={`Ürünler (${cartItems.length})`} value={tl(subtotal)} />
                  <SummaryRow label="Kargo" value={shippingFee ? tl(shippingFee) : "Ücretsiz"} />
                  <div className="my-2 h-px bg-mari-border" />
                  <SummaryRow label="Toplam" value={tl(total)} strong />
                </div>
              </StepsContent>
            </div>
          }
        />
      </div>
    );
  },
};

/* ─────────────────────────── 2. Hesap kurulumu (dikey) ─────────────────────────── */

const onboardingSteps: StepItem[] = [
  { title: "Profil", description: "Adınız ve rolünüz", icon: UserRoundIcon },
  { title: "Çalışma alanı", description: "Şirket adı ve adres", icon: Building2Icon },
  { title: "Ekibi davet et", description: "İsteğe bağlı", icon: UsersRoundIcon },
  { title: "Plan seçimi", description: "14 gün ücretsiz", icon: SparklesIcon },
];

const planOptions = [
  { value: "starter", label: <span className="font-medium">Başlangıç — 5 kullanıcıya kadar ücretsiz</span> },
  { value: "team", label: <span className="font-medium">Ekip — kullanıcı başı 149 ₺/ay</span> },
  { value: "business", label: <span className="font-medium">Kurumsal — SSO ve denetim kayıtları</span> },
];

export const Onboarding: Story = {
  name: "Hesap Kurulumu (Dikey)",
  ...storyDoc(
    "SaaS hesap kurulumu: solda dikey Steps (açıklamalı, ikonlu), sağda o adımın formu. Dar ekranda iki kolon " +
      "alt alta düşer. Gri kenar çubuğunda tonlu göstergeler zeminle karışacağı için `variant=\"outlined\"`. Yerleşik çubuk yerine kendi eylem düğmelerimiz (`showActions={false}`) — \"Atla\" gibi " +
      "adıma özgü aksiyonlar eklenebilsin diye.",
    `
const [step, setStep] = useState(2);

<div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
  {/* mobilde bunun yerine: <Steps responsive={Infinity} responsiveLayout="compact" … /> */}
  <Steps
    vertical
    variant="outlined"
    data={[
      { title: "Profil", description: "Adınız ve rolünüz", icon: UserRoundIcon },
      { title: "Çalışma alanı", description: "Şirket adı ve adres", icon: Building2Icon },
      { title: "Ekibi davet et", description: "İsteğe bağlı", icon: UsersRoundIcon },
      { title: "Plan seçimi", description: "14 gün ücretsiz", icon: SparklesIcon },
    ]}
    currentStep={step}
    onChange={setStep}
    showActions={false}
  />
  <section>{/* adımın formu + kendi Geri / Atla / Devam düğmeleriniz */}</section>
</div>`
  ),
  render: () => {
    const [step, setStep] = useState(2);
    const [plan, setPlan] = useState("team");
    const headings = [
      ["Sizi tanıyalım", "Ekip arkadaşlarınız sizi bu bilgilerle görecek."],
      ["Çalışma alanınızı oluşturun", "Faturalar ve davetler bu isimle gönderilir."],
      ["Ekibinizi davet edin", "Şimdi ya da daha sonra ayarlardan davet edebilirsiniz."],
      ["Planınızı seçin", "14 gün boyunca tüm özellikler ücretsiz. Kart gerekmez."],
    ] as const;
    const [title, subtitle] = headings[step - 1] ?? headings[0];

    return (
      <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-xl border border-mari-border bg-mari-surface md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-mari-border bg-mari-surface-alt p-5 md:border-b-0 md:border-r md:p-6">
          <p className="mb-4 hidden text-xs font-medium uppercase tracking-wide text-mari-muted md:mb-6 md:block">Kurulum · {step}/4</p>
          {/* Masaüstü: açıklamalı dikey liste. Mobil: tek satır kompakt gösterge. */}
          <div className="hidden md:block">
            <Steps vertical variant="outlined" data={onboardingSteps} currentStep={step} onChange={setStep} showActions={false} aria-label="Hesap kurulumu adımları" />
          </div>
          <div className="md:hidden">
            <Steps
              variant="outlined"
              data={onboardingSteps}
              currentStep={step}
              onChange={setStep}
              showActions={false}
              responsive={10000}
              responsiveLayout="compact"
              aria-label="Hesap kurulumu adımları"
            />
          </div>
        </aside>
        <section className="flex min-h-96 min-w-0 flex-col p-5 sm:p-8">
          <h3 className="text-lg font-semibold text-mari-foreground">{title}</h3>
          <p className="mb-6 text-sm text-mari-muted">{subtitle}</p>

          <div className="flex-1">
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ad">
                  <Input defaultValue="Deniz" />
                </Field>
                <Field label="Soyad">
                  <Input defaultValue="Kaya" />
                </Field>
                <Field label="Rolünüz" className="sm:col-span-2">
                  <Input defaultValue="Ürün Yöneticisi" />
                </Field>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-4">
                <Field label="Şirket adı">
                  <Input defaultValue="mari-ui A.Ş." />
                </Field>
                <Field label="Çalışma alanı adresi" hint="Küçük harf, rakam ve tire kullanılabilir.">
                  <Input defaultValue="mari-ui" icon={<span className="text-sm text-mari-muted">app.mari.io/</span>} />
                </Field>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-3">
                {["can@mari-ui.com", "elif@mari-ui.com", ""].map((email, i) => (
                  <Field key={i} label={`E-posta ${i + 1}`}>
                    <Input type="email" placeholder="ad@sirket.com" defaultValue={email} />
                  </Field>
                ))}
              </div>
            )}
            {step === 4 && <RadioGroup aria-label="Plan" options={planOptions} value={plan} onChange={(v) => setPlan(String(v))} />}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-mari-border pt-6">
            <Button variant="ghost" color="neutral" disabled={step === 1} onClick={() => setStep(step - 1)}>
              Geri
            </Button>
            <div className="flex gap-2">
              {step === 3 && (
                <Button variant="outline" color="neutral" onClick={() => setStep(4)}>
                  Şimdilik atla
                </Button>
              )}
              <Button onClick={() => step < 4 && setStep(step + 1)}>{step === 4 ? "Denemeyi başlat" : "Devam et"}</Button>
            </div>
          </div>
        </section>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Sipariş takibi (salt okunur) ─────────────────────────── */

const trackingSteps: StepItem[] = [
  { title: "Sipariş alındı", subTitle: "24 Eyl, 14:02", description: "Ödemeniz onaylandı." },
  { title: "Hazırlanıyor", subTitle: "24 Eyl, 17:45", description: "Ürünleriniz paketlendi." },
  { title: "Kargoya verildi", subTitle: "25 Eyl, 09:10", description: "Yurtiçi Kargo · Takip no: 4821 3390 17" },
  { title: "Dağıtımda", subTitle: "Bugün, 08:30", description: "Kurye bugün 13:00-17:00 arasında teslim edecek." },
  { title: "Teslim edildi", description: "Tahmini: bugün" },
];

export const OrderTracking: Story = {
  name: "Sipariş Takibi (Salt Okunur)",
  ...storyDoc(
    "`onChange` yok → adımlar tıklanamaz, eylem çubuğu yok; saf bir durum göstergesi. `subTitle` ile zaman " +
      "damgası, `size=\"sm\"` + `vertical` ile kompakt bir zaman çizelgesi.",
    `
<Steps
  vertical
  size="sm"
  currentStep={4}
  data={[
    { title: "Sipariş alındı", subTitle: "24 Eyl, 14:02", description: "Ödemeniz onaylandı." },
    { title: "Hazırlanıyor", subTitle: "24 Eyl, 17:45", description: "Ürünleriniz paketlendi." },
    { title: "Kargoya verildi", subTitle: "25 Eyl, 09:10", description: "Yurtiçi Kargo · Takip no: 4821 3390 17" },
    { title: "Dağıtımda", subTitle: "Bugün, 08:30", description: "Kurye bugün 13:00-17:00 arasında teslim edecek." },
    { title: "Teslim edildi", description: "Tahmini: bugün" },
  ]}
/>`
  ),
  render: () => (
    <div className="mx-auto max-w-md rounded-xl border border-mari-border bg-mari-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mari-border p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-mari-primary-subtle text-mari-primary">
            <PackageIcon size={20} aria-hidden />
          </span>
          <div>
            <p className="whitespace-nowrap text-sm font-semibold text-mari-foreground">Sipariş #TR-48213</p>
            <p className="text-xs text-mari-muted">2 ürün · 6.298,00 ₺</p>
          </div>
        </div>
        <Tag color="info">Dağıtımda</Tag>
      </div>
      <div className="p-5">
        <Steps vertical size="sm" data={trackingSteps} currentStep={4} aria-label="Sipariş durumu" />
      </div>
    </div>
  ),
};

/* ─────────────────────────── 4. Hata durumu ─────────────────────────── */

const kycSteps: StepItem[] = [
  { title: "Kişisel bilgiler", icon: UserRoundIcon },
  { title: "Kimlik belgesi", icon: FileTextIcon },
  { title: "Yüz doğrulama", icon: ScanFaceIcon },
  { title: "Onay", icon: BadgeCheckIcon },
];

export const ErrorState: Story = {
  name: "Hata Durumu",
  ...storyDoc(
    "`status=\"error\"` geçerli adımı hata olarak işaretler — gösterge ×, başlık kırmızı, ekran okuyucuya " +
      "\"hata\" bildirilir. Hatanın nedeni ve çözüm aksiyonu hemen altında, adımla ilişkili olarak verilir.",
    `
const [failed, setFailed] = useState(true);

<Steps
  data={[
    { title: "Kişisel bilgiler", icon: UserRoundIcon },
    { title: "Kimlik belgesi", icon: FileTextIcon },
    { title: "Yüz doğrulama", icon: ScanFaceIcon },
    { title: "Onay", icon: BadgeCheckIcon },
  ]}
  currentStep={2}
  status={failed ? "error" : "process"}
  labelPlacement="vertical"
  responsiveLayout="compact"
/>`
  ),
  render: () => {
    const [failed, setFailed] = useState(true);
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-mari-border bg-mari-surface p-5 sm:p-8">
        <h3 className="mb-6 text-lg font-semibold text-mari-foreground">Kimlik doğrulama</h3>
        <Steps
          data={kycSteps}
          currentStep={2}
          status={failed ? "error" : "process"}
          labelPlacement="vertical"
          responsiveLayout="compact"
          aria-label="Doğrulama adımları"
        />
        <div
          className={`mt-8 flex items-start gap-3 rounded-xl border p-4 ${failed ? "border-mari-error-border bg-mari-error-subtle" : "border-mari-border bg-mari-surface-alt"}`}
          role={failed ? "alert" : undefined}
        >
          {failed ? (
            <ShieldAlertIcon size={20} className="mt-0.5 shrink-0 text-mari-error" aria-hidden />
          ) : (
            <FileTextIcon size={20} className="mt-0.5 shrink-0 text-mari-muted" aria-hidden />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${failed ? "text-mari-error-subtle-contrast" : "text-mari-foreground"}`}>
              {failed ? "Kimlik fotoğrafı okunamadı" : "Belgeniz inceleniyor"}
            </p>
            <p className="mt-0.5 text-sm text-mari-muted">
              {failed
                ? "Görüntü bulanık ya da parlama var. Belgenin dört köşesi görünecek şekilde, düz bir zeminde yeniden çekin."
                : "Genellikle 2 dakikadan kısa sürer. Bu sayfadan ayrılabilirsiniz."}
            </p>
            {failed && (
              <Button size="sm" color="error" variant="outline" className="mt-3" onClick={() => setFailed(false)}>
                Belgeyi yeniden yükle
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 5. İlerleme halkası ─────────────────────────── */

export const DeployPipeline: Story = {
  name: "İlerleme Halkası (Dağıtım Hattı)",
  ...storyDoc(
    "`percent` geçerli adımın göstergesinin etrafına ilerleme halkası çizer; yüzde ekran okuyucuya da bildirilir. " +
      "`size=\"sm\"` + `subTitle` ile yoğun bir durum çubuğu.",
    `
<Steps
  size="sm"
  currentStep={2}
  percent={64}
  data={[
    { title: "Derleme", subTitle: "42 sn", icon: HammerIcon },
    { title: "Testler", subTitle: "184/286", icon: FlaskConicalIcon },
    { title: "Yayına alma", icon: RocketIcon },
  ]}
/>`
  ),
  render: () => {
    const total = 286;
    const [done, setDone] = useState(120);
    useEffect(() => {
      if (done >= total) return;
      const id = setTimeout(() => setDone((d) => Math.min(total, d + 3)), 200);
      return () => clearTimeout(id);
    }, [done]);
    const testsFinished = done >= total;
    const percent = Math.round((done / total) * 100);

    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-mari-border bg-mari-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mari-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-mari-foreground">web-app · main</p>
            <p className="font-mono text-xs text-mari-muted">a4ac515 · "Sidebar yeniden yapılandırma"</p>
          </div>
          <Button size="sm" variant="outline" color="neutral" onClick={() => setDone(0)}>
            Yeniden çalıştır
          </Button>
        </div>
        <div className="px-5 py-6">
          <Steps
            size="sm"
            responsiveLayout="compact"
            currentStep={testsFinished ? 3 : 2}
            percent={testsFinished ? undefined : percent}
            aria-label="Dağıtım aşamaları"
            data={[
              { title: "Derleme", subTitle: "42 sn", icon: HammerIcon },
              { title: "Testler", subTitle: `${done}/${total}`, icon: FlaskConicalIcon },
              { title: "Yayına alma", subTitle: testsFinished ? "başladı" : undefined, icon: RocketIcon },
            ]}
          />
        </div>
      </div>
    );
  },
};

export const LabelBelow: Story = {
  name: "Başlık Altta",
  ...storyDoc("`labelPlacement=\"vertical\"` — başlık göstergenin altında ortalı; çizgi göstergeden göstergeye uzanır.", `
<Steps data={steps} currentStep={2} labelPlacement="vertical" />`),
  render: () => <Steps data={basicSteps} currentStep={2} labelPlacement="vertical" />,
};

export const Dots: Story = {
  name: "Nokta",
  ...storyDoc("`dot` — numara yerine nokta. Yatayda başlık her zaman altta; dikeyde sade bir zaman çizelgesi.", `
<Steps data={steps} currentStep={2} dot />
<Steps data={steps} currentStep={2} dot vertical />`),
  render: () => (
    <div className="flex flex-col gap-10">
      <Steps data={basicSteps} currentStep={2} dot />
      <div className="max-w-xs">
        <Steps data={basicSteps} currentStep={2} dot vertical />
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  name: "Tıklanabilir",
  ...storyDoc(
    "`onChange` verilince adımlar gerçek `<button>` olur (Tab + Enter/Space). `showActions={false}` ile yalnızca " +
      "adımlara tıklayarak gezinilir; `disabled` adım atlanamaz.",
    `
const [step, setStep] = useState(1);

<Steps
  data={[
    { title: "Başvuru" },
    { title: "İnceleme" },
    { title: "Mülakat", disabled: true },
    { title: "Teklif" },
  ]}
  currentStep={step}
  onChange={setStep}
  showActions={false}
/>`
  ),
  render: () => {
    const [step, setStep] = useState(1);
    return (
      <Steps
        data={basicSteps.map((s, i) => ({ ...s, disabled: i === 2 }))}
        currentStep={step}
        onChange={setStep}
        showActions={false}
      />
    );
  },
};

export const Responsive: Story = {
  name: "Duyarlı",
  ...storyDoc(
    "Yatay Steps, kapsayıcısı `responsive` (varsayılan 520px) altına inince dar düzene geçer — başlıklar " +
      "sıkışıp kesilmez. `responsiveLayout=\"vertical\"` (varsayılan) açıklamalı zaman çizelgeleri için; " +
      "`\"compact\"` içeriği adımların altında olan sihirbazlar için. Kutular 340px genişliğinde. Eşik " +
      "ekran değil KAPSAYICI genişliğidir — dar bir kartın içinde masaüstünde de devreye girer.",
    `
<Steps data={steps} currentStep={2} />                            {/* dar: dikey */}
<Steps data={steps} currentStep={2} responsiveLayout="compact" /> {/* dar: kompakt */}`
  ),
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(["vertical", "compact"] as const).map((mode) => (
        <div key={mode} className="w-full max-w-[340px] rounded-xl border border-dashed border-mari-border p-4">
          <p className="mb-4 font-mono text-xs text-mari-muted">responsiveLayout="{mode}"</p>
          <Steps data={basicSteps} currentStep={2} responsiveLayout={mode} />
        </div>
      ))}
    </div>
  ),
};

/* ─────────────────────────── Görünüm seçenekleri ─────────────────────────── */


export const Variants: Story = {
  name: "Görünüm: filled / outlined",
  ...storyDoc(
    "`filled` (varsayılan): tamamlanan tonlu, geçerli dolu, bekleyen nötr. `outlined`: hepsi çerçeveli, daha hafif.",
    `
<Steps data={steps} currentStep={2} />
<Steps data={steps} currentStep={2} variant="outlined" />`
  ),
  render: () => (
    <div className="flex flex-col gap-10">
      <Steps data={basicSteps} currentStep={2} />
      <Steps data={basicSteps} currentStep={2} variant="outlined" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "Boyut: md / sm",
  ...storyDoc("`md` (32px, varsayılan) ve `sm` (24px) — kartlar ve yoğun tablolar için.", `
<Steps data={steps} currentStep={3} />
<Steps data={steps} currentStep={3} size="sm" />`),
  render: () => (
    <div className="flex flex-col gap-10">
      <Steps data={basicSteps} currentStep={3} />
      <Steps data={basicSteps} currentStep={3} size="sm" />
    </div>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color` — aktif/tamamlanan adımların rolü. Hata her zaman `error` rengindedir.", `
<Steps data={steps} currentStep={3} color="success" />`),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["primary", "accent", "success", "warning", "info", "neutral"] as const).map((color) => (
        <Steps key={color} data={basicSteps} currentStep={3} color={color} size="sm" />
      ))}
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — adımlar sunucudan gelirken: göstergeler aynı dairelerde, başlık ve açıklamalar kendi metin " +
      "kutularında (satır kırılmaları korunur) yer tutucu; çizgiler nötr, eylem düğmeleri iskelet, adımlar tıklanamaz. " +
      "Yüklenince hiçbir şey kaymaz.",
    `<Steps data={steps} currentStep={2} onChange={setStep} skeleton={!order} />`
  ),
  render: () => {
    const [step, setStep] = useState(2);
    return (
      <SkeletonDemo>
        {(skeleton) => (
          <div className="flex flex-col gap-6">
            <Steps data={basicSteps} currentStep={step} onChange={setStep} skeleton={skeleton} />
            <Steps data={trackingSteps} currentStep={3} vertical skeleton={skeleton} />
          </div>
        )}
      </SkeletonDemo>
    );
  },
};
