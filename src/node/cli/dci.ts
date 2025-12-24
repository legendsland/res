import {appendIgnore, delIgnore, fromIgnoreFile} from './ignorefile';
import {listFiles as gitListFiles, remove as gitRemove, add as gitAdd} from 'isomorphic-git';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as cheerio from 'cheerio';

const DCI = '<meta name="dc.identifier" content="res/';
const SCRIPT_ELEM_ID = 'res-script';
const STYLE_ELEM_ID = 'res-style';

export function checkDci(files: string[]) {
    let htmlFiles = files;

    // if no files are specified, check files in .gitignore
    if (files.length === 0) {
        htmlFiles = fromIgnoreFile()
            .filter(path => path.base.endsWith('html'))
            .map(path => path.dir + '/' + path.base);
    }

    htmlFiles.forEach(filename => {
        const html = fs.readFileSync(filename);
        const idx = html.indexOf(DCI);
        if (idx === -1) {
            console.log(`!! ${filename}`);
        } else {
            console.log(`** ${filename}`);
        }
    });
}

export async function checkFiles() {
    const added = fromIgnoreFile().map(path => path.dir + '/' + path.base).sort();
    const files = await gitListFiles({
        fs: fs,
        dir: '.',
    });

    const ignoreDirs = [
        'res/images'
    ];

    const fromIgnore = JSON.stringify(added);
    const fromGit = JSON.stringify(
        files.filter((file) =>
            file.startsWith('res/')
            && ignoreDirs.filter((dir) => file.startsWith(dir)).length === 0
        ).sort());
    if (fromIgnore !== fromGit) {
        console.log('!! not consistent');
        console.log('ignore: ' + fromIgnore);
        console.log('   git: ' + fromGit);
    } else {
        console.log('** consistent:\n' + added.join('\n'));
    }
}

const enum Ext {
    html = '.html',
    pdf = '.pdf',
}

export async function decorate(file: string, embedded: boolean, output: string) {
    const filePath = path.parse(file);
    const ext = filePath.ext;

    // add dci automatically if it is a html file and dci doesn't exist
    if ( ext === Ext.html ) {
        const html = fs.readFileSync(file);

        const $ = cheerio.load(html);

        const $dci = $('meta[name="dc.identifier"]');
        if ($dci.length === 0) {
            const sha1sum = crypto.createHash('sha1')
            const hex = sha1sum.update(html).digest('hex');
            console.log('create dci: res/' + hex);
            $('head').prepend(`\n<meta name="dc.identifier" content="res/${hex}">\n`);
        } else {
            console.log(`dci existed, always keep this ID: ${$dci.attr('content')} because hypothes.is may use it.`);
        }

        // add ore replace inlined css and javascript
        const $style = $(`#${STYLE_ELEM_ID}`);
        if ( $style.length !== 0 ) {
            $style.remove();
        }
//<meta name="dc.identifier" content="res/6287b00253a4b52566edbef59f7ba7c1050ed0a7">
        const $script = $(`#${SCRIPT_ELEM_ID}`);
        if ( $script.length !== 0 ) {
            $script.remove();
        }

        if (embedded) {
            const styleContent = fs.readFileSync('dist/res/style.css').toString();
            $('head').append(`<style id="${STYLE_ELEM_ID}">${styleContent}</style>\n`);

            const scriptContent = fs.readFileSync('dist/res/main.js').toString();
            $('body').append(`<script id="${SCRIPT_ELEM_ID}" type="text/javascript">${scriptContent}</script>\n`);
        } else {
            // link, easy for updating
            $('head').append(`<link id="${STYLE_ELEM_ID}" rel="stylesheet" href="/res/dist/res/style.css" type="text/css"/>\n`);

            $('body').append(`<script id="${SCRIPT_ELEM_ID}" src="/res/dist/res/main.js" type="text/javascript"></script>\n`);

        }

        // copy if not the same file
        fs.writeFileSync(output, $.html());

    } else if ( ext === Ext.pdf ) {
        // do nothing....
    }
}

export async function add(file: string) {
    const filePath = path.parse(file);

    // add to .gitignore
    appendIgnore(filePath);

    // add to git
    gitAdd({
        fs: fs,
        dir: '.',
        filepath: file
    }).then(() => {
        console.log(`${file} added to git`);
    });
}

/**
 * Remove a file from git and index, but don't delete the file from fs.
 *
 * @param file file to be removed.
 */
export async function del(file: string) {
    const files = await gitListFiles({
        fs: fs,
        dir: '.',
    });

    const list = files.filter(f => f === file);
    if (list.length === 1) {
        // remove from git
        gitRemove({
            fs: fs,
            dir: '.',
            filepath: list[0]
        }).then(() => {
            console.log(`${file} removed from git`);
        });
    } else {
        console.log(`cannot find ${file}`);
    }

    // remove from .gitignore
    delIgnore(path.parse(file));
}
