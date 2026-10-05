// Koruma: repo kökü bir Expo uygulaması DEĞİL. `expo start` / `pnpm expo …`
// kökte çalıştırılırsa Expo varsayılan girişe (node_modules/expo/AppEntry.js)
// düşüp anlaşılmaz bir "Unable to resolve ../../App" hatası veriyordu.
// Expo uygulaması apps/native-studio'da — doğru komutu söyleyip dur.
throw new Error(
  [
    "",
    "Repo kökü bir Expo uygulaması değil. native-studio'yu kökten şu komutlarla başlatın:",
    "",
    "  pnpm native        # telefon (Expo Go, QR kod)",
    "  pnpm native:web    # tarayıcı",
    "",
    "ya da: cd apps/native-studio && pnpm expo start",
    "",
  ].join("\n")
);
