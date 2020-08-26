module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/core-modules': ['tape']
  },
  rules: {
    // General
    'operator-linebreak': ['error', 'after'],
    'linebreak-style': 'off',
    'comma-dangle': 'off',
    'arrow-body-style': 'warn',
    'arrow-parens': ['error', 'as-needed'],
    'no-nested-ternary': 'off',
    'no-console': 'off'
  }
};
