/**
 * Merge two htmls of same dom structure one of which is google-translated into a single one.
 */
/// <reference types="node" />

import * as path from 'path';
import * as fs from 'fs';
import * as jsdom from 'jsdom';

function getPath($: any, elem: HTMLElement) {

    let path = '';
    while (elem !== null)
    {
        if (elem.tagName.toLowerCase() === 'body') {
            path = 'body' + path;
            break;
        }

        let id = $(elem.parentNode).children(elem.tagName).index(elem);
        let nth = ':eq(' + id + ')';
        path = ' > ' + elem.tagName.toLowerCase() + nth + path;

        elem = elem.parentElement;
    }
    if (path.startsWith('body')) {
        return path;
    } else {
        return undefined;
    }
}

export function merge(from: string, to: string) {

    // shoe not be nested
    const selector = 'h1,h2,h3,h4,p,li,dt,dd,pre';  //pre

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

    const paths: string[] = [];

    for(let i=0; i<fromElems.length; ++i) {
        const $f = $from(fromElems[i]);

        const p = getPath($from, $f[0]);
        // console.log(p);
        const parents = paths.filter(p_ => p.includes(p_));
        // find p has parent in paths
        if (parents.length === 0) {
            paths.push(p);

            // remove id
            $f.removeAttr('id');

            // remove id from children
            $f.find('[id]').removeAttr('id');

            // remove images (duplicated)
            $f.find('img').remove();

            if (!$f.is(':empty')) {
                // get children html
                const newHtml = $f.html();
                const tag = $f.prop('tagName').toLowerCase();

                // get attributes
                let attrs = '';
                $from.each($f[0].attributes, function () {
                    if(this.specified) {
                        attrs += `${this.name}=\"${this.value}\" `;
                    }
                });

                $to(toElems[i]).after(`<${tag} ${attrs}>${newHtml}</${tag}>`);
            }
        } else {
            console.log(p);
            console.log(parents);
        }
    }

    fs.writeFileSync(path.join(dir, outName), '<!DOCTYPE html>\n' + $to('html').prop('outerHTML').toString());
}
