/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '<rootDir>/out/src/browser/**/*.test.js',
    ],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: [
        '/node_modules/',
    ],

    moduleNameMapper: {
        // A css mock just to make jest work
        '\\.css$': '<rootDir>/src/browser/test/jest-css.js',
    },
    preset: 'ts-jest/presets/js-with-ts',
    transformIgnorePatterns: [
        'node_modules/(?!(vscode-ws-jsonrpc)/).+\\.js$',
    ],
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/out/test/jest-setup.js'],
};

export default config;
