

// remove <pre> source code containing translated.

import * as path from 'path';
import * as fs from 'fs';
import * as jsdom from 'jsdom';

export const chineseReg = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;

export function rm(from: string) {
    const selector = 'pre';

    const fromFile = path.resolve(from);

    const dir = path.dirname(fromFile);
    const outName = path.parse(fromFile).name + '.tmp.html';

    const contentFrom = fs.readFileSync(fromFile).toString();
    const domFrom = new jsdom.JSDOM(contentFrom);
    const $ = require('jquery')(domFrom.window);
    const $pres = $(selector);

    $pres.each( function(index: number, elem: HTMLPreElement)  {
        const hasCh = chineseReg.test($(elem).text());
        if (hasCh) {
            $(elem).remove();
        }
    })

    console.log(path.join(dir, outName));
    fs.writeFileSync(path.join(dir, outName), '<!DOCTYPE html>\n' + $('html').prop('outerHTML').toString());
}


