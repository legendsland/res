import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import airbnb from 'eslint-config-airbnb';
import { fixupConfigRules } from '@eslint/compat';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        ignores: ['out/**', 'dist/**', 'build/**', 'node_modules/**', '*.js'],
    },
    {
        files: ['**/*.{mjs,js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.jest,
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
            import: importPlugin,
            '@typescript-eslint': tseslint.plugin,
            prettier: prettier,
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                    printWidth: 120,
                    semi: true,
                    singleQuote: true,
                    trailingComma: 'all',
                },
            ],
            'prefer-promise-reject-errors': [
                'error',
                {
                    allowEmptyReject: false,
                },
            ],
            'react/jsx-indent-props': ['error', 4],
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            '@typescript-eslint/class-name-casing': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/member-delimiter-style': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/ban-ts-ignore': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                },
            ],
            'no-restricted-syntax': 'off',
            'no-use-before-define': 'off',
            'no-plusplus': 'off',
            'no-bitwise': 'off',
            'import/extensions': 'off',
            'import/prefer-default-export': 'off',
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        'test.{ts,tsx}',
                        'test-*.{ts,tsx}',
                        '**/*{.,_}{test,spec}.{ts,tsx}',
                        '**/jest.config.ts',
                        '**/jest.setup.ts',
                        'eslint.config.mjs',
                    ],
                    optionalDependencies: false,
                },
            ],
            'max-classes-per-file': 'off',
            'no-param-reassign': 'off',
            'no-underscore-dangle': 'off',
            'react/jsx-filename-extension': [
                1,
                {
                    extensions: ['.tsx'],
                },
            ],
            'import/no-unresolved': 'off',
            'consistent-return': 'off',
            'jsx-a11y/anchor-is-valid': 'off',
            'sx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-noninteractive-element-interactions': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            'react/jsx-props-no-spreading': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-one-expression-per-line': 'off',
            'react/function-component-definition': [
                2,
                {
                    namedComponents: ['function-declaration', 'function-expression', 'arrow-function'],
                    unnamedComponents: 'arrow-function',
                },
            ],
            'no-prototype-builtins': 'off',
            'no-nested-ternary': 'off',
            'spaced-comment': [
                'error',
                'always',
                {
                    line: {
                        markers: ['/'],
                        exceptions: ['-', '+'],
                    },
                    block: {
                        markers: ['!'],
                        exceptions: ['*'],
                        balanced: true,
                    },
                },
            ],
            '@typescript-eslint/no-require-imports': 'warn',
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
            react: {
                version: 'detect',
            },
        },
    },
    eslintConfigPrettier,
);
