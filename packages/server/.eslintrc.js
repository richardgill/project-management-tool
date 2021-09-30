module.exports = {
  extends: ['airbnb-typescript/base', 'prettier', 'prettier/@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-return-await': 'off',
    'import/prefer-default-export': 'off',
    'prefer-arrow-callback': 'error',
    'no-console': 'warn',
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
  },
}
