/** Grafik story'lerinin ortak örnek verisi — yalnız story'lerden import edilir, dist'e girmez. */

export const monthlyRevenue = [
  { month: "Oca", gelir: 182000, gider: 121000, hedef: 170000 },
  { month: "Şub", gelir: 195000, gider: 128000, hedef: 175000 },
  { month: "Mar", gelir: 214000, gider: 133000, hedef: 180000 },
  { month: "Nis", gelir: 201000, gider: 139000, hedef: 185000 },
  { month: "May", gelir: 236000, gider: 142000, hedef: 190000 },
  { month: "Haz", gelir: 258000, gider: 151000, hedef: 195000 },
  { month: "Tem", gelir: 249000, gider: 149000, hedef: 200000 },
  { month: "Ağu", gelir: 271000, gider: 156000, hedef: 205000 },
  { month: "Eyl", gelir: 289000, gider: 162000, hedef: 210000 },
  { month: "Eki", gelir: 312000, gider: 168000, hedef: 215000 },
  { month: "Kas", gelir: 334000, gider: 171000, hedef: 220000 },
  { month: "Ara", gelir: 361000, gider: 179000, hedef: 225000 },
];

export const dailyVisitors = /* @__PURE__ */ Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1} Eyl`,
  ziyaret: Math.round(4200 + Math.sin(i / 3) * 900 + i * 45 + (i % 7 === 5 || i % 7 === 6 ? -1300 : 0)),
}));

export const salesByChannel = [
  { kanal: "Web", "2025": 420, "2026": 515 },
  { kanal: "Mobil uygulama", "2025": 310, "2026": 468 },
  { kanal: "Mağaza", "2025": 280, "2026": 254 },
  { kanal: "Pazaryeri", "2025": 150, "2026": 221 },
];

export const ticketsByStatus = [
  { hafta: "1. hafta", acik: 42, cozuldu: 118, iptal: 9 },
  { hafta: "2. hafta", acik: 38, cozuldu: 131, iptal: 12 },
  { hafta: "3. hafta", acik: 51, cozuldu: 124, iptal: 7 },
  { hafta: "4. hafta", acik: 33, cozuldu: 142, iptal: 10 },
];

export const profitByRegion = [
  { bolge: "Marmara", kar: 184 },
  { bolge: "Ege", kar: 96 },
  { bolge: "İç Anadolu", kar: 61 },
  { bolge: "Akdeniz", kar: 42 },
  { bolge: "Karadeniz", kar: -18 },
  { bolge: "Doğu Anadolu", kar: -31 },
];

export const trafficSources = [
  { name: "Organik arama", value: 4820 },
  { name: "Doğrudan", value: 2310 },
  { name: "Sosyal medya", value: 1640 },
  { name: "E-posta", value: 890 },
  { name: "Reklam", value: 610 },
];

export const deviceShare = [
  { name: "Mobil", value: 62 },
  { name: "Masaüstü", value: 31 },
  { name: "Tablet", value: 7 },
];

export const tryFormatter = (v: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
