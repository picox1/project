module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',      // passe les unused vars en warning
    '@typescript-eslint/no-explicit-any': 'warn',     // passe les any en warning
    'no-irregular-whitespace': 'off',                 // désactive
    'no-case-declarations': 'off',                    // autorise déclarations dans case
    'react-hooks/exhaustive-deps': 'warn',            // useEffect deps en warning
  },
};
