/**
 * Tüketici projede AI'ın "proje nasıl kurulur ve tasarlanır"
 * bilgisi. İki katman:
 *
 * `MUST_RULES`: az sayıda KESİN kural. Kısa tutulur; her araç dosyasına ve
 *  `CLAUDE.md`ye girer (her istekte okunur).
 * - `SKILL_GUIDE`: ÖNERİ niteliğinde ayrıntılı rehber (sayfa kurma adımları,
 *  layout kalıpları, component seçimi). Yalnız Claude skill'ine (`SKILL.md`)
 *  girer — Claude onu ilgili işte yükler, kural dosyalarını şişirmez.
 *
 * Framework'ten bağımsız (Next/Vite/… dikte edilmez). Elle yazılı: bunlar
 * koddan türetilemeyen tasarım kararları. Component adları `manifest.json`daki
 * gerçek export'larla aynı tutulmalı (test bunu denetler).
 */

export interface MustRule {
  title: string;
  rule: string;
  why: string;
}

export const MUST_RULES: readonly MustRule[] = [
  {
    title: "Önce mari-ui",
    rule: "İhtiyacı karşılayan bir mari-ui component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama mari-ui token'larıyla; ayrı bir stil dili icat etme.",
    why: "Tutarlılık, erişilebilirlik ve tema desteği component'lerde zaten çözülmüş.",
  },
  {
    title: "Sabit renk yok",
    rule: "Yalnız token sınıfları (`bg-mari-*`, `text-mari-*`, `border-mari-*`) ya da component'in `color` prop'u. Hex, `rgb()`, Tailwind'in hazır paleti (`bg-blue-500`) yasak.",
    why: "Koyu mod, son kullanıcının seçtiği vurgu rengi ve otomatik kontrast düzeltmesi sabit renkte çalışmaz.",
  },
  {
    title: "Sabit px yok",
    rule: "Boşluk ve boyutlar Tailwind ölçeğinden (`p-4`, `gap-2`, `h-10`); `p-[13px]` gibi arbitrary değer yok. Yazı boyutu `text-sm/base/lg…`.",
    why: "Yoğunluk ayarı (`--spacing`) ve büyük ekran ölçeği (kök yazı boyutu) her şeyi rem üzerinden ölçekler; sabit px bunların dışında kalır.",
  },
  {
    title: "Gölge, köşe, katman skaladan",
    rule: "`shadow-mari-*`, `rounded-sm/md/lg/xl`, `z-mari-*`. `shadow-2xl`, `rounded-[10px]`, `z-[999]` yok.",
    why: "Radius ön ayarı ve katman sırası (modal > dropdown > tooltip) tek skaladan yönetiliyor.",
  },
  {
    title: "Yüklenme `skeleton` ile",
    rule: "Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme.",
    why: "Sayfa yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.",
  },
  {
    title: "Erişilebilirlik temeli",
    rule: "Yalnız ikonlu düğmelerde `aria-label`; her form kontrolü `Field` (ya da `label`/`aria-label`) ile adlı; tıklanabilir öğe `button`/`a`, `div onClick` değil.",
    why: "Ekran okuyucu ve klavye kullanıcıları için asgari şart; component'ler gerisini çözüyor.",
  },
  {
    title: "Linkler düz `<a href>`",
    rule: "Menü/breadcrumb gibi component'lere `href` ver; SPA geçişi için `onNavigate` prop'una router'ın gezinme fonksiyonunu geçir. Router'a özel Link sarmalayıcısı yazma.",
    why: "Component'ler router'dan bağımsız; yeni sekmede açma, dış link ve erişilebilirlik bu şekilde doğru çalışır.",
  },
];

export function formatMustRules(): string {
  return MUST_RULES.map((r, i) => `${i + 1}. **${r.title}.** ${r.rule} _Neden:_ ${r.why}`).join("\n");
}

/** Rehberde adı geçen component'ler — test, hepsinin manifest'te var olduğunu denetler. */
export const GUIDE_COMPONENTS = [
  "BasicMenu",
  "MegaMenu",
  "Sidebar",
  "Breadcrumb",
  "Tabs",
  "Steps",
  "Card",
  "Table",
  "List",
  "Pagination",
  "Empty",
  "Alert",
  "Modal",
  "Drawer",
  "Popconfirm",
  "Popover",
  "Tooltip",
  "Dropdown",
  "Select",
  "Segmented",
  "RadioGroup",
  "Switch",
  "Checkbox",
  "Field",
  "Input",
  "Textarea",
  "Button",
  "ToastProvider",
  "Statistic",
  "Masonry",
  "ThemeCustomizer",
  "Title",
  "Text",
  "LineChart",
  "BarChart",
  "PieChart",
  "Gauge",
  "Sparkline",
  "Progress",
] as const;

export const SKILL_GUIDE = `## Sayfa kurma rehberi (öneri)

Aşağıdakiler öneri: projenin ihtiyacı ve kişiliği farklıysa sapabilirsin (bkz. Serbest alanlar), ama yukarıdaki kesin kurallar her zaman geçerli.

### Proje tasarım brief'i (yeni projede ya da ilk sayfada bir kez)

Kopya görünümün kaynağı component'ler değil, her projede aynı tema + aynı sayfa iskeletidir. Bu yüzden ilk sayfadan önce kısa bir brief çıkar (kullanıcıya sor ya da isteğinden türet ve onaylat):

1. **Hedef kitle ve amaç:** kim kullanacak, ne yapmaya geliyor (B2B panel, tüketici uygulaması, içerik sitesi, marka vitrini…).
2. **Ton:** güven veren / enerjik / sade / okumaya odaklı / prestijli.
3. **Referanslar:** kullanıcının beğendiği 2–3 site ya da uygulama; neyini beğendiği (renk, tipografi, boşluk, hareket).
4. **Kişilik seç:** tona en yakın kişilik — \`corporate\` (Kurumsal), \`playful\` (Oyunbaz), \`minimal\` (Minimal), \`editorial\` (Editoryal), \`luxury\` (Lüks) ya da varsayılan. \`npx @mari-ui/cli theme --persona <ad>\` (varsayılan tema: \`--persona default\`; tamamen kendi rengi: \`--primary #hex\`) — bayraklı çalıştır, etkileşimli soru soramazsın. Marka rengi kişilikten farklıysa \`mari-ui.config.json\`'da yalnız \`color.primary\`'yi ez ve \`npx @mari-ui/cli theme --yes\`; sonra \`npx @mari-ui/cli sync\`.
5. **Düzen yönü:** kişiliğe uygun bir sayfa dili seç ve tüm sayfalarda tutarlı uygula — ör. Editoryal: geniş tipografik başlık, dar okuma sütunu, az kart; Oyunbaz: büyük yuvarlak kartlar, renkli vurgular, canlı giriş hareketleri; Kurumsal: sıkı tablolar, yan menü, az süs; Minimal: bol boşluk, çerçevesiz bölümler; Lüks: büyük görsel alanlar, serif başlık, yavaş geçişler.

Brief'i projenin README'sine (ya da bir \`docs/design-brief.md\`ye) kısa not olarak yaz; sonraki sayfalar ona uysun.

### Bir sayfa isteğinde iş akışı

1. **Sayfanın türünü belirle:** liste/tablo, detay, form, panel (dashboard), ayarlar. Aşağıdaki kalıplardan en yakınını temel al.
2. **Envanterden parçaları seç.** Her bölüm için önce mari-ui component'i ara; eksik kalan için proje component'i yaz (kesin kural 1).
3. **Dört durumu da kur:** yükleniyor (\`skeleton\`), boş (\`Empty\`), hata (\`Alert\` ya da \`Empty\` + yeniden dene düğmesi), dolu.
4. **Dar ekranı düşün:** tek sütuna düşen grid, kaydırılan ya da akordeona dönen tablo (\`Table\` \`responsive\`), mobilde çekmeceye dönen menü.
5. **Metinleri gerçekçi yaz** ve sayfa başlığını \`Title\` ile ver.

### Uygulama iskeleti

- **Üst gezinme:** az sayıda bölüm → \`BasicMenu\`; çok sayıda kategori ve görsel panel → \`MegaMenu\`. İkisi de mobilde kendi çekmecesine döner.
- **Yan gezinme:** yönetim panelleri ve çok seviyeli menüler → \`Sidebar\`.
- **Konum:** iki seviyeden derin sayfalarda içeriğin üstünde \`Breadcrumb\`.
- **İçerik genişliği:** okunabilir içerik için \`max-w-*\` (ör. \`max-w-5xl mx-auto\`) + \`px-4 md:px-6\`; tablolar ve paneller tam genişlik kullanabilir.
- **Bölümler arası boşluk** dikey \`gap-6\`/\`gap-8\`; kart içi \`gap-3\`/\`gap-4\`.

### Sayfa kalıpları

- **Liste/tablo sayfası:** başlık satırı (\`Title\` + birincil eylem \`Button\`), filtre satırı (\`Input\` arama, \`Select\`, \`Segmented\`), \`Table\` ya da \`List\`, altta \`Pagination\` (Table'da \`footer\` yuvasına; tablo veriyi dilimlemez). Uzun ve sürekli akışta \`List\` \`onLoadMore\`.
- **Detay sayfası:** \`Breadcrumb\`, başlık + eylemler, içerik \`Card\`'larda; ilgili alt kümeler \`Tabs\` ile.
- **Form sayfası:** her alan \`Field\` içinde (etiket, ipucu, hata metni); uzun formu \`Card\` bölümlerine ayır; çok adımlıysa \`Steps\`; kaydet/vazgeç düğmeleri en altta, birincil eylem tek.
- **Panel (dashboard):** üstte \`Statistic\` kartları (\`grid sm:grid-cols-2 lg:grid-cols-4\`, eğilim için altına \`Sparkline\`), altında grafik/tablo kartları; farklı yükseklikte kartlar için \`Masonry\`.
- **Ayarlar sayfası:** bölüm başına \`Card\`, \`Field\` yatay düzen; anlık açılıp kapanan tercihler \`Switch\`. Görünüm tercihi için \`ThemeCustomizer\`.

### Component seçimi

| Durum | Kullan | Kullanma |
|---|---|---|
| Kullanıcının odaklanması gereken kısa karar/form | \`Modal\` | Uzun form için Modal |
| Bağlamı kaybetmeden yan panelde düzenleme/detay | \`Drawer\` | Tek bir onay sorusu için Drawer |
| Bir eylemin hemen yanında "emin misiniz?" | \`Popconfirm\` | Geri alınamaz büyük işlem → \`Modal\` |
| Kısa açıklama, yalnız metin, etkileşim yok | \`Tooltip\` | İçinde düğme/link → \`Popover\` |
| Tetikleyiciye bağlı zengin içerik (form, liste) | \`Popover\` | |
| Eylem menüsü (düzenle, sil…) | \`Dropdown\` | Değer seçimi için Dropdown → \`Select\` |
| 2–5 seçenekten biri, hepsi görünsün | \`Segmented\` ya da \`RadioGroup\` | Uzun liste → \`Select\` |
| Çok seçenekten biri/birkaçı | \`Select\` | |
| Anında uygulanan aç/kapa | \`Switch\` | Gönderilecek formda onay → \`Checkbox\` |
| İşlem sonrası geçici bildirim | Toast (\`ToastProvider\` + \`useToast\`) | Kalıcı uyarı → \`Alert\` |
| Sayfada kalıcı uyarı/bilgi | \`Alert\` | |
| Aynı seviyede içerik grupları arası geçiş | \`Tabs\` | Sıralı süreç → \`Steps\` |
| Kayıt yok / sonuç yok | \`Empty\` (eylem düğmesiyle) | Boş beyaz alan |
| Zaman içinde değişim (aylık gelir, günlük ziyaret) | \`LineChart\` (\`area\` ile alan) | Kategori karşılaştırması için çizgi |
| Kategoriler arası büyüklük (kanal, bölge, ürün) | \`BarChart\` (uzun adlarda \`layout="horizontal"\`, parça–bütün için \`stacked\`) | 6'dan çok parçalı pasta |
| Bir bütünün 2–6 parçası | \`PieChart\` (\`donut\` ile toplam ortada) | Parçaları hassas karşılaştırmak → \`BarChart\` |
| Tek değerin aralıktaki yeri (doluluk, hedef, skor) | \`Gauge\` (eşikler için \`segments\`) | Doğrusal ilerleme → \`Progress\` |

### Tema ve ölçek

- Tasarım kişiliği (\`persona\`) renk, font, köşe, boşluk, gölge ve hareketi birlikte seçer; config'te açıkça yazılan alanlar onu ezer.
- Renkleri, fontları, köşe yuvarlaklığını, varsayılan yoğunluğu ve büyük ekran ölçeğini \`mari-ui.config.json\` belirler; değişince \`npx @mari-ui/cli theme --yes\` ve \`npx @mari-ui/cli sync\`. Kodda tema değeri sabitleme.
- Son kullanıcının görünüm tercihi (mod, vurgu rengi, yoğunluk) için \`ThemeCustomizer\` + \`saveTheme\`/\`loadTheme\`; açılışta yanıp sönmeyi önlemek için \`getThemeScript()\` çıktısını \`<head>\`e satır içi script olarak koy.
- Koyu modu ayrıca kodlama: token sınıfları her iki modda doğru renge döner; \`dark:\` varyantı gerekmez.

### Proje yapısı (framework'ten bağımsız ilkeler)

- Sayfa dosyaları ince kalsın: veri yükleme + kalıbı oluşturan bölüm component'leri.
- Birden fazla sayfada tekrar eden UI, projenin ortak component klasörüne; yalnız bir özelliğe ait olanlar o özelliğin klasörüne.
- Proje component'i mari-ui component'lerini sarmalar ve aynı eksen adlarını (\`size\`, \`color\`, \`variant\`…) kullanır; yeni prop adı uydurma.
`;
