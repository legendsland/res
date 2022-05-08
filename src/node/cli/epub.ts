/**
 * Load and parse epub.
 *
 */

import * as path from 'path';
import cheerio from 'cheerio';
import * as fs from 'fs';
import {lstatSync, readFileSync, writeFileSync} from 'fs';
import * as extract from 'extract-zip';

const PATH_CONTAINER = 'META-INF/container.xml';
const TAG_ROOTFILE = 'rootfile';
const TAG_DC_TITLE_ESC = 'dc\\:title';
const TAG_DC_IDENTIFIER_ESC = 'dc\\:identifier';

const enum MediaType {
    xhtml_xml = "application/xhtml+xml",
};

interface htmlHead {
    title: string
}

export class Epub {

    private $container: cheerio.Root;
    private $rootfile: cheerio.Root;
    private inputFile: string;
    private output: string;
    private outputFile: string;
    private root: string;
    private extractDir: string;

    constructor(input: string, output: string) {
        this.inputFile = path.resolve(input);
        this.output = output;
    }

    async convert() {

        const isDir = lstatSync(this.inputFile).isDirectory();
        if (isDir) {
            this.root = this.inputFile;
            this.outputFile = this.output? this.output : './out.html';

            if (!fs.existsSync(this.fullname(PATH_CONTAINER))) {
                console.log('invalid epub directory');
                process.exit(-1);
            }

        } else if (this.inputFile.endsWith('.epub')) {
            //unzip to tmp
            this.extractDir = '/tmp/res-epub';
            await extract(this.inputFile, {dir: this.extractDir});
            this.root = this.extractDir;

            this.outputFile = this.output? this.output : this.inputFile.substring(0, this.inputFile.length-5) + '.html';

        } else {
            ////
            console.log('unknow type');
            process.exit(-1);
        }

        this.$container = cheerio.load(
            readFileSync(this.fullname(PATH_CONTAINER)),
            {
                xmlMode: true
            }
        );

        const rootfilePath = this.$container(TAG_ROOTFILE).attr('full-path');

        this.$rootfile = cheerio.load(
            readFileSync(this.fullname(rootfilePath)),
            {
                xmlMode: true
            }
        );

        const head: htmlHead = {
            title: this.$rootfile(TAG_DC_TITLE_ESC).text()
        };

        // process spine
        const itemrefs: string[] = [];
        this.$rootfile('spine itemref[idref]').each((index: number, element: cheerio.TagElement) => {
            itemrefs.push(element.attribs['idref']);
        });

        const rootfileDir = path.parse(rootfilePath).dir;
        const htmlFiles: {id: string, href: string }[] = [];
        this.$rootfile(`manifest > item[media-type="${MediaType.xhtml_xml}"]`)
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

        writeFileSync(this.outputFile, html);

        // delete tmp
        if (this.extractDir !== undefined) {
            fs.rmSync(this.extractDir, { recursive: true, force: true });
        }
    }

    private parse(filename: string) {
        const dir = path.parse(filename).dir;
        const $ = cheerio.load(
            readFileSync(filename),
            {
                xmlMode: true,
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
            const newId = `${rel}.${element.attribs['id']}`;
            element.attribs['id'] = newId;
            const children = $(element).children().length;

            // workaround: <a id='xxx'/>contents
            // is parsed incorrect to
            // <a id='xxx'>contents</a>
            if (children === 0) {
                $(element).append('<div></div>');
            }
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

        $('link[type="text/css"]').each((index: number, element: cheerio.TagElement) => {
            const url = path.relative(this.root, path.join(dir, element.attribs['href']));
            styles.set(url, element);
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
            body: `<div id=${rel}><div ${attrs}>\n${$('body').html()}</div></div>\n`,
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
            html.styles.add(readFileSync(path.join(this.root, href)).toString());
        });

        html.body += f1.body;

        return html;
    }

    private mergeAll(head: htmlHead, files: string[]): string {
        const $ = cheerio.load(`<!DOCTYPE html>
<html>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<head>
</head>
<body>
</body>
</html>`);

        $('head').append(`<title>${head.title}</title>\n`);

        const html: any = {
            styles: new Set<string>(),
            body: ''
        };

        for(let i=0; i<files.length; ++i) {
            this.merge(files[i], html);
        }

        $('head').append(`<style>
${Array.from(html.styles).join('</style>\n<style>\n')}
</style>\n`);

        $('body').append(`${html.body}`);

        return $.html();
    }

    // embeb svg, css, javascript, images
    private fullname(name: string) {
        return path.join(this.root, name);
    }

}


