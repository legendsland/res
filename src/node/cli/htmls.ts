/**
 * Merge multiple htmls into a single one, using iframe.
 */

import * as path from 'path';
import cheerio from 'cheerio';
import * as fs from 'fs';
import {existsSync, lstatSync, readFileSync, writeFileSync} from 'fs';
import * as extract from 'extract-zip';
import * as $ from 'jquery';

//TODO: you cannot apply js on iframes ....


export class Htmls {

    readonly html_start = `<!DOCTYPE html>
<html><head><meta charset=utf-8></head><body><div id="book-container" style="max-width: 100% !important;">
`;

    readonly html_end = `</div></body></html>
`;

    private files = new Map<string, string>();

    private root: string;

    constructor(
        private inputFile: string,
        private outputFile: string,
    ) {
        this.root = inputFile;
    }

    async convert() {

        let html = this.html_start;

        // get all html files
        const files = fs.readdirSync(this.inputFile);

        files.forEach(file => {
            const fullpath = path.resolve(this.root, file);

            const content = fs.readFileSync(fullpath, {encoding: 'utf8'});
            this.files.set(fullpath, content);

            const escaped = content.replace(/"/g, '&quot;');

            const filename = path.basename(file, '.html');

            html += `<div id="${file}">
<h1>${filename}</h1>
<iframe class="res-iframe"
srcdoc="${escaped}"
></iframe>
</div>\n
`;

        });

        html += this.html_end;

        writeFileSync(this.outputFile, html, {encoding: 'utf8'});
    }
}

