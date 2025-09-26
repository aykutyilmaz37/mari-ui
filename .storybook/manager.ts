import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Storybook manager konfigürasyonu
addons.setConfig({
  theme: themes.light,
  sidebar: {
    showRoots: true,
  },
});
