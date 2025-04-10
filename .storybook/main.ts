import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/experimental-nextjs-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  "viteFinal": async (config) => {
    // Add path alias for @ to point to src directory
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    
    // Use the Storybook-specific PostCSS config
    if (!config.css) config.css = {};
    
    config.css = {
      ...config.css,
      postcss: path.resolve(__dirname, './postcss.config.js'),
    };
    
    return config;
  }
};
export default config;