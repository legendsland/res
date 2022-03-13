import {appendIgnore, delIgnore, fromIgnoreFile} from './ignorefile';
import {listFiles as gitListFiles, remove as gitRemove, add as gitAdd} from 'isomorphic-git';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto')

const dci = '<meta name="dc.identifier" content="res/';

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
        const idx = html.indexOf(dci);
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
    html = 'html',
    pdf = 'pdf',
}

export function add(file: string, output: string) {
    const filePath = path.parse(file);
    const ext = filePath.ext;

    // add dci automatically if it is a html file and dci doesn't exist
    if ( ext === Ext.html ) {
        const html = fs.readFileSync(file);
        const idx = html.indexOf('</head>');

        if (idx !== -1) {
            const dci_idx = html.indexOf(dci);
            // no dci
            if (dci_idx === -1) {

                const sha1sum = crypto.createHash('sha1')
                const hex = sha1sum.update(html).digest('hex');

                console.log('create dci: res/' + hex);

                const pos = idx;

                const html_dci = html.slice(0, pos) + '\n\n' + dci + hex + '">\n\n' + html.slice(pos);

                fs.writeFileSync(output, html_dci);
            } else {
                console.log('dci existed');

                // copy if not the same file
                if (file !== output) {
                    fs.writeFileSync(output, html);
                }
            }

        } else {
            console.log('cannot find body tag');
        }
    } else if ( ext === Ext.pdf ) {
        // do nothing....
    }

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
export function del(file: string) {
    gitListFiles({
        fs: fs,
        dir: '.',
    }).then(files => {
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
        console.log(`${file} removed from git`);
    });
}
