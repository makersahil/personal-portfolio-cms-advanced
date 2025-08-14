// .eslint.config.mjs
import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

export default [
  // ignore heavy folders
  { ignores: ['node_modules/', 'dist/', 'coverage/', '.husky/'] },

  // base recommended
  js.configs.recommended,

  // project rules
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module'
    },
    plugins: {
      import: pluginImport
    },
    rules: {
      // general hygiene
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',

      // import quality
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }],
      'import/newline-after-import': 'warn'
    }
  }
];
