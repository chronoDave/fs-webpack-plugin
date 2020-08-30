module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/core-modules': ['tape', 'webpack']
  },
  rules: {
    // General
    'operator-linebreak': ['error', 'after'],
    'linebreak-style': 'off',
    'comma-dangle': 'off',
    'arrow-body-style': 'warn',
    'object-curly-newline': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'no-nested-ternary': 'off',
    'no-console': 'off'
  }
};
