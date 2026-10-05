// Monorepo Metro ayarı. Expo SDK 52+ workspace kökünü kendisi bulur (izlenen
// klasörler, node_modules arama yolları); burada iki kural var. Yollar paket
// adıyla çözülür (`require.resolve`) — göreli `../../` yok.
//
// 1) TEK KOPYA: React, React Native ve react-native-svg her zaman bu
//    uygulamanın sürümünden çözülür. Kökte başka paketlerin getirdiği farklı
//    bir `react` (ör. 19.2.8) hoisted duruyor; Expo SDK'nın beklediği sürüm
//    (19.2.3) bu uygulamanın node_modules'unda. Paket kodu `react`ı kendi
//    konumundan ararsa kökteki kopyayı bulur → iki React → "Invalid hook call".
// 2) KAYNAKTAN: `@mari-ui/native` derlenmiş dist yerine kaynaktan (src) çözülür
//    — story'ler component'leri kaynaktan import ediyor; uygulama da kaynaktan
//    almazsa iki ayrı ThemeContext olur. Ayrıca build gerekmez.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const SINGLETONS = ["react", "react-dom", "react-native", "react-native-web", "react-native-svg"];
const appEntry = path.join(__dirname, "index.ts");
const nativeRoot = path.dirname(require.resolve("@mari-ui/native/package.json"));
const SOURCE_ALIASES = {
  "@mari-ui/native": path.join(nativeRoot, "src/index.ts"),
  "@mari-ui/native/stories": path.join(nativeRoot, "src/stories/registry.ts"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const source = SOURCE_ALIASES[moduleName];
  if (source) return { type: "sourceFile", filePath: source };
  const isSingleton = SINGLETONS.some((name) => moduleName === name || moduleName.startsWith(`${name}/`));
  if (isSingleton) {
    return context.resolveRequest({ ...context, originModulePath: appEntry }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
