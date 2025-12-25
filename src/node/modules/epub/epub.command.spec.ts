import fs from 'node:fs';
// import { fileURLToPath } from 'node:url';
import { describe, beforeEach, it, expect } from '@jest/globals';
import { EpubCommand } from './epub.command.js';

// const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/', import.meta.url));
// TODO: hard-coded
const FIXTURE_PATH = '/home/zy/ws/res/src/node/modules/epub/fixtures';
const FONT_PATH = '/home/zy/ws/res/dist/assets/fonts';

describe('EpubCommand', () => {
    let command: EpubCommand;

    beforeEach(() => {
        command = new EpubCommand();
    });

    it('should be named "epub"', () => {
        expect(command.name).toBe('epub');
    });

    it('should convert epub', async () => {
        const epub = `${FIXTURE_PATH}/basic-v3plus2.epub`;
        const html = `${FIXTURE_PATH}/basic-v3plus2.html`;
        fs.rmSync(html, { force: true });

        const font = `${FONT_PATH}/redacted-script-regular.ttf`;
        fs.rmSync(font, { force: true });

        await command.execute({ convert: epub });

        // check html generated
        expect(fs.existsSync(html)).toBe(true);

        // check fonts copied to dist/assets/fonts/
        expect(fs.existsSync(font)).toBe(true);
    });
});
