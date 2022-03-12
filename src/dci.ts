import {fromIgnoreFile} from './ignorefile';

const fs = require('fs');
var crypto = require('crypto')

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

export function addDci(file: string, output: string) {
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

}
