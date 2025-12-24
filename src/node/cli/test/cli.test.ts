import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { Container, Factory } from 'inversify';
import { prodContainer } from '../container';
import { Epub } from '../epub';

let prod: ReturnType<typeof prodContainer>;
let container: Container;
beforeEach(() => {
    prod = prodContainer();
    container = prod.container;
});

afterEach(() => {
    prod.unload();
});

describe('Cli', () => {
    it('it should be created from factory', () => {
        const epub = container.get<Factory<Epub, [string, string]>>('EpubFactory')('', '');
        expect(epub).toBeTruthy();
    });
});
