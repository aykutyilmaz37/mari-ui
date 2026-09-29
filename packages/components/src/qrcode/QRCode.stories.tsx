/**
 * Faz 16.3: gerçek senaryolar — sayfa paylaşımı (SVG indir), QR ile giriş
 * (durum akışı), Wi-Fi paylaşımı (Türkçe karakterli ağ adı), stiller
 * (nokta/köşe/gradyan/logo), iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DownloadIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { QRCode } from ".";
import { Button } from "../button";
import { Switch } from "../switch";

const meta: Meta<typeof QRCode> = {
  title: "Veri Gösterimi/QRCode",
  component: QRCode,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Metni (URL, Wi-Fi, vCard) QR koda çevirir. Saf SVG: sunucuda da çizilir, her çözünürlükte keskin. Nokta ve " +
            "köşe şekilleri, gradyan, ortada logo; `status` ile hazırlanıyor / süresi doldu (Yenile) / tarandı katmanı. " +
            "İçerik UTF-8 kodlanır — Türkçe karakterler güvenli.",
          whenToUse: [
            "Masaüstündeki içeriği telefona taşımak: sayfa bağlantısı, uygulama indirme, Wi-Fi.",
            "Telefonla onaylanan giriş/ödeme (süreli kod + durum).",
          ],
          whenNotToUse: [
            "Kullanıcı zaten telefondaysa — bağlantıyı/düğmeyi doğrudan verin.",
            "Kodun tek bilgi kaynağı olduğu yerler — içeriği her zaman metin olarak da gösterin.",
          ],
          a11y:
            "`role=\"img\"` + ad (`aria-label`, varsayılan \"QR kod\"): QR'ın neye götürdüğünü söyleyin. Görme engelli " +
            "kullanıcı kodu okutamaz — URL'yi ya da bilgiyi görünür metin olarak da verin. Durum katmanı `role=\"status\"`. " +
            "Varsayılan renkler her temada koyu-üstü-açık (bazı okuyucular ters QR'ı çözemez); özel renkte kontrastı " +
            "yüksek tutun, logo varsa hata düzeyi otomatik `H`.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: "text" },
    size: { control: "text", table: { defaultValue: { summary: '"10rem"' } } },
    errorLevel: { control: "inline-radio", options: ["L", "M", "Q", "H"] },
    color: { control: "color" },
    colorEnd: { control: "color" },
    bgColor: { control: "color" },
    cornerColor: { control: "color" },
    dotType: { control: "select", options: ["square", "rounded", "dots", "extra-rounded"] },
    cornerSquareType: { control: "select", options: ["square", "extra-rounded", "dot"] },
    cornerDotType: { control: "select", options: ["square", "dot", "heart"] },
    icon: { control: "text" },
    bordered: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    status: { control: "inline-radio", options: ["active", "loading", "expired", "scanned"] },
    onRefresh: { table: { category: "Olaylar" } },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof QRCode>;

/** Story'ler için basit logo (data URI SVG). */
const LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#2f66a3"/><text x="20" y="27" font-family="Arial" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">m</text></svg>');

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  args: { value: "https://mari-ui.dev", size: "10rem", dotType: "rounded", cornerSquareType: "extra-rounded", cornerDotType: "dot", bordered: true, status: "active" },
};

/* ─────────────────────────── 1. Paylaş ─────────────────────────── */

export const SharePage: Story = {
  name: "Sayfayı Telefona Gönder (SVG indir)",
  ...storyDoc(
    "QR'ın götürdüğü adres görünür metin olarak da yazılır. SVG olduğu için indirme = elemanı dosyaya yazmak (baskıda " +
      "keskin kalır).",
    `
const ref = useRef<HTMLDivElement>(null);
const download = () => {
  const svg = ref.current!.querySelector("svg")!.outerHTML;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  Object.assign(document.createElement("a"), { href: url, download: "mari-ui-qr.svg" }).click();
  URL.revokeObjectURL(url);
};

<div ref={ref}>
  <QRCode value="https://mari-ui.dev/components/qrcode" aria-label="Bu sayfanın adresine giden QR kod" />
</div>
<p>mari-ui.dev/components/qrcode</p>
<Button icon={<DownloadIcon />} onClick={download}>SVG indir</Button>`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const download = () => {
      const svg = ref.current?.querySelector("svg");
      if (!svg) return;
      const url = URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml" }));
      Object.assign(document.createElement("a"), { href: url, download: "mari-ui-qr.svg" }).click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="flex max-w-xs flex-col items-center gap-3 rounded-xl border border-mari-border bg-mari-surface p-5 text-center">
        <p className="font-semibold text-mari-foreground">Telefonda aç</p>
        <div ref={ref}>
          <QRCode value="https://mari-ui.dev/components/qrcode" bordered={false} aria-label="Bu sayfanın adresine giden QR kod" />
        </div>
        <p className="text-sm break-all text-mari-muted">mari-ui.dev/components/qrcode</p>
        <Button size="sm" variant="outline" icon={<DownloadIcon />} onClick={download}>
          SVG indir
        </Button>
      </div>
    );
  },
};

/* ─────────────────────────── 2. QR ile giriş ─────────────────────────── */

export const LoginFlow: Story = {
  name: "QR ile Giriş (status)",
  ...storyDoc(
    "Süreli giriş kodu: `loading` (kod hazırlanıyor) → `active` → telefon okutunca `scanned` → süre dolarsa `expired` " +
      "ve \"Yenile\" (`onRefresh`). Durum değişimi ekran okuyucuya duyurulur. Burada 5 sn sonra süre doluyor.",
    `
const [status, setStatus] = useState<QRStatus>("loading");
const [token, setToken] = useState("");

<QRCode
  value={\`https://mari-ui.dev/login?t=\${token}\`}
  status={status}
  onRefresh={() => fetchNewToken()}
  aria-label="Telefonla giriş QR kodu"
/>`
  ),
  render: () => {
    const [status, setStatus] = useState<"loading" | "active" | "expired" | "scanned">("loading");
    const [token, setToken] = useState(1);
    useEffect(() => {
      if (status === "loading") {
        const t = setTimeout(() => setStatus("active"), 800);
        return () => clearTimeout(t);
      }
      if (status === "active") {
        const t = setTimeout(() => setStatus("expired"), 5000);
        return () => clearTimeout(t);
      }
    }, [status]);
    return (
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <QRCode
          value={`https://mari-ui.dev/login?t=${token}`}
          status={status}
          onRefresh={() => {
            setToken((t) => t + 1);
            setStatus("loading");
          }}
          aria-label="Telefonla giriş QR kodu"
        />
        <p className="text-sm text-mari-muted">Uygulamayı açın › Profil › QR ile giriş</p>
        <Button size="sm" variant="ghost" onClick={() => setStatus("scanned")} disabled={status !== "active"}>
          (Demo) Telefonda okut
        </Button>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Wi-Fi ─────────────────────────── */

export const WifiShare: Story = {
  name: "Wi-Fi Paylaşımı (Türkçe karakter)",
  ...storyDoc(
    "Wi-Fi kartı: `WIFI:T:WPA;S:<ağ>;P:<şifre>;;` biçimi telefon kamerasıyla okutulunca ağa bağlar. Ağ adı " +
      "\"Şişli Kafe Misafir\" UTF-8 kodlanır (kütüphanenin varsayılanı \"ş\"yi \"_\" yapardı).",
    `<QRCode value="WIFI:T:WPA;S:Şişli Kafe Misafir;P:çay-simit-2026;;" aria-label="Şişli Kafe Misafir Wi-Fi ağına bağlanma kodu" />`
  ),
  render: () => (
    <div className="flex max-w-sm items-center gap-4 rounded-xl border border-mari-border bg-mari-surface p-4">
      <QRCode value="WIFI:T:WPA;S:Şişli Kafe Misafir;P:çay-simit-2026;;" size="7rem" margin={1} aria-label="Şişli Kafe Misafir Wi-Fi ağına bağlanma kodu" />
      <dl className="flex flex-col gap-1 text-sm">
        <dt className="text-mari-muted">Ağ</dt>
        <dd className="font-medium text-mari-foreground">Şişli Kafe Misafir</dd>
        <dt className="text-mari-muted">Şifre</dt>
        <dd className="font-mono text-mari-foreground">çay-simit-2026</dd>
      </dl>
    </div>
  ),
};

/* ─────────────────────────── 4. Stiller ─────────────────────────── */

export const Styles: Story = {
  name: "Stiller (nokta, köşe, gradyan, logo)",
  ...storyDoc(
    "Nokta tipi (`dotType`), konum işareti halkası (`cornerSquareType`) ve merkezi (`cornerDotType`), `colorEnd` ile " +
      "gradyan, `icon` ile logo (hata düzeyi otomatik H). Özel renkte koyu nokta + açık zemin kontrastını koruyun.",
    `
<QRCode value="…" />                                                    // klasik
<QRCode value="…" dotType="rounded" cornerSquareType="extra-rounded" cornerDotType="dot" />
<QRCode value="…" dotType="dots" cornerSquareType="dot" cornerDotType="dot" color="#2f66a3" colorEnd="#557293" />
<QRCode value="…" dotType="extra-rounded" cornerSquareType="extra-rounded" icon={logoUrl} />`
  ),
  render: () => {
    const value = "https://mari-ui.dev";
    return (
      <div className="flex flex-wrap gap-6">
        {[
          { label: "Klasik", props: {} },
          { label: "Yuvarlak", props: { dotType: "rounded", cornerSquareType: "extra-rounded", cornerDotType: "dot" } },
          { label: "Noktalı + gradyan", props: { dotType: "dots", cornerSquareType: "dot", cornerDotType: "dot", color: "#2f66a3", colorEnd: "#557293" } },
          { label: "Logolu", props: { dotType: "extra-rounded", cornerSquareType: "extra-rounded", cornerDotType: "square", icon: LOGO } },
        ].map(({ label, props }) => (
          <figure key={label} className="flex flex-col items-center gap-2">
            <QRCode value={value} size="8rem" aria-label={`${label} QR kod örneği`} {...(props as object)} />
            <figcaption className="text-sm text-mari-muted">{label}</figcaption>
          </figure>
        ))}
      </div>
    );
  },
};

/* ─────────────────────────── 5. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet (skeleton)",
  ...storyDoc("`skeleton`: değer (ör. sunucudan gelen token) hazır değilken aynı boyutta yer tutucu.", `<QRCode skeleton={!token} value={url} />`),
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex flex-col items-start gap-4">
        <Switch checked={on} onChange={setOn} label="İskelet" />
        <QRCode skeleton={on} value="https://mari-ui.dev" />
      </div>
    );
  },
};
