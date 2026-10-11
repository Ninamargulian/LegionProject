import playwright from 'eslint-plugin-playwright';
import tsParser from '@typescript-eslint/parser';

const playwrightRecommended = playwright.configs['flat/recommended'];

export default [
  {
    ...playwrightRecommended,
    files: ['tests/**/*.spec.ts'],
    languageOptions: {
      ...playwrightRecommended.languageOptions,
      parser: tsParser,
    },
  },
  {
    ...playwrightRecommended,
    files: ['tests/**/*.spec.js'],
  },
];
