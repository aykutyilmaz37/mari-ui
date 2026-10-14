# @mari-ui/components

mari-ui'ın web component'leri: 70+ component (form, gezinme, veri gösterimi, grafikler, geri bildirim). Her biri ayrı bir alt yoldan (`@mari-ui/components/button`) içe aktarılır, RSC uyumludur ve `skeleton`, erişilebilirlik ve açık/koyu tema taşır.

```bash
pnpm add @mari-ui/components @mari-ui/core @mari-ui/tokens
```

```css
/* Tailwind v4 kullanan proje: */
@import "tailwindcss";
@import "@mari-ui/components/tailwind.css";

/* Tailwind kullanmayan proje (hazır CSS): */
/* @import "@mari-ui/components/styles.css"; */
```

```tsx
import { Button } from "@mari-ui/components/button";

<Button color="primary">Kaydet</Button>;
```

`npx @mari-ui/cli init` projenize uygun CSS girişini söyler, tema dosyalarını ve AI ajan kurallarını kurar.

Kurulum, tema ve component dokümanları: [mari-ui deposu](https://github.com/aykutyilmaz37/mari-ui#readme). Lisans: MIT.
