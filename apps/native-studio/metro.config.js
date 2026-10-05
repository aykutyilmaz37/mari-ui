// Monorepo Metro ayarı. Expo SDK 52+ workspace kökünü kendisi bulur (izlenen
// klasörler, node_modules arama yolları); burada yalnız TEK KOPYA kuralı var:
// React ve React Native her zaman bu uygulamanın sürümünden çözülür.
//
// Neden: kökte başka paketlerin getirdiği farklı bir `react` sürümü (ör.
// 19.2.8) hoisted duruyor; Expo SDK'nın beklediği sürüm (19.2.3) bu
// uygulamanın node_modules'unda. `@mari-ui/native`in derlenmiş kodu `react`ı
// kendi konumundan ararsa kökteki kopyayı bulur → iki React → "Invalid hook
// call". Çözüm: bu modüller hangi dosyadan istenirse istensin, aramayı bu
// uygulamanın içinden başlat.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const SINGLETONS = ["react", "react-dom", "react-native", "react-native-web"];
const appEntry = path.join(__dirname, "index.ts");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETONS.some((name) => moduleName === name || moduleName.startsWith(`${name}/`));
  if (isSingleton) {
    return context.resolveRequest({ ...context, originModulePath: appEntry }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
