/** @type {import('next').NextConfig} */
const nextConfig = {
  // `@mari-ui/*` paketleri workspace symlink'i üzerinden derlenmemiş TS
  // kaynağı olarak DEĞİL, kendi `dist/`lerinden tüketiliyor (her paket
  // kendi `tsup` build'ine sahip) — bu yüzden Next'in transpilePackages'ına
  // ihtiyaç yok, normal `node_modules` çözümlemesi yeterli.
  reactStrictMode: true,
};

export default nextConfig;
