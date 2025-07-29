// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Tout ce qui suit devient des warnings au lieu d’erreurs bloquantes
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-irregular-whitespace': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // Désactive si besoin d’autres règles trop verbeuses :
    // 'react/prop-types': 'off',
    // 'react/display-name': 'off',
  },
};
