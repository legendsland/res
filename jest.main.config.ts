/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { createDefaultEsmPreset } from 'ts-jest';

const defaultEsmPreset = createDefaultEsmPreset({
    tsconfig: 'tsconfig.json', // You can specify a custom spec config here
});

export default {
    ...defaultEsmPreset,

    // // The glob patterns Jest uses to detect test files
    testMatch: ['<rootDir>/src/node/**/*.test.ts'],

    // // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    // testPathIgnorePatterns: ['/node_modules/',],

    // preset: 'ts-jest/presets/js-with-ts',
    // transformIgnorePatterns: ['node_modules/(?!(vscode-ws-jsonrpc)/).+\\.js$'],
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
};
