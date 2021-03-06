/**
 * Load, parse epub file and convert it to html.
 */

import * as path from 'path';
import cheerio from 'cheerio';
import * as fs from 'fs';
import {existsSync, lstatSync, readFileSync, writeFileSync} from 'fs';
import * as extract from 'extract-zip';
import * as $ from 'jquery';
import {Htmls} from './htmls';

const PATH_CONTAINER = 'META-INF/container.xml';
const TAG_ROOTFILE = 'rootfile';
const TAG_DC_TITLE_ESC = 'dc\\:title';
const TAG_DC_IDENTIFIER_ESC = 'dc\\:identifier';

const enum MediaType {
    xhtml_xml = "application/xhtml+xml",
    html = "text/html",
}

interface htmlHead {
    title: string
}

export class Epub {

    private $container: cheerio.Root;
    private $rootfile: cheerio.Root;
    private inputFile: string;
    private outputFile: string
    private output: string;
    private root: string;
    private extractDir: string;
    private isEpub: boolean;

    constructor(input: string, output: string) {
        this.isEpub = false;
        this.inputFile = path.resolve(input);
        this.output = output;
    }

    async convert() {

        const isDir = lstatSync(this.inputFile).isDirectory();
        if (isDir) {

            // const outputFile = this.output?
            //     this.output : this.inputFile + '.html';
            //
            // const htmls = new Htmls(this.inputFile, outputFile);
            // return htmls.convert();

            this.root = this.inputFile;
            this.outputFile = this.output? this.output : this.inputFile + '.html';

        } else if (this.inputFile.endsWith('.epub')) {
            //unzip to tmp
            this.extractDir = '/tmp/res-epub';
            await extract(this.inputFile, {dir: this.extractDir});
            this.root = this.extractDir;
            this.outputFile = this.output? this.output : this.inputFile.substring(0, this.inputFile.length-5) + '.html';
            this.isEpub = true;
        } else {
            ////
            console.log('unknown type');
            process.exit(-1);
        }

        this.$container = cheerio.load(
            readFileSync(this.fullname(PATH_CONTAINER), {encoding: 'utf8'}),
            {
                xmlMode: true
            }
        );

        const rootfilePath = this.$container(TAG_ROOTFILE).attr('full-path');

        this.$rootfile = cheerio.load(
            readFileSync(this.fullname(rootfilePath), {encoding: 'utf8'}),
            {
                xmlMode: true
            }
        );

        // use filename as title
        const head: htmlHead = {
            title: path.basename(this.outputFile, '.html')
        };

        // process spine
        const itemrefs: string[] = [];
        this.$rootfile('spine itemref[idref]').each((index: number, element: cheerio.TagElement) => {
            itemrefs.push(element.attribs['idref']);
        });

        const rootfileDir = path.parse(rootfilePath).dir;
        const htmlFiles: {id: string, href: string }[] = [];
        this.$rootfile(`manifest > item[media-type="${MediaType.xhtml_xml}"]
, manifest > item[media-type="${MediaType.html}"]`)
            .each((index: number, element: cheerio.TagElement) =>
                htmlFiles.push({
                    id: element.attribs['id'],
                    href: path.join(this.root, rootfileDir, element.attribs['href']),
                })
        );

        const sortedHtmlFiles = htmlFiles.sort((a, b) => {
            const ai = itemrefs.indexOf(a.id);
            const bi = itemrefs.indexOf(b.id);
            if (ai === -1)
                return -1;
            else if (bi === -1)
                return 1;
            else if (ai === bi)
                return 0;
            else
                return  ai < bi? -1: 1;
        }).map((a) => a.href);

        // merge these files
        const html = this.mergeAll(head, sortedHtmlFiles);

        writeFileSync(this.outputFile, html, {encoding: 'utf8'});

        // delete tmp
        if (this.extractDir !== undefined) {
            fs.rmSync(this.extractDir, { recursive: true, force: true });
        }
    }

    private parse(filename: string) {
        const dir = path.parse(filename).dir;
        const $ = cheerio.load(
            readFileSync(filename, {encoding: 'utf8'}),
            {
                xmlMode: true,
                decodeEntities: false
        });

        // this file's relative path to root
        const rel = path.relative(this.root, filename);
        // console.log(rel);

        // duplicate <a name='..'> to <a id='..'>
        $('a[name]').each((index: number, element: cheerio.TagElement) => {
            const id = element.attribs['id'];
            if (id === undefined) {
                element.attribs['id'] = element.attribs['name'];
            }
        });

        // update id in a single doc
        $('[id]').each((index: number, element: cheerio.TagElement) => {
            element.attribs['id'] = `${rel}.${element.attribs['id']}`;
            const children = $(element).children().length;

            // workaround: <a id='xxx'/>contents
            // is parsed incorrect to
            // <a id='xxx'>contents</a>
            // if (children === 0) {
            //     $(element).append('<div></div>');
            // }
        });

        $('a[href]').each((index: number, element: cheerio.TagElement) => {
            const href = element.attribs['href'];

            // anchors
            if (!href.startsWith('http')) {
                let newHref = '#';

                const parts = href.split('#', 2);
                if (parts.length === 1) {
                    // link to other doc
                    const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                    newHref = `#${fileRel}`;
                }
                else if (parts.length>1) {
                    // local link
                    if (parts[0] === '') {
                        newHref = `#${rel}.${parts[1]}`;
                    } else {
                        const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                        newHref = `#${fileRel}.${parts[1]}`;
                    }
                }

                element.attribs['href'] = newHref;
            }

        });

        // embed css
        const styles = new Map<string, cheerio.TagElement>();
        let inlineStyles = '';
        $('style, link[type="text/css"]').each((index: number, element: cheerio.TagElement) => {
            const tag = $(element).prop("tagName").toLowerCase();

            // external style file
            if (tag === 'link') {
                const url = path.relative(this.root, path.join(dir, element.attribs['href']));
                styles.set(url, element);
            }

            // inlined styles
            else {
                inlineStyles += $(element).text();
                inlineStyles += '\n';
            }
        });

        let attrs = '';
        for (const [key, value] of Object.entries($('body').attr())) {
            attrs += `${key}="${value}" `;
        }

        // embed images
        $('img, image').each((index: number, element: cheerio.TagElement) => {
            this.genBase64Image(dir, 'src', element);
            this.genBase64Image(dir, 'href', element);
            this.genBase64Image(dir, 'xlink:href', element);
        });

        return {
            styles: styles,
            inlineStyles: inlineStyles,
            body: `<div id="${rel}"><div ${attrs}>\n${$('body').html()}</div></div>\n`,
        }
    }

    private genBase64Image(dir: string, attr: string, elem: cheerio.TagElement) {
        const val = elem.attribs[attr];
        // console.log(attr + ': ' + val);
        //TODO: fetch images from remote
        if ( val !== undefined && !val.startsWith('data:image/') && !val.startsWith('http')) {
            const ext = path.parse(val).ext.substring(1);
            const prefix = `data:image/${ext};base64,`;
            const file = path.join(dir, val);
            if(fs.existsSync(file)) {
                elem.attribs[attr] = prefix + readFileSync(file, {encoding: 'base64'});
            }
        }
    }

    private merge(file1: string, html: any): any {

        const f1 = this.parse(file1);

        f1.styles.forEach((elem: cheerio.TagElement, href: string) => {
            const file = path.join(this.root, href);
            if (fs.existsSync(file)) {
                html.styles.add(readFileSync(file, {encoding: 'utf8'}).toString());
            }
        });

        html.styles.add(f1.inlineStyles);
        html.body.append(f1.body);

        return html;
    }

    private mergeAll(head: htmlHead, files: string[]): string {
        const $ = cheerio.load(`<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
<div id="book-container"></div>
<div id="html-container"></div>
</body>
</html>`);

        $('head').append(`<title>${head.title}</title>\n`);

        const html: any = {
            styles: new Set<string>(),
            body: this.isEpub? $('#book-container') : $('#html-container')
        };

        for(let i=0; i<files.length; ++i) {
            this.merge(files[i], html);
        }

        $('head').append(`<style>
${Array.from(html.styles).join('</style>\n<style>\n')}
</style>\n`);

        return $.html();
    }

    // embed svg, css, javascript, images
    private fullname(name: string) {
        return path.join(this.root, name);
    }

}


