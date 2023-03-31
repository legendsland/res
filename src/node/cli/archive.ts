/**
 * Merge multiple htmls into a single one, using iframe.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as jsdom from 'jsdom';

//TODO: you cannot apply js on iframes ....
// problem is styles from different htmls would conflict.
// cannot use global res.js

const STYLE_ELEM_ID = 'res-style';
const SCRIPT_ELEM_ID = 'res-script';

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<link id="res-style" rel="stylesheet" href="/res/dist/res/style.css" type="text/css">
</head>
<body>
<div id="book-container"></div>
<script id="res-script" src="/res/dist/res/main.js" type="text/javascript"></script>
</body>
</html>
`

const indexTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<link id="res-style" rel="stylesheet" href="/res/dist/res/style.css" type="text/css">
</head>
<body>
<div id="res-wa-index">
<ul>
</ul>
</div>
</body>
</html>
`

const WS_ROOT = '/home/zy/ws';

export class Archive {

    private root: string;
    private $index;
    private indexFile: string;

    constructor(
        private inputFile?: string,
    ) {

        if (inputFile === undefined) {
            this.root = path.join(WS_ROOT, 'res/res/wa');
        } else {
            if (!fs.existsSync(inputFile)) {
                console.log(`no file ${inputFile}`);
                return;
            } else {
                const stat = fs.lstatSync(inputFile);
                if (stat.isDirectory()) {
                    this.root = inputFile;
                    this.inputFile = undefined;
                } else if (stat.isFile() && inputFile.endsWith('.html')) {
                    const prefix = path.join(WS_ROOT, 'res/res/');
                    const d = path.parse(inputFile).dir;
                    this.root = path.join(WS_ROOT, 'res/res/', d.substring(prefix.length));
                }
                else {
                    console.log(`unsupported: ${inputFile}`);
                    return;
                }
            }
        }

        console.log(`root: ${this.root}`);
        this.indexFile = path.join(this.root, 'index.html');

        // if (!fs.existsSync(this.indexFile)) {
            fs.writeFileSync(this.indexFile, indexTemplate, {encoding: 'utf8'});
        // }

        const content = fs.readFileSync(this.indexFile, {encoding: 'utf8'});
        const index = new jsdom.JSDOM(content);
        this.$index = require('jquery')(index.window);

        this.updateDir();
    }

    private updateDir() {
        if (this.inputFile) {
            this.update(this.inputFile);
        }

        // check if need to update index.html
        const urls = new Map<string, string>();
        this.generateIndex(this.root, urls);

        Array.from(urls).sort(([url1, name1], [url2, name2]) =>
         name1.localeCompare(name2, undefined, {sensitivity: 'accent'})).map(([url, name]) => {
            this.$index('#res-wa-index ul').append(`
<li><a href="${url}" target="_blank">${name}</a></li>
`)
        })

        // update index.html
        fs.writeFileSync(this.indexFile, this.$index('html')[0].outerHTML, {encoding: 'utf8'});
    }

    private generateIndex(root: string, urls: Map<string, string>) {
        const files = fs.readdirSync(root);
        files.forEach(file => {
            const fullpath = path.resolve(root, file);
            // console.log(fullpath);
            if ( fs.lstatSync(fullpath).isDirectory() ) {
                this.generateIndex(fullpath, urls);
            } else if (fullpath.endsWith('.html') && !fullpath.endsWith('index.html')) {
                const rel = fullpath.substring(WS_ROOT.length);
                urls.set(rel, fullpath.substring(this.root.length + 1)); //TODO:
            }
        });
    }

    private update(inputFile: string) {
        console.log(`update: ${inputFile}`);
        const content = fs.readFileSync(inputFile, {encoding: 'utf8'});
        const target = new jsdom.JSDOM(content);
        const $ = require('jquery')(target.window);

        // check
        if ($('#book-container').length === 0) {
            const out = new jsdom.JSDOM(template);
            const $out = require('jquery')(out.window);
            $out('html').prepend($('head'));
            $out('#book-container').append($('body').html());

            fs.writeFileSync(inputFile, '<!DOCTYPE html>\n' + $out('html')[0].outerHTML, {encoding: 'utf8'});
        } else {
            console.log(inputFile + ': already updated');
        }
    }
}

