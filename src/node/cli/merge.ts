/**
 * Merge two htmls of same dom structure one of which is google-translated into a single one.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as jsdom from 'jsdom';

export function merge(from: string, to: string) {

    // shoe not be nested
    const selector = 'h1,h2,h3,h4,p';

    const fromFile = path.resolve(from);
    const toFile = path.resolve(to);
    const dir = path.dirname(toFile);

    const outName = path.parse(toFile).name + '.2.html';

    const contentFrom = fs.readFileSync(fromFile).toString();
    const contentTo = fs.readFileSync(toFile).toString();

    const domFrom = new jsdom.JSDOM(contentFrom);
    const $from = require('jquery')(domFrom.window);
    const fromElems = $from(selector);

    const domTo = new jsdom.JSDOM(contentTo);
    const $to = require('jquery')(domTo.window);
    const toElems = $to(selector);

    for(let i=0; i<fromElems.length; ++i) {
        const $f = $from(fromElems[i]);

        // remove id
        $f.removeAttr('id');
        $f.find('[id]').removeAttr('id');

        // remove images
        $f.find('img').remove();

        if (! $f.is(':empty')) {
            // get children html
            const newHtml = $f.html();
            const tag = $f.prop('tagName').toLowerCase();
            $to(toElems[i]).after(`<${tag}>${newHtml}</${tag}>`);
        }
    }

    fs.writeFileSync(path.join(dir, outName), $to('html').prop('outerHTML').toString());
}
