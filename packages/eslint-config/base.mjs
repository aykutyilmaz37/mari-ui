// @mari-ui/eslint-config — paylaşılan taban kural seti.
// Her paket kendi eslint.config.mjs'inde bunu genişletir.
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

/**
 * Faz 8 (backlog madde 13 — "SonarQube kurallarına uyum"): gerçek bir
 * SonarQube/SonarCloud sunucusu bağlamak bir hesap/token gerektiriyor ve bu
 * ortamda kurulamıyor. Bunun yerine `eslint-plugin-sonarjs` — SonarSource'un
 * kendi "Sonar way" JS/TS kural setinin ESLint karşılığı, sunucu gerektirmez
 * — aynı bug sınıflarını (kopya kod, aşırı bilişsel karmaşıklık, ölü kod,
 * her zaman aynı sonucu veren koşullar, vb.) derleme zamanında yakalar.
 * Gerçek bir SonarQube bağlanırsa bu katman YERİNE değil, YANINA (aynı
 * kural felsefesiyle) eklenir.
 */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "build/**", ".turbo/**", "storybook-static/**", "node_modules/**"],
  },
  {
    // Tip bilgisi: sonarjs'in "Sonar way" setindeki 56 kural (prefer-read-only-props,
    // deprecation, different-types-comparison…) tip ister; bu olmadan SESSİZCE
    // çalışmıyordu — CLI lint temizken VS Code'daki SonarQube eklentisi uyarı
    // gösteriyordu. Kök *.config.ts dosyaları her paketin tsconfig `include`'unda.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // "Sonar way" varsayılanı çok düşük bir eşikle (3) neredeyse her
      // component fonksiyonunu işaretliyordu — bu proje çok sayıda prop
      // dallanması olan sunum bileşenleri barındırıyor (bkz. Faz 3);
      // 15 daha gerçekçi, gerçek karmaşık kod parçalarını yine de yakalar.
      "sonarjs/cognitive-complexity": ["warn", 15],
      // Kapalı (S3800): `React.ReactNode` döndüren yardımcılar (null | öğe |
      // metin) bildirilen dönüş tipine rağmen işaretleniyordu; tek tipe
      // zorlamak gereksiz fragment sarmalı demek. VS Code eklentisinde de
      // kapalı — bkz. kökteki .vscode/settings.json (`sonarlint.rules`).
      "sonarjs/function-return-type": "off",
    },
  },
];

export default baseConfig;
