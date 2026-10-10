import React, { useEffect, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { BadgeCheck, Building2, CreditCard, FileText, FlaskConical, Hammer, Rocket, ScanFace, ShoppingBag, Sparkles, Truck, UserRound, UsersRound } from "lucide-react-native";
import { Steps, StepsContent, type StepData } from "./Steps";
import { Alert } from "../Alert";
import { Button } from "../Button";
import { Card } from "../Card";
import { Input } from "../Input";
import { Field } from "../Field";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Steps> = {
  title: "Native/Navigasyon/Steps",
  component: Steps,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Çok adımlı süreçte kullanıcının nerede olduğunu gösterir. Dört durum (`wait` / `process` / `finish` / `error`), yatay/dikey, başlık yanında/altında, nokta, ilerleme halkası, `filled` / `outlined`.",
    whenToUse: ["Ödeme, kayıt, kurulum sihirbazı.", "Bir sürecin durumunu salt okunur göstermek (sipariş takibi, dağıtım hattı)."],
    whenNotToUse: ["Tek adımlı form.", "Serbestçe gezilen bölümler — Tabs."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`, `icon` bir `{ size, color }` alan component — ör. lucide-react-native). `responsive` (varsayılan 520) kapsayıcı genişliğine bakar → telefonda yatay Steps kendiliğinden dikey liste (ya da `responsiveLayout=\"compact\"` ile yalnız göstergeler + \"Adım 2/4 · Başlık\") olur; yatay görmek için `responsive={false}`. Hover yok. Dokunulabilir adım ekran okuyucuda düğme, durumu adında (\"Teslimat (devam ediyor)\"). Ölçüler `nativeConfig.steps`.",
  }) } } },
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
    variant: { control: "select", options: ["filled", "outlined"] },
    status: { control: "select", options: ["process", "finish", "error"] },
    labelPlacement: { control: "select", options: ["horizontal", "vertical"] },
    responsiveLayout: { control: "select", options: ["vertical", "compact"] },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"] },
    vertical: { control: "boolean" },
    dot: { control: "boolean" },
    skeleton: { control: "boolean" },
    currentStep: { control: { type: "number", min: 1, max: 4 } },
  },
  args: { currentStep: 2, status: "process", size: "md", variant: "filled", vertical: false, dot: false, labelPlacement: "horizontal", responsiveLayout: "vertical", color: "primary", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Steps>;

const HIRING: StepData = [
  { title: "Başvuru", description: "Form gönderildi" },
  { title: "İnceleme", description: "Ekip değerlendiriyor" },
  { title: "Mülakat", description: "Takvim bekleniyor" },
  { title: "Teklif" },
];

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin. Telefonda yatay görmek için `responsive={false}` gerekir; burada dar düzen açık."),
  render: (args) => <Steps {...args} data={HIRING} />,
};

const CHECKOUT: StepData = [
  { title: "Sepet", icon: ShoppingBag },
  { title: "Teslimat", icon: Truck },
  { title: "Ödeme", icon: CreditCard },
  { title: "Onay", icon: BadgeCheck },
];

function CheckoutDemo() {
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [done, setDone] = useState(false);
  const go = (s: number) => {
    setStep(s);
    setMaxReached((m) => Math.max(m, s));
  };
  if (done) return <Alert color="success" title="Siparişiniz alındı" description="Onay e-postası yolda." />;
  return (
    <Card>
      <Steps
        currentStep={step}
        onChange={go}
        onComplete={() => setDone(true)}
        responsiveLayout="compact"
        data={CHECKOUT.map((s, i) => ({ ...s, disabled: i + 1 > maxReached }))}
        content={
          <>
            <StepsContent value={1} currentSteps={step}>
              <Text>2 ürün · 6.298 ₺</Text>
            </StepsContent>
            <StepsContent value={2} currentSteps={step}>
              <Field label="Teslimat adresi">
                <Input placeholder="Mahalle, sokak, no" />
              </Field>
            </StepsContent>
            <StepsContent value={3} currentSteps={step}>
              <Field label="Kart üzerindeki ad">
                <Input placeholder="Ad Soyad" />
              </Field>
            </StepsContent>
            <StepsContent value={4} currentSteps={step}>
              <Text>Her şey hazır. "Tamamla"ya dokunun.</Text>
            </StepsContent>
          </>
        }
      />
    </Card>
  );
}

export const Checkout: Story = {
  name: "Ödeme Akışı",
  ...storyDoc(
    "Telefonda tipik sihirbaz: `responsiveLayout=\"compact\"` — yalnız göstergeler + \"Adım 2/4 · Teslimat\", içerik altta (`StepsContent`), Geri/İleri/Tamamla çubuğu. Henüz varılmamış adımlar `disabled`; geçilmiş adıma dokunarak dönülür.",
    `<Steps
  currentStep={step}
  onChange={setStep}
  onComplete={submit}
  responsiveLayout="compact"
  data={[{ title: "Sepet", icon: ShoppingBag }, { title: "Teslimat", icon: Truck, disabled: maxReached < 2 }, …]}
  content={<StepsContent value={2} currentSteps={step}>…</StepsContent>}
/>`
  ),
  render: () => <CheckoutDemo />,
};

const SETUP: StepData = [
  { title: "Profil", description: "Adınız ve rolünüz", icon: UserRound },
  { title: "Çalışma alanı", description: "Şirket adı ve adres", icon: Building2 },
  { title: "Ekibi davet et", description: "İsteğe bağlı", icon: UsersRound },
  { title: "Plan seçimi", description: "14 gün ücretsiz", icon: Sparkles },
];

function SetupDemo() {
  const [step, setStep] = useState(2);
  return (
    <Card>
      <View style={{ gap: 16 }}>
        <Title level={5}>Hesabınızı kurun</Title>
        <Steps vertical currentStep={step} onChange={setStep} data={SETUP} />
      </View>
    </Card>
  );
}

export const AccountSetup: Story = {
  name: "Hesap Kurulumu (Dikey)",
  ...storyDoc("`vertical` — açıklamalı dikey liste; her adım dokunulabilir.", `<Steps vertical currentStep={step} onChange={setStep} data={[{ title: "Profil", description: "Adınız ve rolünüz", icon: UserRound }, …]} />`),
  render: () => <SetupDemo />,
};

const TRACKING: StepData = [
  { title: "Sipariş alındı", subTitle: "24 Eyl, 14:02", description: "Ödemeniz onaylandı." },
  { title: "Hazırlanıyor", subTitle: "24 Eyl, 17:45", description: "Ürünleriniz paketlendi." },
  { title: "Kargoya verildi", subTitle: "25 Eyl, 09:10", description: "Yurtiçi Kargo · Takip no: 4821 3390 17" },
  { title: "Dağıtımda", subTitle: "Bugün, 08:30", description: "Kurye bugün 13:00-17:00 arasında teslim edecek." },
  { title: "Teslim edildi", description: "Tahmini: bugün" },
];

export const OrderTracking: Story = {
  name: "Sipariş Takibi (Salt Okunur)",
  ...storyDoc("`onChange` yok → salt okunur; `subTitle` tarih, `description` ayrıntı. `size=\"sm\"`.", `<Steps vertical size="sm" currentStep={4} data={[{ title: "Sipariş alındı", subTitle: "24 Eyl, 14:02", description: "Ödemeniz onaylandı." }, …]} />`),
  render: () => (
    <Card>
      <Steps vertical size="sm" currentStep={4} data={TRACKING} />
    </Card>
  ),
};

const KYC: StepData = [
  { title: "Kişisel bilgiler", icon: UserRound },
  { title: "Kimlik belgesi", icon: FileText },
  { title: "Yüz doğrulama", icon: ScanFace },
  { title: "Onay", icon: BadgeCheck },
];

export const ErrorState: Story = {
  name: "Hata Durumu",
  ...storyDoc("`status=\"error\"` — geçerli adım hata rengiyle ve × ikonuyla; ekran okuyucu \"(hata)\" der.", `<Steps vertical currentStep={3} status="error" data={[…, { title: "Yüz doğrulama", description: "Işık yetersiz — tekrar deneyin" }, …]} />`),
  render: () => (
    <Card>
      <Stack>
        <Steps vertical currentStep={3} status="error" data={KYC.map((s, i) => (i === 2 ? { ...s, description: "Işık yetersiz — tekrar deneyin" } : s))} />
        <Button color="error" variant="soft">Tekrar dene</Button>
      </Stack>
    </Card>
  ),
};

function PipelineDemo() {
  const total = 286;
  const [done, setDone] = useState(184);
  useEffect(() => {
    if (done >= total) return;
    const t = setTimeout(() => setDone((d) => Math.min(total, d + 6)), 120);
    return () => clearTimeout(t);
  }, [done]);
  const finished = done >= total;
  return (
    <Card>
      <View style={{ gap: 12 }}>
        <Steps
          responsive={false}
          labelPlacement="vertical"
          size="sm"
          currentStep={finished ? 3 : 2}
          percent={finished ? undefined : (done / total) * 100}
          data={[
            { title: "Derleme", subTitle: "42 sn", icon: Hammer },
            { title: "Testler", subTitle: `${done}/${total}`, icon: FlaskConical },
            { title: "Yayına alma", subTitle: finished ? "başladı" : undefined, icon: Rocket },
          ]}
        />
        <Button size="sm" variant="ghost" color="neutral" style={{ alignSelf: "flex-start" }} onPress={() => setDone(120)}>
          Yeniden çalıştır
        </Button>
      </View>
    </Card>
  );
}

export const ProgressRing: Story = {
  name: "İlerleme Halkası (Dağıtım Hattı)",
  ...storyDoc("`percent` — geçerli adımın göstergesinde halka; ekran okuyucu \"devam ediyor, %64\". Üç kısa adım telefonda da yatay sığar: `responsive={false}` + `labelPlacement=\"vertical\"`.", `<Steps responsive={false} labelPlacement="vertical" size="sm" currentStep={2} percent={64} data={[{ title: "Derleme", subTitle: "42 sn", icon: Hammer }, …]} />`),
  render: () => <PipelineDemo />,
};

export const LabelBelow: Story = {
  name: "Başlık Altta",
  ...storyDoc("`labelPlacement=\"vertical\"` — başlık göstergenin altında ortalı; çizgi göstergeden göstergeye uzanır.", `<Steps responsive={false} labelPlacement="vertical" currentStep={2} data={[{ title: "Sepet" }, { title: "Teslimat" }, { title: "Ödeme" }]} />`),
  render: () => <Steps responsive={false} labelPlacement="vertical" currentStep={2} data={[{ title: "Sepet" }, { title: "Teslimat" }, { title: "Ödeme" }]} />,
};

export const Dot: Story = {
  name: "Nokta",
  ...storyDoc("`dot` — numara yerine nokta. Yatayda başlık hep altta; dikeyde sade zaman çizelgesi.", `<Steps dot responsive={false} currentStep={2} data={…} />
<Steps dot vertical currentStep={3} data={…} />`),
  render: () => (
    <View style={{ gap: 24 }}>
      <Steps dot responsive={false} currentStep={2} data={[{ title: "Gönderildi" }, { title: "Yolda" }, { title: "Teslim" }]} />
      <Steps dot vertical size="sm" currentStep={3} data={TRACKING.slice(0, 4)} />
    </View>
  ),
};

export const Responsive: Story = {
  name: "Duyarlı",
  ...storyDoc(
    "Varsayılan `responsive={520}`: kapsayıcı 520pt'nin altında yatay Steps dikey listeye (ya da `compact`a) geçer — telefonda her zaman. `responsive={false}` yatayda tutar (yalnız 2–3 kısa adımda).",
    `<Steps currentStep={2} data={HIRING} />                          {/* telefonda dikey */}
<Steps currentStep={2} data={HIRING} responsiveLayout="compact" />`
  ),
  render: () => (
    <View style={{ gap: 24 }}>
      <Steps currentStep={2} data={HIRING} />
      <Steps currentStep={2} data={HIRING} responsiveLayout="compact" />
    </View>
  ),
};

export const Variants: Story = {
  name: "Görünüm: filled / outlined",
  ...storyDoc("`filled` (varsayılan): geçerli adım dolu, tamamlanan tonlu. `outlined`: hepsi çerçeveli.", `<Steps variant="outlined" currentStep={2} data={…} />`),
  render: () => (
    <View style={{ gap: 24 }}>
      <Steps responsiveLayout="compact" currentStep={2} data={CHECKOUT} />
      <Steps responsiveLayout="compact" variant="outlined" currentStep={2} data={CHECKOUT} />
    </View>
  ),
};

export const Sizes: Story = {
  name: "Boyut: md / sm",
  ...storyDoc("`md` (32, varsayılan) ve `sm` (24) — kartlar ve yoğun listeler için.", `<Steps size="sm" vertical currentStep={2} data={…} />`),
  render: () => (
    <View style={{ gap: 24 }}>
      <Steps vertical currentStep={2} data={HIRING.slice(0, 3)} />
      <Steps vertical size="sm" currentStep={2} data={HIRING.slice(0, 3)} />
    </View>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color` — aktif/tamamlanan adımların rolü. Hata her zaman `error` renginde.", `<Steps color="success" currentStep={3} data={…} />`),
  render: () => (
    <View style={{ gap: 20 }}>
      {(["primary", "accent", "success", "info", "neutral"] as const).map((color) => (
        <Steps key={color} color={color} responsiveLayout="compact" currentStep={3} data={CHECKOUT} />
      ))}
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Göstergeler aynı dairelerde, başlık/açıklama kendi metin kutularında; çizgiler nötr; eylem düğmeleri iskelet.", `<Steps skeleton={isLoading} vertical currentStep={2} onChange={setStep} data={…} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Steps skeleton={skeleton} vertical currentStep={2} onChange={() => undefined} data={SETUP} />}</SkeletonDemo>,
};
