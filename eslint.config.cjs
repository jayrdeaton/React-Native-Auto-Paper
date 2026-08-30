const { defineConfig } = require('eslint/config')
const base = require('@infinitetoken/eslint-config/react-native')

module.exports = defineConfig([
  ...base,
  {
    // src/__mocks__ stays ignored: this repo's tsconfig.json excludes src/__mocks__ from its
    // program, so type-aware linting would hard-fail parsing those files (not just a cosmetic
    // no-explicit-any warning). src/__tests__ is NOT excluded from tsconfig, so it's fully
    // covered by the base config's own __tests__/__mocks__ no-explicit-any-off override now.
    ignores: ['src/__mocks__/**']
  }
])
