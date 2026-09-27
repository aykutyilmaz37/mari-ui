import { addons } from "@storybook/manager-api";
import "@mari-ui/tokens/fonts.css";
import { createMariTheme } from "./theme";

// Kabuk açık iris; kanvas ve doküman teması araç çubuğundan değiştirilebilir.
addons.setConfig({
  theme: createMariTheme("light"),
  sidebar: { showRoots: true },
});
