const _ = require('lodash')

const isCI = _.toLower(process.env.CI) === 'true'

module.exports = {
  extends: ['airbnb-typescript', 'airbnb/hooks', 'prettier', 'prettier/@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'no-return-await': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/camelcase': 'off',
    'react/destructuring-assignment': 'off',
    'prefer-destructuring': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'consistent-return': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'no-debugger': isCI ? 'error' : 'warn',
    '@typescript-eslint/no-unused-vars': isCI ? 'error' : 'warn',
    'import/order': isCI ? 'error' : 'warn',
    'prefer-arrow-callback': 'error',
    'react/jsx-curly-brace-presence': 'off',
    'func-style': ['error', 'expression', { allowArrowFunctions: true }]
  }
}
