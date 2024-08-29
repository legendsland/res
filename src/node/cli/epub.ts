/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

/**
 * Load, parse epub file and convert it to html.
 */

import * as path from 'path';
import cheerio from 'cheerio';
import * as css from 'css';
import * as fs from 'fs';
import { lstatSync, readFileSync, writeFileSync } from 'fs';
import extract from 'extract-zip';

const PATH_CONTAINER = 'META-INF/container.xml';
const TAG_ROOTFILE = 'rootfile';
const TAG_DC_TITLE_ESC = 'dc\\:title';
const TAG_DC_IDENTIFIER_ESC = 'dc\\:identifier';

const enum MediaType {
    xhtml_xml = 'application/xhtml+xml',
    html = 'text/html',
}

interface htmlHead {
    title: string
}

export class Epub {
    private $container: cheerio.Root;

    private $rootfile: cheerio.Root;

    private inputFile: string;

    private outputFile: string;

    private output: string;

    private root: string;

    private extractDir: string;

    private isEpub: boolean;

    private srcRoot: string;

    constructor(input: string, output: string) {
        this.isEpub = false;
        this.inputFile = path.resolve(input);
        this.output = output;
        this.srcRoot = path.join(__dirname, '../../../../');
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
            this.outputFile = this.output ? this.output : `${this.inputFile}.html`;
        } else if (this.inputFile.endsWith('.epub')) {
            // unzip to tmp
            this.extractDir = '/tmp/res-epub';
            await extract(this.inputFile, { dir: this.extractDir });
            this.root = this.extractDir;
            this.outputFile = this.output ? this.output : `${this.inputFile.substring(0, this.inputFile.length - 5)}.html`;
            this.isEpub = true;
        } else {
            /// /
            console.log('unknown type');
            process.exit(-1);
        }

        this.$container = cheerio.load(
            readFileSync(this.fullname(PATH_CONTAINER), { encoding: 'utf8' }),
            {
                xmlMode: true,
            },
        );

        const rootfilePath = this.$container(TAG_ROOTFILE).attr('full-path');

        this.$rootfile = cheerio.load(
            readFileSync(this.fullname(rootfilePath), { encoding: 'utf8' }),
            {
                xmlMode: true,
            },
        );

        // use filename as title
        const head: htmlHead = {
            title: path.basename(this.outputFile, '.html'),
        };

        // process spine
        const itemrefs: string[] = [];
        this.$rootfile('spine itemref[idref]').each((index: number, element: cheerio.TagElement) => {
            itemrefs.push(element.attribs.idref);
        });

        const rootfileDir = path.parse(rootfilePath).dir;
        const htmlFiles: {id: string, href: string }[] = [];
        this.$rootfile(`manifest > item[media-type="${MediaType.xhtml_xml}"]
, manifest > item[media-type="${MediaType.html}"]`)
            .filter((index: number, element: cheerio.TagElement) => !element.attribs.href.startsWith('http') )
            .each((index: number, element: cheerio.TagElement) => htmlFiles.push({
                id: element.attribs.id,
                href: path.join(this.root, rootfileDir, element.attribs.href),
            }));

        const sortedHtmlFiles = htmlFiles.sort((a, b) => {
            const ai = itemrefs.indexOf(a.id);
            const bi = itemrefs.indexOf(b.id);
            if (ai === -1) return -1;
            if (bi === -1) return 1;
            if (ai === bi) return 0;
            return ai < bi ? -1 : 1;
        }).map((a) => a.href);

        console.log(sortedHtmlFiles);

        // merge these files
        const html = this.mergeAll(head, sortedHtmlFiles);

        writeFileSync(this.outputFile, html, { encoding: 'utf8' });

        // delete tmp
        if (this.extractDir !== undefined) {
            fs.rmSync(this.extractDir, { recursive: true, force: true });
        }
    }

    private parse(filename: string, single?: boolean) {
        const { dir } = path.parse(filename);
        const $ = cheerio.load(
            readFileSync(filename, { encoding: 'utf8' }),
            {
                xmlMode: true,
                decodeEntities: false,
            },
        );

        // workaround: <a id='xxx'/>contents
        // is parsed incorrect to
        // <a id='xxx'>contents</a>
        $(':not(:has(*))').each((index: number, element: cheerio.TagElement) => {
            // console.log('empty elem: ', element.name);
            if (element.firstChild === null) {
                if (['title', 'meta', 'style', 'object', 'link'].indexOf(element.name) === -1) {
                    // console.log('empty elem: ', element.name);
                    $(element).append('<span class="res-tmp-span" style="display: none;">&nbsp;</span>');
                }
            }
        });

        // this file's relative path to root
        const rel = path.relative(this.root, filename);
        // console.log(rel);

        // duplicate <a name='..'> to <a id='..'>
        $('a[name]').each((index: number, element: cheerio.TagElement) => {
            const { id } = element.attribs;
            if (id === undefined) {
                element.attribs.id = element.attribs.name;
            }
        });

        // update id in a single doc
        if (!single) {
            $('[id]').each((index: number, element: cheerio.TagElement) => {
                element.attribs.id = `${rel}.${element.attribs.id}`;
            });

            $('a[href]').each((index: number, element: cheerio.TagElement) => {
                const { href } = element.attribs;

                // anchors
                if (!href.startsWith('http')) {
                    let newHref = '#';

                    const parts = href.split('#', 2);
                    if (parts.length === 1) {
                        // link to other doc
                        const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                        newHref = `#${fileRel}`;
                    } else if (parts.length > 1) {
                        // local link
                        if (parts[0] === '') {
                            newHref = `#${rel}.${parts[1]}`;
                        } else {
                            const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                            newHref = `#${fileRel}.${parts[1]}`;
                        }
                    }

                    element.attribs.href = newHref;
                }
            });
        }

        // embed css
        const styles = new Map<string, cheerio.TagElement>();
        let inlineStyles = '';
        $('style, link[type="text/css"], link[rel="stylesheet"], script').each((index: number, element: cheerio.TagElement) => {
            const tag = $(element).prop('tagName').toLowerCase();

            // external style file
            if (tag === 'link') {
                const type = $(element).attr('type');
                if (type === 'text/css') {
                    const url = path.relative(this.root, path.join(dir, element.attribs.href));
                    styles.set(url, element);
                }
            }

            // inlined styles
            else if (tag === 'style') {
                // replace font path
                const cssContent = $(element).text();
                inlineStyles += this.updateCss(cssContent, filename);
                inlineStyles += '\n';
            }

            // javascript
            else if (tag === 'script') {
                const { src } = element.attribs;
                if (src !== undefined) {
                    const jsFile = path.join(dir, src);
                    console.log(jsFile);
                    if (fs.existsSync(jsFile)) {
                        $(element).empty();
                        $(element).removeAttr('src');
                        const js = readFileSync(jsFile, { encoding: 'utf-8' }).toString();
                        $(element).text(js);
                    }
                }
            }
        });

        let attrs = '';
        for (const [key, value] of Object.entries($('body').attr())) {
            attrs += `${key}="${value}" `;
        }

        // embed images
        $('img, image, link[rel="icon"]').each((index: number, element: cheerio.TagElement) => {
            this.genBase64Image(dir, 'src', element);
            this.genBase64Image(dir, 'href', element);
            this.genBase64Image(dir, 'xlink:href', element);
        });

        // not working
        // $('.res-tmp-span').remove();
        const bookContent = $('body').html().replace(/<span class="res-tmp-span" style="display: none;">&nbsp;<\/span>/g, '');

        let head: string | undefined;
        if (single) {
            $('head link[rel="stylesheet"]').remove();
            head = $('head').html();
        }

        return {
            styles,
            inlineStyles,
            body: `<div id="${rel}"><div ${attrs}>\n${bookContent}</div></div>\n`,
            head,
        };
    }

    private genBase64Image(dir: string, attr: string, elem: cheerio.TagElement) {
        const val = elem.attribs[attr];
        // console.log(attr + ': ' + val);
        // TODO: fetch images from remote
        if (val !== undefined
            && !val.startsWith('data:image/')
            && !val.startsWith('http://')
            && !val.startsWith('https://')
        ) {
            const ext = path.parse(val).ext.substring(1);
            const prefix = `data:image/${ext};base64,`;
            const file = path.join(dir, val);
            if (fs.existsSync(file)) {
                elem.attribs[attr] = prefix + readFileSync(file, { encoding: 'base64' });
            }
        }
    }

    private getBase64Image(imageFile: string) {
        const ext = path.parse(imageFile).ext.substring(1);
        const prefix = `data:image/${ext};base64,`;
        if (fs.existsSync(imageFile)) {
            return prefix + readFileSync(imageFile, { encoding: 'base64' });
        }
        return undefined;
    }

    private merge(file1: string, html: any, single?: boolean): any {
        const f1 = this.parse(file1, single);

        f1.styles.forEach((elem: cheerio.TagElement, href: string) => {
            const file = path.join(this.root, href);
            if (fs.existsSync(file)) {
                const cssContent = readFileSync(file, { encoding: 'utf8' }).toString();
                html.styles.add(this.updateCss(cssContent, file));
            }
        });

        html.styles.add(f1.inlineStyles);
        html.body.append(f1.body);
        html.head = f1.head;
        return html;
    }

    private updateCss(cssContent: string, file: string) {
        // console.log(cssContent);
        console.log(file);
        const style = css.parse(cssContent);
        style.stylesheet.rules.forEach((rule) => {
            // if (rule.type === 'font-face') {
            // @ts-ignore
            rule?.declarations?.filter((decl) => decl.property === 'src'
                    || decl.property === 'background-image').forEach((decl: any) => {
                const { value } = decl;
                let start = -1;
                let end = 0;

                // TODO: url may be not at the beginning
                if (value.startsWith('url("')) {
                    start = 5;
                    for (let i = start; i < value.length; ++i) {
                        if (value[i] === '"') {
                            end = i;
                            break;
                        }
                    }
                } else if (value.startsWith('url(\'')) {
                    start = 5;
                    for (let i = start; i < value.length; ++i) {
                        if (value[i] === '\'') {
                            end = i;
                            break;
                        }
                    }
                } else if (value.startsWith('url(')) {
                    start = 4;
                    for (let i = start; i < value.length; ++i) {
                        if (value[i] === ')') {
                            end = i;
                            break;
                        }
                    }
                }

                if (end > 0) {
                    const fontPath = value.substring(start, end);
                    const fontName = path.parse(fontPath).base;
                    // console.log('font: ', fontPath);
                    // check exists such font
                    const fontSrcPath = path.join(path.dirname(file), fontPath);
                    const fontDestPath = path.join(this.srcRoot, 'dist/assets/fonts/', fontName);

                    // copy font files
                    if (rule.type === 'font-face' && decl.property === 'src') {
                        fs.mkdirSync(path.dirname(fontDestPath), { recursive: true });
                        if (!fs.existsSync(fontDestPath) && fs.existsSync(fontSrcPath)) {
                            console.log('copy font: ', fontPath);
                            fs.cpSync(fontSrcPath, fontDestPath, { recursive: true });
                        }

                        const fullPath = `/res/dist/assets/fonts/${fontName}`;
                        const newValue = value.substring(0, start)
                                + fullPath + value.substring(end);
                        decl.value = newValue;
                    }

                    // embed images
                    else if (decl.property === 'background-image') {
                        const data = this.getBase64Image(fontSrcPath);
                        if (data !== undefined) {
                            const newValue = value.substring(0, start)
                                    + data + value.substring(end);
                            decl.value = newValue;
                        }
                    }
                }
            });
            // }
        });

        return css.stringify(style);
    }

    private mergeAll(head: htmlHead, files: string[]): string {
        const $ = cheerio.load(`<!DOCTYPE html>
<html>
<head>
</head>
<body>
<div id="book-container"></div>
</body>
</html>`);

        // $('head').append(`<title>${head.title}</title>\n`);
        const html: any = {
            styles: new Set<string>(),
            head: undefined,
            body: $('#book-container'),
        };

        let headStr = `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${head.title}</title>\n`;

        if (files.length === 1) {
            this.merge(files[0], html, true);
            headStr = html.head;
        } else {
            for (let i = 0; i < files.length; ++i) {
                this.merge(files[i], html);
            }
        }

        $('head').append(headStr);
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
