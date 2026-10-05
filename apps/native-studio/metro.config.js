// Monorepo Metro ayarı. Expo SDK 52+ workspace kökünü kendisi bulur (izlenen
// klasörler, node_modules arama yolları); burada iki kural var:
//
// 1) TEK KOPYA: React ve React Native her zaman bu uygulamanın sürümünden
//    çözülür. Kökte başka paketlerin getirdiği farklı bir `react` (ör. 19.2.8)
//    hoisted duruyor; Expo SDK'nın beklediği sürüm (19.2.3) bu uygulamanın
//    node_modules'unda. Paket kodu `react`ı kendi konumundan ararsa kökteki
//    kopyayı bulur → iki React → "Invalid hook call".
// 2) KAYNAKTAN: `@mari-ui/native` derlenmiş dist yerine kaynaktan (src) çözülür.
//    Studio, story dosyalarını (packages/native/src/**/*.stories.tsx) doğrudan
//    okuyor; story'ler component'leri kaynaktan import ediyor — uygulama da
//    kaynaktan almazsa iki ayrı ThemeContext olur. Ayrıca build gerekmez.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const SINGLETONS = ["react", "react-dom", "react-native", "react-native-web", "react-native-svg"];
const appEntry = path.join(__dirname, "index.ts");
const nativeSource = path.resolve(__dirname, "../../packages/native/src/index.ts");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@mari-ui/native") {
    return { type: "sourceFile", filePath: nativeSource };
  }
  const isSingleton = SINGLETONS.some((name) => moduleName === name || moduleName.startsWith(`${name}/`));
  if (isSingleton) {
    return context.resolveRequest({ ...context, originModulePath: appEntry }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
