import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../docs/**/*.mdx'],
  refs: {
    svelte: {
      title: 'Joymify Svelte 5 (Quant & JoyCoach)',
      url: 'http://localhost:6006',
      expanded: true
    },
    react: {
      title: 'Joymify React 19 (AssetStudio & Portal)',
      url: 'http://localhost:6007',
      expanded: true
    }
  }
};

export default config;
