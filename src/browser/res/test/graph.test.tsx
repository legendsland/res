import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';

import { KnowledgeGraphViewContainer } from '../graph';
import { prodContainer } from '../../container';
import { Container } from 'inversify';

let prod: ReturnType<typeof prodContainer>;
let container: Container;
beforeEach(() => {
    prod = prodContainer();
    container = prod.container;
});

afterEach(() => {
    prod.unload();
});

describe('Graph', () => {
    it('it should be created from container', () => {
        const kg = container.get(KnowledgeGraphViewContainer);
        expect(kg).toBeTruthy();
    });
});
