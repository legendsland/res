/**
 * Load and parse epub.
 * 
 */

import * as path from "path";
import cheerio from "cheerio";
import { readFileSync, writeFileSync } from "fs";

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

    constructor(private path: string) {

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


        const htmlFiles: string[] = [];
        const htmlItems = this.$rootfile(`manifest > item[media-type="${MediaType.xhtml_xml}"]`)
            .each((index: number, element: cheerio.TagElement) => 
                htmlFiles.push(this.fullname(element.attribs['href']))
        );


        // merge these files

        const html = this.mergeAll(htmlFiles);
        
        writeFileSync('./merged.html', html);
    }

    private parse(filename: string) {
        const dir = path.parse(filename).dir;
        const $ = cheerio.load(readFileSync(filename));

        // this file's relative path to root
        const rel = path.relative(this.path, filename);
        console.log(rel);

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
                        const fileRel = path.relative(this.path, path.join(dir, parts[0]));
                        newHref = `#${fileRel}.${parts[1]}`;
                    }

                    element.attribs['href'] = newHref;
                }
            }

        });

        const styles = new Map<string, cheerio.TagElement>();

        $('link[type="text/css"]').each((index: number, element: cheerio.TagElement) => {
            const url = path.relative(this.path, path.join(dir, element.attribs['href']));
            styles.set(url, element);
        });

        let attrs = '';
        for (const [key, value] of Object.entries($('body').attr())) {
            attrs += `${key}="${value}" `;
        }


        return {
            styles: styles,
            body: `<div ${attrs}>\n${$('body').html()}</div>\n`,
        }
    }

    private merge(file1: string, html: any): any {

        const f1 = this.parse(file1);

        f1.styles.forEach((elem: cheerio.TagElement, href: string) => {
            html.styles.add(readFileSync(path.join(this.path, href)).toString());
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
        
        return '<html>\n<head>\n<style>\n' + Array.from(html.styles).join('</style>\n<style>\n') + '</style>\n</head>\n<body>\n' + html.body + '</body></html>';
    }

    // embeb svg, css, javascript, images
    private fullname(name: string) {
        return this.path + '/' + name;
    }

}


