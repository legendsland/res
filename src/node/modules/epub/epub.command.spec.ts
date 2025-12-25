import { describe, beforeEach, it, expect } from '@jest/globals';
import { EpubCommand } from './epub.command.js';
import type { EpubArgs } from './epub.dto.js';

describe('EpubCommand', () => {
    let command: EpubCommand;

    beforeEach(() => {
        command = new EpubCommand();
    });

    it('should be named "epub"', () => {
        expect(command.name).toBe('epub');
    });

    it('should execute with provided arguments', async () => {
        const args: EpubArgs = { file: 'example.epub' };

        await command.execute(args);
    });
});
