// frontend/.eslintrc.js
module.exports = {
    root: true,
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: false,             // so you don’t need a separate Babel config
      babelOptions: {
        presets: [
          '@babel/preset-react',
          '@babel/preset-typescript'
        ]
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    env: {
      browser: true,
      node: true,
      es6: true
    },
    ignorePatterns: ['node_modules/*', 'build/*'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:prettier/recommended'
    ],
    plugins: [
      'react',
      'prettier',
      'unused-imports'
    ],
    rules: {
      // enforce Prettier formatting
      'prettier/prettier': 'error',
  
      // React
      'react/prop-types': 'off',            // we’re using TS for type-checking
  
      // unused-imports plugin
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  };
  