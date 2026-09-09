import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

// Storybook manager (sol panel / kabuk) konfigürasyonu. Kanvas temasından
// bağımsız — daima açık. Faz 13: marka adı "mari-ui".
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "mari-ui",
    brandUrl: "/",
  }),
  sidebar: {
    showRoots: true,
  },
});
