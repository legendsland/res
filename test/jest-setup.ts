/********************************************************************************
 * Copyright (C) 2023 Harman
 ********************************************************************************/

import 'reflect-metadata';
import '@testing-library/dom';
import failOnConsole from 'jest-fail-on-console';
import process from 'process';

failOnConsole({
    shouldFailOnWarn: true,
});

process.on('unhandledRejection', (reason, p) => {
    console.log(`Unhandled Rejection at, reason: ${JSON.stringify(reason || {})}, ${p}`);
});
