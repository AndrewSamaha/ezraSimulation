import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Rules for enforcing consistent code style
const styleRules = {
  //indent: ["error", 2], // use prettier for indentation b/c eslint and prettier indentation rules are incompatible
  'linebreak-style': ['error', 'unix'],
  quotes: ['error', 'single', { avoidEscape: true }],
  semi: ['error', 'always'],
  'comma-dangle': ['error', 'always-multiline'],
  'arrow-parens': ['error', 'always'],
  // 'max-len': ['warn', { code: 100 }],
};

// Define ESLint configuration
const eslintConfig = [
  // Base configurations from Next.js
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Add custom rules for all JavaScript and TypeScript files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: styleRules,
  },

  // Additional TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
