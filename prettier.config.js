/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  jsxSingleQuote: false,
  tabWidth: 2,
  semi: true,
  trailingComma: 'all',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  bracketSameLine: false,
  overrides: [
    {
      files: '*.{json,yml,yaml}',
      options: {
        tabWidth: 2,
      },
    },
  ],
};

module.exports = config;
