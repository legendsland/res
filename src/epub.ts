/**
 * Load and parse epub.
 * 
 */

import * as path from "path";
import cheerio from "cheerio";
import * as fs from 'fs';
import { readFileSync, writeFileSync, lstatSync } from "fs";
import * as extract from "extract-zip";

const PATH_CONTAINER = 'META-INF/container.xml';
const TAG_ROOTFILE = 'rootfile';
const TAG_DCI = 'dc:identifier';
const TAG_DCI_ESC = 'dc\\:identifier';

const enum MediaType {
    xhtml_xml = "application/xhtml+xml",
};

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

        const $dci = this.$rootfile(`${TAG_DCI_ESC}[id]`);

        //TODO: if not exists
        const dci = $dci.text();


        const rootfileDir = path.parse(rootfilePath).dir;
        const htmlFiles: string[] = [];
        const htmlItems = this.$rootfile(`manifest > item[media-type="${MediaType.xhtml_xml}"]`)
            .each((index: number, element: cheerio.TagElement) => 
                htmlFiles.push(path.join(this.root, rootfileDir, element.attribs['href']))
        );

        // merge these files

        const html = this.mergeAll(htmlFiles);
        
        writeFileSync(this.outputFile, html);

        // delete tmp
        if (this.extractDir !== undefined) {
            fs.rmSync(this.extractDir, { recursive: true, force: true });
        }
    }

    private parse(filename: string) {
        const dir = path.parse(filename).dir;
        const $ = cheerio.load(readFileSync(filename));

        // this file's relative path to root
        const rel = path.relative(this.root, filename);
        // console.log(rel);

        // update id in a single doc
        $('[id]').each((index: number, element: cheerio.TagElement) => {
            const newId = `${rel}.${element.attribs['id']}`;
            element.attribs['id'] = newId;
        });

        $('a[href]').each((index: number, element: cheerio.TagElement) => {
            const href = element.attribs['href'];
            
            // anchors
            if (!href.startsWith('http')) {
                const parts = href.split('#', 2);
                if (parts.length>1) {
                    let newHref = '';
                    // local link
                    if (parts[0] === '') {
                        newHref = `#${rel}.${parts[1]}`;
                    } else {
                        const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                        newHref = `#${fileRel}.${parts[1]}`;
                    }

                    element.attribs['href'] = newHref;
                }
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
            body: `<div ${attrs}>\n${$('body').html()}</div>\n`,
        }
    }

    private genBase64Image(dir: string, attr: string, elem: cheerio.TagElement) {
        const val = elem.attribs[attr];
        // console.log(attr + ': ' + val);
        if ( val !== undefined && !val.startsWith('data:image/')) {
            const ext = path.parse(val).ext.substring(1);
            const prefix = `data:image/${ext};base64,`;
            elem.attribs[attr] = prefix + readFileSync(path.join(dir, val), {encoding: 'base64'});
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

    private mergeAll(files: string[]): string {
        const html: any = {
            styles: new Set<string>(),
            body: ''
        };

        for(let i=0; i<files.length; ++i) {
            this.merge(files[i], html);
        }
        
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${Array.from(html.styles).join('</style>\n<style>\n')}
</style>
</head>
<body>
${html.body}
</body>
</html>`
;
    }

    // embeb svg, css, javascript, images
    private fullname(name: string) {
        return path.join(this.root, name);
    }

}


