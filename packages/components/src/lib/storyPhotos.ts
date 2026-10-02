/**
 * YALNIZ STORY'LER İÇİN — Image/ImageGallery örnek fotoğrafları. Paket
 * girişlerinden import edilmez.
 *
 * Kaynaklar picsum.photos `seed` adresleri (aynı seed hep aynı fotoğraf).
 * Yol `/seed/<ad>/<genişlik>/<yükseklik>` biçiminde bir "CDN yolu" gibi
 * tutulur; `picsumLoader` istenen genişliğe göre yeniden boyutlandırır —
 * gerçek bir CDN `loader`ının yaptığı iş.
 */
import type { ImageLoader } from "../image/types";

export const picsumLoader: ImageLoader = ({ src, width }) => {
  const [, , seed = "mari", w = "4", h = "3"] = src.split("/");
  const height = Math.round((width * Number(h)) / Number(w));
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const RATIOS: [number, number][] = [
  [1600, 1067],
  [1200, 1600],
  [1600, 1200],
  [1400, 1400],
  [1600, 900],
  [1080, 1350],
];

const PLACES = [
  "Kapadokya",
  "Kaş",
  "Uzungöl",
  "Pamukkale",
  "Efes",
  "Ayder",
  "Bozcaada",
  "Safranbolu",
  "Mardin",
  "Nemrut",
  "Abant",
  "Datça",
  "Kekova",
  "Sümela",
  "Assos",
  "Ölüdeniz",
  "Şirince",
  "Amasra",
  "Hasankeyf",
  "Akdamar",
];

export interface StoryPhoto {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Çekim zamanı — galeri tarihe göre gruplar. */
  takenAt: Date;
}

/**
 * `count` fotoğraf; en yeniden eskiye, günde 0–3 çekim, ara ara boş günler
 * (gerçek bir galeri gibi). Deterministik.
 */
export function storyPhotos(count: number, start = new Date(2026, 9, 2, 18, 30)): StoryPhoto[] {
  const photos: StoryPhoto[] = [];
  const day = new Date(start);
  let i = 0;
  while (photos.length < count) {
    const perDay = (i * 7) % 4; // 0,3,2,1,0,3…
    for (let k = 0; k < perDay && photos.length < count; k++) {
      const n = photos.length;
      const [width, height] = RATIOS[n % RATIOS.length]!;
      const place = PLACES[n % PLACES.length]!;
      const takenAt = new Date(day);
      takenAt.setHours(9 + ((n * 5) % 11), (n * 13) % 60);
      photos.push({ key: `p${n}`, src: `/seed/mari-${n}/${width}/${height}`, alt: `${place} — ${n + 1}. fotoğraf`, width, height, takenAt });
    }
    day.setDate(day.getDate() - 1 - (i % 5 === 4 ? 6 : 0));
    i++;
  }
  return photos;
}

/** CC0 örnek video (MDN). */
export const STORY_VIDEO = {
  src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  poster: "https://picsum.photos/seed/mari-flower/640/360",
};
