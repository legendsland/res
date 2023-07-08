/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./.keys.js":
/*!******************!*\
  !*** ./.keys.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   keys: () => (/* binding */ keys)
/* harmony export */ });

const keys = {
  h: {
    token: '6879-y792Ui5Ik4Z0O09Z1IIOC50B_ooMN4bN2pBisYULE1s'
   },
  neo4j: {
      uri: 'bolt://192.168.13.2:7687',
      user: 'neo4j',
      pw: 'puma-lava-trinity-madrid-unit-473',
   },
  redDirs: {
      base: "/home/zy/ws/src/prj/babel/src/prj/red/base/"
  },







comments: `

aaa

`
}



/***/ }),

/***/ "./src/node/cli/archive.ts":
/*!*********************************!*\
  !*** ./src/node/cli/archive.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Archive = void 0;
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const jsdom = __webpack_require__(/*! jsdom */ "jsdom");
const STYLE_ELEM_ID = 'res-style';
const SCRIPT_ELEM_ID = 'res-script';
const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<link id="res-style" rel="stylesheet" href="/res/dist/res/style.css" type="text/css">
</head>
<body>
<div id="book-container"></div>
<script id="res-script" src="/res/dist/res/main.js" type="text/javascript"></script>
</body>
</html>
`;
const indexTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<link id="res-style" rel="stylesheet" href="/res/dist/res/style.css" type="text/css">
</head>
<body>
<div id="res-wa-index">
<ul>
</ul>
</div>
</body>
</html>
`;
const WS_ROOT = '/home/zy/ws';
class Archive {
    constructor(inputFile) {
        this.inputFile = inputFile;
        if (inputFile === undefined) {
            this.root = path.join(WS_ROOT, 'res/res/wa');
        }
        else {
            if (!fs.existsSync(inputFile)) {
                console.log(`no file ${inputFile}`);
                return;
            }
            else {
                const stat = fs.lstatSync(inputFile);
                if (stat.isDirectory()) {
                    this.root = inputFile;
                    this.inputFile = undefined;
                }
                else if (stat.isFile() && inputFile.endsWith('.html')) {
                    const prefix = path.join(WS_ROOT, 'res/res/');
                    const d = path.parse(inputFile).dir;
                    this.root = path.join(WS_ROOT, 'res/res/', d.substring(prefix.length));
                }
                else {
                    console.log(`unsupported: ${inputFile}`);
                    return;
                }
            }
        }
        console.log(`root: ${this.root}`);
        this.indexFile = path.join(this.root, 'index.html');
        fs.writeFileSync(this.indexFile, indexTemplate, { encoding: 'utf8' });
        const content = fs.readFileSync(this.indexFile, { encoding: 'utf8' });
        const index = new jsdom.JSDOM(content);
        this.$index = __webpack_require__(/*! jquery */ "jquery")(index.window);
        this.updateDir();
    }
    updateDir() {
        if (this.inputFile) {
            this.update(this.inputFile);
        }
        const urls = new Map();
        this.generateIndex(this.root, urls);
        Array.from(urls).sort(([url1, name1], [url2, name2]) => name1.localeCompare(name2, undefined, { sensitivity: 'accent' })).map(([url, name]) => {
            this.$index('#res-wa-index ul').append(`
<li><a href="${url}" target="_blank">${name}</a></li>
`);
        });
        fs.writeFileSync(this.indexFile, this.$index('html')[0].outerHTML, { encoding: 'utf8' });
    }
    generateIndex(root, urls) {
        const files = fs.readdirSync(root);
        files.forEach(file => {
            const fullpath = path.resolve(root, file);
            if (fs.lstatSync(fullpath).isDirectory()) {
                this.generateIndex(fullpath, urls);
            }
            else if (fullpath.endsWith('.html') && !fullpath.endsWith('index.html')) {
                const rel = fullpath.substring(WS_ROOT.length);
                urls.set(rel, fullpath.substring(this.root.length));
            }
        });
    }
    update(inputFile) {
        console.log(`update: ${inputFile}`);
        const content = fs.readFileSync(inputFile, { encoding: 'utf8' });
        const target = new jsdom.JSDOM(content);
        const $ = __webpack_require__(/*! jquery */ "jquery")(target.window);
        if ($('#book-container').length === 0) {
            const out = new jsdom.JSDOM(template);
            const $out = __webpack_require__(/*! jquery */ "jquery")(out.window);
            $out('html').prepend($('head'));
            $out('#book-container').append($('body').html());
            fs.writeFileSync(inputFile, '<!DOCTYPE html>\n' + $out('html')[0].outerHTML, { encoding: 'utf8' });
        }
        else {
            console.log(inputFile + ': already updated');
        }
    }
}
exports.Archive = Archive;


/***/ }),

/***/ "./src/node/cli/db.ts":
/*!****************************!*\
  !*** ./src/node/cli/db.ts ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path = __webpack_require__(/*! path */ "path");
const res_1 = __webpack_require__(/*! ../server/res */ "./src/node/server/res/index.ts");
const util_1 = __webpack_require__(/*! ../common/util */ "./src/node/common/util.ts");
const dbPath = path.join(util_1.ROOT, 'src/common/db.json');
module.exports = (() => __awaiter(void 0, void 0, void 0, function* () {
    const db = new res_1.NodeDb(dbPath);
    yield db.load();
    const anns = db.db.annotation;
    const addTags = () => {
        anns.records.forEach((record) => {
            record.notes.forEach(n => {
                if (n.tags === undefined) {
                    n.tags = [];
                }
            });
        });
        db.save();
    };
    const addPos = () => {
        anns.records.forEach((record) => {
            record.notes.forEach(n => {
                if (n.pos === undefined) {
                    n.pos = { top: 0, left: 0 };
                }
            });
        });
        db.save();
    };
    return {
        db: db,
    };
}))();


/***/ }),

/***/ "./src/node/cli/dci.ts":
/*!*****************************!*\
  !*** ./src/node/cli/dci.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.del = exports.add = exports.decorate = exports.checkFiles = exports.checkDci = void 0;
const ignorefile_1 = __webpack_require__(/*! ./ignorefile */ "./src/node/cli/ignorefile.ts");
const isomorphic_git_1 = __webpack_require__(/*! isomorphic-git */ "isomorphic-git");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const crypto = __webpack_require__(/*! crypto */ "crypto");
const cheerio = __webpack_require__(/*! cheerio */ "cheerio");
const DCI = '<meta name="dc.identifier" content="res/';
const SCRIPT_ELEM_ID = 'res-script';
const STYLE_ELEM_ID = 'res-style';
function checkDci(files) {
    let htmlFiles = files;
    if (files.length === 0) {
        htmlFiles = (0, ignorefile_1.fromIgnoreFile)()
            .filter(path => path.base.endsWith('html'))
            .map(path => path.dir + '/' + path.base);
    }
    htmlFiles.forEach(filename => {
        const html = fs.readFileSync(filename);
        const idx = html.indexOf(DCI);
        if (idx === -1) {
            console.log(`!! ${filename}`);
        }
        else {
            console.log(`** ${filename}`);
        }
    });
}
exports.checkDci = checkDci;
function checkFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const added = (0, ignorefile_1.fromIgnoreFile)().map(path => path.dir + '/' + path.base).sort();
        const files = yield (0, isomorphic_git_1.listFiles)({
            fs: fs,
            dir: '.',
        });
        const ignoreDirs = [
            'res/images'
        ];
        const fromIgnore = JSON.stringify(added);
        const fromGit = JSON.stringify(files.filter((file) => file.startsWith('res/')
            && ignoreDirs.filter((dir) => file.startsWith(dir)).length === 0).sort());
        if (fromIgnore !== fromGit) {
            console.log('!! not consistent');
            console.log('ignore: ' + fromIgnore);
            console.log('   git: ' + fromGit);
        }
        else {
            console.log('** consistent:\n' + added.join('\n'));
        }
    });
}
exports.checkFiles = checkFiles;
function decorate(file, embedded, output) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path.parse(file);
        const ext = filePath.ext;
        if (ext === ".html") {
            const html = fs.readFileSync(file);
            const $ = cheerio.load(html);
            const $dci = $('meta[name="dc.identifier"]');
            if ($dci.length === 0) {
                const sha1sum = crypto.createHash('sha1');
                const hex = sha1sum.update(html).digest('hex');
                console.log('create dci: res/' + hex);
                $('head').prepend(`\n<meta name="dc.identifier" content="res/${hex}">\n`);
            }
            else {
                console.log(`dci existed, always keep this ID: ${$dci.attr('content')} because hypothes.is may use it.`);
            }
            const $style = $(`#${STYLE_ELEM_ID}`);
            if ($style.length !== 0) {
                $style.remove();
            }
            const $script = $(`#${SCRIPT_ELEM_ID}`);
            if ($script.length !== 0) {
                $script.remove();
            }
            if (embedded) {
                const styleContent = fs.readFileSync('dist/res/style.css').toString();
                $('head').append(`<style id="${STYLE_ELEM_ID}">${styleContent}</style>\n`);
                const scriptContent = fs.readFileSync('dist/res/main.js').toString();
                $('body').append(`<script id="${SCRIPT_ELEM_ID}" type="text/javascript">${scriptContent}</script>\n`);
            }
            else {
                $('head').append(`<link id="${STYLE_ELEM_ID}" rel="stylesheet" href="/res/dist/res/style.css" type="text/css"/>\n`);
                $('body').append(`<script id="${SCRIPT_ELEM_ID}" src="/res/dist/res/main.js" type="text/javascript"></script>\n`);
            }
            fs.writeFileSync(output, $.html());
        }
        else if (ext === ".pdf") {
        }
    });
}
exports.decorate = decorate;
function add(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path.parse(file);
        (0, ignorefile_1.appendIgnore)(filePath);
        (0, isomorphic_git_1.add)({
            fs: fs,
            dir: '.',
            filepath: file
        }).then(() => {
            console.log(`${file} added to git`);
        });
    });
}
exports.add = add;
function del(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield (0, isomorphic_git_1.listFiles)({
            fs: fs,
            dir: '.',
        });
        const list = files.filter(f => f === file);
        if (list.length === 1) {
            (0, isomorphic_git_1.remove)({
                fs: fs,
                dir: '.',
                filepath: list[0]
            }).then(() => {
                console.log(`${file} removed from git`);
            });
        }
        else {
            console.log(`cannot find ${file}`);
        }
        (0, ignorefile_1.delIgnore)(path.parse(file));
    });
}
exports.del = del;


/***/ }),

/***/ "./src/node/cli/epub.ts":
/*!******************************!*\
  !*** ./src/node/cli/epub.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Epub = void 0;
const path = __webpack_require__(/*! path */ "path");
const cheerio_1 = __webpack_require__(/*! cheerio */ "cheerio");
const css = __webpack_require__(/*! css */ "css");
const fs = __webpack_require__(/*! fs */ "fs");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const extract = __webpack_require__(/*! extract-zip */ "extract-zip");
const PATH_CONTAINER = 'META-INF/container.xml';
const TAG_ROOTFILE = 'rootfile';
const TAG_DC_TITLE_ESC = 'dc\\:title';
const TAG_DC_IDENTIFIER_ESC = 'dc\\:identifier';
class Epub {
    constructor(input, output) {
        this.isEpub = false;
        this.inputFile = path.resolve(input);
        this.output = output;
        this.srcRoot = path.join(__dirname, '../../../../');
    }
    convert() {
        return __awaiter(this, void 0, void 0, function* () {
            const isDir = (0, fs_1.lstatSync)(this.inputFile).isDirectory();
            if (isDir) {
                this.root = this.inputFile;
                this.outputFile = this.output ? this.output : this.inputFile + '.html';
            }
            else if (this.inputFile.endsWith('.epub')) {
                this.extractDir = '/tmp/res-epub';
                yield extract(this.inputFile, { dir: this.extractDir });
                this.root = this.extractDir;
                this.outputFile = this.output ? this.output : this.inputFile.substring(0, this.inputFile.length - 5) + '.html';
                this.isEpub = true;
            }
            else {
                console.log('unknown type');
                process.exit(-1);
            }
            this.$container = cheerio_1.default.load((0, fs_1.readFileSync)(this.fullname(PATH_CONTAINER), { encoding: 'utf8' }), {
                xmlMode: true
            });
            const rootfilePath = this.$container(TAG_ROOTFILE).attr('full-path');
            this.$rootfile = cheerio_1.default.load((0, fs_1.readFileSync)(this.fullname(rootfilePath), { encoding: 'utf8' }), {
                xmlMode: true
            });
            const head = {
                title: path.basename(this.outputFile, '.html')
            };
            const itemrefs = [];
            this.$rootfile('spine itemref[idref]').each((index, element) => {
                itemrefs.push(element.attribs['idref']);
            });
            const rootfileDir = path.parse(rootfilePath).dir;
            const htmlFiles = [];
            this.$rootfile(`manifest > item[media-type="${"application/xhtml+xml"}"]
, manifest > item[media-type="${"text/html"}"]`)
                .each((index, element) => htmlFiles.push({
                id: element.attribs['id'],
                href: path.join(this.root, rootfileDir, element.attribs['href']),
            }));
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
                    return ai < bi ? -1 : 1;
            }).map((a) => a.href);
            const html = this.mergeAll(head, sortedHtmlFiles);
            (0, fs_1.writeFileSync)(this.outputFile, html, { encoding: 'utf8' });
            if (this.extractDir !== undefined) {
                fs.rmSync(this.extractDir, { recursive: true, force: true });
            }
        });
    }
    parse(filename, single) {
        const dir = path.parse(filename).dir;
        const $ = cheerio_1.default.load((0, fs_1.readFileSync)(filename, { encoding: 'utf8' }), {
            xmlMode: true,
            decodeEntities: false
        });
        $(':not(:has(*))').each((index, element) => {
            if (element.firstChild === null) {
                if (['title', 'meta', 'style', 'object', 'link'].indexOf(element.name) === -1) {
                    $(element).append('<span class="res-tmp-span" style="display: none;">&nbsp;</span>');
                }
            }
        });
        const rel = path.relative(this.root, filename);
        $('a[name]').each((index, element) => {
            const id = element.attribs['id'];
            if (id === undefined) {
                element.attribs['id'] = element.attribs['name'];
            }
        });
        if (!single) {
            $('[id]').each((index, element) => {
                element.attribs['id'] = `${rel}.${element.attribs['id']}`;
            });
            $('a[href]').each((index, element) => {
                const href = element.attribs['href'];
                if (!href.startsWith('http')) {
                    let newHref = '#';
                    const parts = href.split('#', 2);
                    if (parts.length === 1) {
                        const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                        newHref = `#${fileRel}`;
                    }
                    else if (parts.length > 1) {
                        if (parts[0] === '') {
                            newHref = `#${rel}.${parts[1]}`;
                        }
                        else {
                            const fileRel = path.relative(this.root, path.join(dir, parts[0]));
                            newHref = `#${fileRel}.${parts[1]}`;
                        }
                    }
                    element.attribs['href'] = newHref;
                }
            });
        }
        const styles = new Map();
        let inlineStyles = '';
        $('style, link[type="text/css"], link[rel="stylesheet"], script').each((index, element) => {
            const tag = $(element).prop("tagName").toLowerCase();
            if (tag === 'link') {
                const type = $(element).attr('type');
                if (type === 'text/css') {
                    const url = path.relative(this.root, path.join(dir, element.attribs['href']));
                    styles.set(url, element);
                }
            }
            else if (tag === 'style') {
                const cssContent = $(element).text();
                inlineStyles += this.updateCss(cssContent, filename);
                inlineStyles += '\n';
            }
            else if (tag === 'script') {
                const src = element.attribs['src'];
                if (src !== undefined) {
                    const jsFile = path.join(dir, src);
                    console.log(jsFile);
                    if (fs.existsSync(jsFile)) {
                        $(element).empty();
                        $(element).removeAttr('src');
                        const js = (0, fs_1.readFileSync)(jsFile, { encoding: 'utf-8' }).toString();
                        $(element).text(js);
                    }
                }
            }
        });
        let attrs = '';
        for (const [key, value] of Object.entries($('body').attr())) {
            attrs += `${key}="${value}" `;
        }
        $('img, image, link[rel="icon"]').each((index, element) => {
            this.genBase64Image(dir, 'src', element);
            this.genBase64Image(dir, 'href', element);
            this.genBase64Image(dir, 'xlink:href', element);
        });
        const bookContent = $('body').html().replace(/<span class="res-tmp-span" style="display: none;">&nbsp;<\/span>/g, '');
        let head = undefined;
        if (single) {
            $('head link[rel="stylesheet"]').remove();
            head = $('head').html();
        }
        return {
            styles: styles,
            inlineStyles: inlineStyles,
            body: `<div id="${rel}"><div ${attrs}>\n${bookContent}</div></div>\n`,
            head: head
        };
    }
    genBase64Image(dir, attr, elem) {
        const val = elem.attribs[attr];
        if (val !== undefined
            && !val.startsWith('data:image/')
            && !val.startsWith('http://')
            && !val.startsWith('https://')) {
            const ext = path.parse(val).ext.substring(1);
            const prefix = `data:image/${ext};base64,`;
            const file = path.join(dir, val);
            if (fs.existsSync(file)) {
                elem.attribs[attr] = prefix + (0, fs_1.readFileSync)(file, { encoding: 'base64' });
            }
        }
    }
    getBase64Image(imageFile) {
        const ext = path.parse(imageFile).ext.substring(1);
        const prefix = `data:image/${ext};base64,`;
        if (fs.existsSync(imageFile)) {
            return prefix + (0, fs_1.readFileSync)(imageFile, { encoding: 'base64' });
        }
        else {
            return undefined;
        }
    }
    merge(file1, html, single) {
        const f1 = this.parse(file1, single);
        f1.styles.forEach((elem, href) => {
            const file = path.join(this.root, href);
            if (fs.existsSync(file)) {
                const cssContent = (0, fs_1.readFileSync)(file, { encoding: 'utf8' }).toString();
                html.styles.add(this.updateCss(cssContent, file));
            }
        });
        html.styles.add(f1.inlineStyles);
        html.body.append(f1.body);
        html.head = f1.head;
        return html;
    }
    updateCss(cssContent, file) {
        console.log(file);
        const style = css.parse(cssContent);
        style.stylesheet.rules.forEach(rule => {
            var _a;
            (_a = rule === null || rule === void 0 ? void 0 : rule.declarations) === null || _a === void 0 ? void 0 : _a.filter(decl => decl.property === 'src'
                || decl.property === 'background-image').forEach((decl) => {
                const value = decl.value;
                let start = -1;
                let end = 0;
                if (value.startsWith('url("')) {
                    start = 5;
                    for (let i = start; i < value.length; ++i) {
                        if (value[i] === '"') {
                            end = i;
                            break;
                        }
                    }
                }
                else if (value.startsWith('url(\'')) {
                    start = 5;
                    for (let i = start; i < value.length; ++i) {
                        if (value[i] === '\'') {
                            end = i;
                            break;
                        }
                    }
                }
                else if (value.startsWith('url(')) {
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
                    const fontSrcPath = path.join(path.dirname(file), fontPath);
                    const fontDestPath = path.join(this.srcRoot, 'dist/assets/fonts/', fontName);
                    if (rule.type === 'font-face' && decl.property === 'src') {
                        fs.mkdirSync(path.dirname(fontDestPath), { recursive: true });
                        if (!fs.existsSync(fontDestPath) && fs.existsSync(fontSrcPath)) {
                            console.log('copy font: ', fontPath);
                            fs.cpSync(fontSrcPath, fontDestPath, { recursive: true });
                        }
                        let fullPath = '/res/dist/assets/fonts/' + fontName;
                        const newValue = value.substring(0, start)
                            + fullPath + value.substring(end);
                        decl.value = newValue;
                    }
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
        });
        return css.stringify(style);
    }
    mergeAll(head, files) {
        const $ = cheerio_1.default.load(`<!DOCTYPE html>
<html>
<head>
</head>
<body>
<div id="book-container"></div>
</body>
</html>`);
        const html = {
            styles: new Set(),
            head: undefined,
            body: $('#book-container')
        };
        let headStr = `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${head.title}</title>\n`;
        if (files.length === 1) {
            this.merge(files[0], html, true);
            headStr = html.head;
        }
        else {
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
    fullname(name) {
        return path.join(this.root, name);
    }
}
exports.Epub = Epub;


/***/ }),

/***/ "./src/node/cli/gen.ts":
/*!*****************************!*\
  !*** ./src/node/cli/gen.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createIndex = void 0;
const ignorefile_1 = __webpack_require__(/*! ./ignorefile */ "./src/node/cli/ignorefile.ts");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
function createIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        const list = (0, ignorefile_1.fromIgnoreFile)();
        const config = {
            containerId: 'container',
            data: list
        };
        const db_ = yield __webpack_require__(/*! ./db */ "./src/node/cli/db.ts");
        const db = db_.db;
        list.forEach((l) => {
            const url = encodeURI(path.join('/res/', l.dir, l.base));
            const notes = db.getAnn(url);
            let maxStars = 0;
            notes.forEach(n => {
                let stars = 0;
                for (let i = 0; i < n.note.length; ++i) {
                    if (n.note[i] === '⭐') {
                        ++stars;
                    }
                }
                maxStars = Math.max(maxStars, stars);
            });
            l.note = notes.length;
            l.stars = maxStars;
        });
        const config_json = JSON.stringify(config);
        const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Res</title>
        <link rel="stylesheet" href="/res/dist/res/style.css" />
    </head>
    <body>
    <div id="${config.containerId}"></div>
    <script>var res_config = ${config_json};</script>
    <script src="/res/dist/res/main.js"></script>
    </body>
</html>
`;
        console.log('index.html created');
        fs.writeFileSync('index.html', html);
    });
}
exports.createIndex = createIndex;


/***/ }),

/***/ "./src/node/cli/ignorefile.ts":
/*!************************************!*\
  !*** ./src/node/cli/ignorefile.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appendIgnore = exports.delIgnore = exports.fromIgnoreFile = void 0;
const os = __webpack_require__(/*! os */ "os");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
function fromIgnoreFile() {
    const check_str = '## files below will be committed';
    const ignoreFile = fs.readFileSync('.gitignore').toString();
    const includedFiles = [];
    let start = false;
    ignoreFile.split(os.EOL).forEach(line => {
        if (!start && line === check_str) {
            start = true;
            return;
        }
        if (start && line.trim() !== '') {
            const filename = line.substring(1);
            const p = path.parse(filename);
            includedFiles.push(p);
        }
    });
    return includedFiles;
}
exports.fromIgnoreFile = fromIgnoreFile;
function delIgnore(filePath) {
    const line = '\n!' + filePath.dir + '/' + filePath.base;
    const ignoreFile = fs.readFileSync('.gitignore').toString();
    const idx = ignoreFile.indexOf(line);
    if (idx !== -1) {
        const newContent = ignoreFile.slice(0, idx) + ignoreFile.slice(idx + line.length);
        console.log(`${line} removed from ignore`);
        fs.writeFileSync('.gitignore', newContent);
    }
    else {
        console.log(`${line} not found`);
    }
}
exports.delIgnore = delIgnore;
function appendIgnore(filePath) {
    const added = fromIgnoreFile();
    const found = added.filter(path => filePath.dir === path.dir
        && filePath.base === path.base).length > 0;
    if (!found) {
        let lines = '';
        const file = filePath.dir + '/' + filePath.base;
        const stat = fs.lstatSync(file);
        if (stat.isSymbolicLink()) {
            console.log(`symbol link: ${file}`);
            const real = fs.readlinkSync(file);
            const realFile = path.relative('.', path.resolve(filePath.dir, real));
            lines += '\n!' + realFile;
        }
        lines += '\n!' + file;
        fs.appendFileSync('.gitignore', lines);
        console.log(`++ ${lines}`);
    }
}
exports.appendIgnore = appendIgnore;


/***/ }),

/***/ "./src/node/cli/merge.ts":
/*!*******************************!*\
  !*** ./src/node/cli/merge.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.merge = void 0;
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const jsdom = __webpack_require__(/*! jsdom */ "jsdom");
function getPath($, elem) {
    let path = '';
    while (elem !== null) {
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
    }
    else {
        return undefined;
    }
}
function merge(from, to) {
    const selector = 'h1,h2,h3,h4,p,li,dt,dd,pre,blockquote';
    const fromFile = path.resolve(from);
    const toFile = path.resolve(to);
    const dir = path.dirname(toFile);
    const outName = path.parse(toFile).name + '.2.html';
    const contentFrom = fs.readFileSync(fromFile).toString();
    const contentTo = fs.readFileSync(toFile).toString();
    const domFrom = new jsdom.JSDOM(contentFrom);
    const $from = __webpack_require__(/*! jquery */ "jquery")(domFrom.window);
    const fromElems = $from(selector);
    const domTo = new jsdom.JSDOM(contentTo);
    const $to = __webpack_require__(/*! jquery */ "jquery")(domTo.window);
    const toElems = $to(selector);
    const paths = [];
    for (let i = 0; i < fromElems.length; ++i) {
        const $f = $from(fromElems[i]);
        const p = getPath($from, $f[0]);
        const parents = paths.filter(p_ => p.includes(p_));
        if (parents.length === 0) {
            paths.push(p);
            $f.removeAttr('id');
            $f.find('[id]').removeAttr('id');
            $f.find('img').remove();
            if (!$f.is(':empty')) {
                const newHtml = $f.html();
                const tag = $f.prop('tagName').toLowerCase();
                let attrs = '';
                $from.each($f[0].attributes, function () {
                    if (this.specified) {
                        attrs += `${this.name}=\"${this.value}\" `;
                    }
                });
                $to(toElems[i]).after(`<${tag} ${attrs}>${newHtml}</${tag}>`);
            }
        }
        else {
            console.log(p);
            console.log(parents);
        }
    }
    fs.writeFileSync(path.join(dir, outName), '<!DOCTYPE html>\n' + $to('html').prop('outerHTML').toString());
}
exports.merge = merge;


/***/ }),

/***/ "./src/node/cli/pre-code.ts":
/*!**********************************!*\
  !*** ./src/node/cli/pre-code.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rm = exports.chineseReg = void 0;
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const jsdom = __webpack_require__(/*! jsdom */ "jsdom");
exports.chineseReg = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
function rm(from) {
    const selector = 'pre';
    const fromFile = path.resolve(from);
    const dir = path.dirname(fromFile);
    const outName = path.parse(fromFile).name + '.tmp.html';
    const contentFrom = fs.readFileSync(fromFile).toString();
    const domFrom = new jsdom.JSDOM(contentFrom);
    const $ = __webpack_require__(/*! jquery */ "jquery")(domFrom.window);
    const $pres = $(selector);
    $pres.each(function (index, elem) {
        const hasCh = exports.chineseReg.test($(elem).text());
        if (hasCh) {
            $(elem).remove();
        }
    });
    console.log(path.join(dir, outName));
    fs.writeFileSync(path.join(dir, outName), '<!DOCTYPE html>\n' + $('html').prop('outerHTML').toString());
}
exports.rm = rm;


/***/ }),

/***/ "./src/node/common/util.ts":
/*!*********************************!*\
  !*** ./src/node/common/util.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ROOT = void 0;
exports.ROOT = '/home/zy/ws/res';


/***/ }),

/***/ "./src/node/index.ts":
/*!***************************!*\
  !*** ./src/node/index.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const yargs = __webpack_require__(/*! yargs */ "yargs");
const dci_1 = __webpack_require__(/*! ./cli/dci */ "./src/node/cli/dci.ts");
const gen_1 = __webpack_require__(/*! ./cli/gen */ "./src/node/cli/gen.ts");
const epub_1 = __webpack_require__(/*! ./cli/epub */ "./src/node/cli/epub.ts");
const server_1 = __webpack_require__(/*! ./server/ */ "./src/node/server/index.ts");
const neo4j_docs_1 = __webpack_require__(/*! ./server/crawler/html/neo4j-docs */ "./src/node/server/crawler/html/neo4j-docs.ts");
const hypothes_is_1 = __webpack_require__(/*! ./server/hypothes.is */ "./src/node/server/hypothes.is/index.ts");
const nlp_1 = __webpack_require__(/*! ./server/nlp */ "./src/node/server/nlp/index.ts");
const client_1 = __webpack_require__(/*! ./server/neo4j/client */ "./src/node/server/neo4j/client.ts");
const merge_1 = __webpack_require__(/*! ./cli/merge */ "./src/node/cli/merge.ts");
const pre_code_1 = __webpack_require__(/*! ./cli/pre-code */ "./src/node/cli/pre-code.ts");
const path = __webpack_require__(/*! path */ "path");
const archive_1 = __webpack_require__(/*! ./cli/archive */ "./src/node/cli/archive.ts");
const ROOT = '/home/zy/ws/res/';
(() => __awaiter(void 0, void 0, void 0, function* () {
    const args = yargs
        .usage('Usage: $0 [-a <filename>]')
        .option('index', {
        alias: 'i',
        describe: 'Create index.html',
        boolean: true,
        default: false,
    })
        .option('add', {
        alias: 'a',
        describe: 'Add files to index',
        type: 'string',
    })
        .option('update', {
        alias: 'u',
        describe: 'Update file with css and js',
        type: 'string',
    })
        .option('delete', {
        alias: 'd',
        describe: 'Delete a file from index and git',
        type: 'string',
    })
        .option('merge', {
        alias: 'm',
        describe: 'Merge two html files',
        type: 'array',
    })
        .option('test', {
        alias: 't',
        describe: 'Test html files having dc identifier',
        type: 'array',
    })
        .option('output', {
        alias: 'o',
        describe: 'Output filename',
        type: 'string',
    })
        .option('convert', {
        alias: 'c',
        describe: 'Convert epub to a single html',
        type: 'string',
    })
        .option('server', {
        alias: 's',
        describe: 'Start web server',
        type: 'string',
    })
        .option('embedded', {
        alias: 'e',
        describe: 'Embed script code into html',
        boolean: true,
        default: false
    })
        .option('crawler', {
        alias: 'n',
        describe: 'Script as src link',
        boolean: true,
        default: false
    })
        .option('hypothes.is', {
        alias: 'p',
        describe: 'Script as src link',
        boolean: true,
        default: false
    })
        .option('nlp', {
        alias: 'l',
        describe: 'nlp',
        type: 'string',
    })
        .option('pre', {
        describe: 'delete ch pre',
        type: 'string',
    })
        .command('frame [dir]', 'merge multiple html files into single one as iframes', (yargs) => {
        yargs.positional('dir', {
            type: 'string'
        });
    }, (({ dir }) => {
        let p = undefined;
        if (typeof dir === 'string') {
            p = path.join(ROOT, dir);
        }
        new archive_1.Archive(p);
    }));
    const argv = args.argv;
    console.log(argv);
    if (argv.i) {
        yield (0, gen_1.createIndex)();
    }
    else if (argv.t !== undefined) {
        (0, dci_1.checkDci)(argv.t);
        yield (0, dci_1.checkFiles)();
    }
    else if (argv.a !== undefined) {
        yield (0, dci_1.add)(argv.a);
        yield (0, gen_1.createIndex)();
    }
    else if (argv.u !== undefined) {
        (0, dci_1.decorate)(argv.u, argv.e, argv.o || argv.u);
    }
    else if (argv.d !== undefined) {
        yield (0, dci_1.del)(argv.d);
        yield (0, gen_1.createIndex)();
    }
    else if (argv.c !== undefined) {
        const epub = new epub_1.Epub(argv.c, argv.o);
        yield epub.convert();
    }
    else if (argv.s !== undefined) {
        (0, server_1.startServer)();
    }
    else if (argv.n) {
        (0, neo4j_docs_1.crawler)();
    }
    else if (argv.p) {
        yield (0, hypothes_is_1.fetch)();
    }
    else if (argv.l) {
        const sent = (0, nlp_1.words)(argv.l);
        const client = new client_1.Neo4jClient();
        const result = yield client.addSent(sent);
        console.log(result);
        yield client.dispose();
    }
    else if (argv.m) {
        yield (0, merge_1.merge)(argv.m[0], argv.m[1]);
    }
    else if (argv.pre) {
        (0, pre_code_1.rm)(argv.pre);
    }
}))();


/***/ }),

/***/ "./src/node/server/crawler/html/neo4j-docs.ts":
/*!****************************************************!*\
  !*** ./src/node/server/crawler/html/neo4j-docs.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.crawler = void 0;
const cheerio = __webpack_require__(/*! cheerio */ "cheerio");
const got_1 = __webpack_require__(/*! got */ "got");
const url = __webpack_require__(/*! url */ "url");
const fs = __webpack_require__(/*! fs */ "fs");
function crawler() {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield getToc();
        fs.writeFileSync('/home/zhangyi/ws/res/out.html', context);
    });
}
exports.crawler = crawler;
const baseUrl = 'https://neo4j.com/docs/cypher-manual/current/';
function getToc() {
    return __awaiter(this, void 0, void 0, function* () {
        let html = '<html><head>\n';
        console.log(baseUrl);
        const { body } = yield (0, got_1.default)(baseUrl);
        const $ = cheerio.load(body);
        const styles = yield Promise.all($('link[rel="stylesheet"]').get().map((css) => __awaiter(this, void 0, void 0, function* () {
            const $css = $(css);
            const url_ = url.resolve(baseUrl, $css.attr('href'));
            console.log(url_);
            const { body } = yield (0, got_1.default)(url_);
            return body;
        })));
        const css = `<style>${styles.join('\n')}</style>`;
        const subpages = ($('.nav-list li a').get().map((a) => {
            const $a = $(a);
            const title = $a.text();
            const url_ = url.resolve(baseUrl, $a.attr('href'));
            return {
                title: title,
                url: url_
            };
        }));
        const htmls = yield Promise.all(subpages.map((page) => __awaiter(this, void 0, void 0, function* () {
            return yield get(page.title, page.url);
        })));
        return html + css + '</head>\n<body>' + htmls.map(html => html.content).join('\n') + '</body></html>';
    });
}
function get(title, pageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(pageUrl);
        const { body } = yield (0, got_1.default)(pageUrl);
        const $ = cheerio.load(body);
        $('[id]').get().map(a => {
            const $a = $(a);
            const start = pageUrl.indexOf(baseUrl);
            if (start !== -1) {
                const newId = pageUrl.substring(baseUrl.length).replace(/\//g, '-') + $a.attr('id');
                console.log(`${$a.attr('id')} -> ${newId}`);
                $a.attr('id', newId);
            }
        });
        $('a[href]').get().map(a => {
            const $a = $(a);
            const url_ = url.resolve(pageUrl, $a.attr('href'));
            const start = url_.indexOf(baseUrl);
            if (start !== -1) {
                const newUrl = '#' + url_.substring(baseUrl.length).replace(/\//g, '-').replace(/#/, '');
                console.log(`${$a.attr('href')} -> ${newUrl}`);
                $a.attr('href', newUrl);
            }
        });
        yield Promise.all($('img[src]').get().map((a) => __awaiter(this, void 0, void 0, function* () {
            const $a = $(a);
            let src = $a.attr('src');
            const parts = src.split('.');
            let ext = 'png';
            if (parts.length > 1) {
                ext = parts[parts.length - 1];
            }
            if (src.startsWith('http')) {
            }
            else if (!src.startsWith('data:image')) {
                src = url.resolve(pageUrl, src);
            }
            else {
                return '';
            }
            if (src === 'https://dist.neo4j.com/wp-content/uploads/20210422142941/neo4j-logo-2020.svg') {
                return '';
            }
            const aaa = src.split('/');
            const name = aaa[aaa.length - 1].substring(0, 64);
            const data = yield new Promise((resolve, reject) => {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    console.log('got image: ' + src);
                    const { body, headers } = yield (0, got_1.default)(src, { responseType: 'buffer' });
                    fs.writeFileSync(`/home/zhangyi/ws/res/tmp/${name}`, body);
                    const data = `data:${headers['content-type']};base64,` + Buffer.from(body).toString('base64');
                    resolve(data);
                }), 5000);
            });
            $a.attr('src', data);
        })));
        const id = pageUrl.substring(baseUrl.length).replace(/\//g, '-');
        return {
            content: $('main .content').wrap(`<div><div id="${id}"></div></div>`).parent().parent().html()
        };
    });
}


/***/ }),

/***/ "./src/node/server/hypothes.is/index.ts":
/*!**********************************************!*\
  !*** ./src/node/server/hypothes.is/index.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateUri = exports.fetchOne = exports.fetch = void 0;
const got_1 = __webpack_require__(/*! got */ "got");
const _keys_1 = __webpack_require__(/*! ../../../../.keys */ "./.keys.js");
const API = 'https://api.hypothes.is/api';
const TOKEN = _keys_1.keys.h.token;
function fetch() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.fetch = fetch;
function fetchAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const { body, headers } = yield got_1.default.get(`${api.links.search.url}?user=acct:zhy@hypothes.is`, {
            headers: {
                Accept: 'application/vnd.hypothesis.v1+json',
                Authorization: `Bearer ${TOKEN}`
            }
        });
        console.log(headers);
        console.log(body);
    });
}
function fetchOne(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = api.links.annotation.read.url.replace(/:id/g, id);
        console.log(url);
        const { body, headers } = yield got_1.default.get(`${url}?user=acct:zhy@hypothes.is`, {
            headers: {
                Accept: 'application/vnd.hypothesis.v1+json',
                Authorization: `Bearer ${TOKEN}`
            }
        });
        console.log(headers);
        console.log(body);
    });
}
exports.fetchOne = fetchOne;
function updateUri(id, title, uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const ann = {
            id: id,
            uri: uri,
            target: [
                {
                    source: uri,
                    selector: [
                        {
                            end: 406,
                            type: "TextPositionSelector",
                            start: 297
                        },
                        {
                            type: "TextQuoteSelector",
                            exact: "A by-now-standard strategy for developing a loop invariant and loop was developedin [l] and explained in [2].",
                            prefix: "1982Revised March 1983Abstract. ",
                            suffix: " Nevertheless, its use still pos"
                        }
                    ]
                }
            ],
            document: {
                title: [
                    title
                ]
            },
            links: {
                incontext: 'https://hyp.is/' + id + '/' + uri.substring('http://'.length)
            }
        };
        const url = api.links.annotation.update.url.replace(/:id/g, ann.id);
        console.log(url);
        console.log(JSON.stringify(ann));
        const { body, headers } = yield got_1.default.patch(`${url}?user=acct:zhy@hypothes.is`, {
            headers: {
                Accept: 'application/vnd.hypothesis.v1+json',
                Authorization: `Bearer ${TOKEN}`
            },
            json: ann
        });
        console.log(headers);
        console.log(body);
    });
}
exports.updateUri = updateUri;
const api = {
    "links": {
        "annotation": {
            "create": {
                "method": "POST",
                "url": "https://api.hypothes.is/api/annotations",
                "desc": "Create an annotation"
            },
            "delete": {
                "method": "DELETE",
                "url": "https://api.hypothes.is/api/annotations/:id",
                "desc": "Delete an annotation"
            },
            "read": {
                "method": "GET",
                "url": "https://api.hypothes.is/api/annotations/:id",
                "desc": "Fetch an annotation"
            },
            "update": {
                "method": "PATCH",
                "url": "https://api.hypothes.is/api/annotations/:id",
                "desc": "Update an annotation"
            },
            "flag": {
                "method": "PUT",
                "url": "https://api.hypothes.is/api/annotations/:id/flag",
                "desc": "Flag an annotation for review"
            },
            "hide": {
                "method": "PUT",
                "url": "https://api.hypothes.is/api/annotations/:id/hide",
                "desc": "Hide an annotation as a group moderator"
            },
            "unhide": {
                "method": "DELETE",
                "url": "https://api.hypothes.is/api/annotations/:id/hide",
                "desc": "Unhide an annotation as a group moderator"
            }
        },
        "search": {
            "method": "GET",
            "url": "https://api.hypothes.is/api/search",
            "desc": "Search for annotations"
        },
        "bulk": {
            "method": "POST",
            "url": "https://api.hypothes.is/api/bulk",
            "desc": "Perform multiple operations in one call"
        },
        "group": {
            "member": {
                "add": {
                    "method": "POST",
                    "url": "https://api.hypothes.is/api/groups/:pubid/members/:userid",
                    "desc": "Add the user in the request params to a group."
                },
                "delete": {
                    "method": "DELETE",
                    "url": "https://api.hypothes.is/api/groups/:pubid/members/:userid",
                    "desc": "Remove the current user from a group"
                }
            },
            "create": {
                "method": "POST",
                "url": "https://api.hypothes.is/api/groups",
                "desc": "Create a new group"
            },
            "read": {
                "method": "GET",
                "url": "https://api.hypothes.is/api/groups/:id",
                "desc": "Fetch a group"
            },
            "members": {
                "read": {
                    "method": "GET",
                    "url": "https://api.hypothes.is/api/groups/:pubid/members",
                    "desc": "Fetch all members of a group"
                }
            },
            "update": {
                "method": "PATCH",
                "url": "https://api.hypothes.is/api/groups/:id",
                "desc": "Update a group"
            },
            "create_or_update": {
                "method": "PUT",
                "url": "https://api.hypothes.is/api/groups/:id",
                "desc": "Create or update a group"
            }
        },
        "groups": {
            "read": {
                "method": "GET",
                "url": "https://api.hypothes.is/api/groups",
                "desc": "Fetch the user's groups"
            }
        },
        "links": {
            "method": "GET",
            "url": "https://api.hypothes.is/api/links",
            "desc": "URL templates for generating URLs for HTML pages"
        },
        "profile": {
            "read": {
                "method": "GET",
                "url": "https://api.hypothes.is/api/profile",
                "desc": "Fetch the user's profile"
            },
            "groups": {
                "read": {
                    "method": "GET",
                    "url": "https://api.hypothes.is/api/profile/groups",
                    "desc": "Fetch the current user's groups"
                }
            },
            "update": {
                "method": "PATCH",
                "url": "https://api.hypothes.is/api/profile",
                "desc": "Update a user's preferences"
            }
        },
        "user": {
            "create": {
                "method": "POST",
                "url": "https://api.hypothes.is/api/users",
                "desc": "Create a new user"
            },
            "read": {
                "method": "GET",
                "url": "https://api.hypothes.is/api/users/:userid",
                "desc": "Fetch a user"
            },
            "update": {
                "method": "PATCH",
                "url": "https://api.hypothes.is/api/users/:username",
                "desc": "Update a user"
            }
        }
    }
};


/***/ }),

/***/ "./src/node/server/index.ts":
/*!**********************************!*\
  !*** ./src/node/server/index.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startServer = void 0;
const express = __webpack_require__(/*! express */ "express");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const util = __webpack_require__(/*! util */ "util");
const cheerio = __webpack_require__(/*! cheerio */ "cheerio");
const http = __webpack_require__(/*! http */ "http");
const stopword_1 = __webpack_require__(/*! stopword */ "stopword");
const client_1 = __webpack_require__(/*! ./neo4j/client */ "./src/node/server/neo4j/client.ts");
const res_1 = __webpack_require__(/*! ./res */ "./src/node/server/res/index.ts");
const cors = __webpack_require__(/*! cors */ "cors");
const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
const nlp = __webpack_require__(/*! compromise */ "compromise");
nlp.extend(__webpack_require__(/*! compromise-ngrams */ "compromise-ngrams"));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const server = http.createServer(app);
        const root = path.join(__dirname, '../../../../../');
        const port = 34701;
        app.use(cors());
        app.use(express.static(root));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));
        let neo4jRunning = false;
        const db = new res_1.NodeDb(`${root}/res/src/common/db.json`);
        yield db.load();
        app.get('/res', (req, res) => {
            res.sendFile('index.html', { root: `${root}` });
        });
        app.get('/notebook', (req, res) => {
            res.sendFile('/res/dist/notebook/index.html', { root: `${root}` });
        });
        app.get('/search', (req, res) => {
            res.sendFile('/res/dist/search/index.html', { root: `${root}` });
        });
        app.get('/search/gcse-a47d2a20d46db4877.html', (req, res) => {
            res.sendFile('/res/dist/search/gcse-a47d2a20d46db4877.html', { root: `${root}` });
        });
        app.get('/search/gcse-97c555b677d12465f.html', (req, res) => {
            res.sendFile('/res/dist/search/gcse-97c555b677d12465f.html', { root: `${root}` });
        });
        app.get('/search/gcse-a4690bf98adbc4c10.html', (req, res) => {
            res.sendFile('/res/dist/search/gcse-a4690bf98adbc4c10.html', { root: `${root}` });
        });
        const routes = {
            reqlist: {
                fn: () => {
                    return Object.getOwnPropertyNames(routes)
                        .filter(prop => prop !== 'reqlist')
                        .map(prop => {
                        return { name: prop };
                    });
                }
            },
            neo4jHello: {
                fn: () => __awaiter(this, void 0, void 0, function* () {
                    const result = yield (0, client_1.testConnection)();
                    return result !== undefined ? 'connected' : 'cannot connect';
                }),
            },
            nlpVerbs: {
                fn: () => __awaiter(this, void 0, void 0, function* () {
                    const text = yield cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'));
                    return getVerbs(text);
                })
            },
            resAnnUpdate: {
                fn: (url, note) => __awaiter(this, void 0, void 0, function* () {
                    db.updateAnn(url, JSON.parse(note));
                    db.save();
                    return Promise.resolve();
                })
            },
            resAnnAdd: {
                fn: (url, note) => __awaiter(this, void 0, void 0, function* () {
                    db.addAnnotation(url, note);
                    db.save();
                    return Promise.resolve();
                })
            },
            resAnnAddTag: {
                fn: (url, id, tag) => __awaiter(this, void 0, void 0, function* () {
                    db.updateAnnotationTag(url, id, tag);
                    db.save();
                    return Promise.resolve();
                })
            },
            resAnnDelTag: {
                fn: (url, id, idx) => __awaiter(this, void 0, void 0, function* () {
                    db.delAnnotationTag(url, id, idx);
                    db.save();
                    return Promise.resolve();
                })
            },
            resAnnDel: {
                fn: (url, id) => __awaiter(this, void 0, void 0, function* () {
                    db.delAnnotation(url, id);
                    db.save();
                    return Promise.resolve();
                })
            },
            resAnnSave: {
                fn: () => __awaiter(this, void 0, void 0, function* () {
                    db.save();
                    return Promise.resolve();
                })
            }
        };
        app.post('/res', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const method = body.method;
            const target = routes[method];
            console.log(`request: ${method}, params: ${JSON.stringify(body.params)}`);
            if (target !== undefined) {
                if (!neo4jRunning && method.startsWith('neo4j')) {
                    res.send('neo4j is not running');
                    return;
                }
                const result = yield target.fn(...body.params);
                res.send(result);
            }
            else {
                next('error');
            }
        }));
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    });
}
exports.startServer = startServer;
function cleanText(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const readFile = util.promisify(fs.readFile);
        return new Promise((resolve, reject) => {
            readFile(path).then((data) => {
                const $ = cheerio.load(data.toString());
                const text = $('#OEBPS\\/prf\\.xhtml').text();
                const result = (0, stopword_1.removeStopwords)(text.replace(/\n/g, ' ').split(' ')).join(' ');
                console.log(result);
                resolve(result);
            }).catch((error) => {
                reject();
            });
        });
    });
}
function getVerbs(text) {
    return nlp(text).verbs().out('array');
}


/***/ }),

/***/ "./src/node/server/neo4j/client.ts":
/*!*****************************************!*\
  !*** ./src/node/server/neo4j/client.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Neo4jClient = exports.testConnection = void 0;
const neo4j = __webpack_require__(/*! neo4j-driver */ "neo4j-driver");
const _keys_1 = __webpack_require__(/*! ../../../../.keys */ "./.keys.js");
const util = __webpack_require__(/*! util */ "util");
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = _keys_1.keys.neo4j.uri;
        const user = _keys_1.keys.neo4j.user;
        const pw = _keys_1.keys.neo4j.pw;
        return new Neo4jClient(uri, user, pw).check();
    });
}
exports.testConnection = testConnection;
class Neo4jClient {
    constructor(uri, user, pw) {
        this.uri = uri;
        this.user = user;
        this.pw = pw;
        this.uri = this.uri || _keys_1.keys.neo4j.uri;
        this.user = this.user || _keys_1.keys.neo4j.user;
        this.pw = this.pw || _keys_1.keys.neo4j.pw;
        console.log(`connect to: ${this.user}  ${this.uri}`);
        this.driver = neo4j.driver(this.uri, neo4j.auth.basic(this.user, this.pw));
        this.session = this.driver.session();
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.session.close();
            yield this.driver.close();
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.driver.verifyConnectivity();
                console.log('Driver created');
                return true;
            }
            catch (error) {
                console.log(`connectivity verification failed. ${error}`);
                return false;
            }
        });
    }
    getNodeByLabel(label) {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            try {
                const result = yield this.session.run(`MATCH (n: ${label}) RETURN n`);
                nodes = result.records.map((value) => {
                    return Object.assign({}, value.get(0).properties);
                });
            }
            catch (e) {
            }
            return Promise.resolve(nodes);
        });
    }
    saveNode(note) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = note.id;
            if (id !== undefined) {
                const n = {
                    id: id,
                    title: note.title,
                    content: JSON.stringify(note.content)
                };
                console.log(util.inspect(n));
                try {
                    yield this.session.run(`MERGE (n:EditorJSNote {id: "${id}"})
                    ON CREATE
                        SET n += ${util.inspect(n)}
                    ON MATCH
                        SET n += ${util.inspect(n)}
                    RETURN n`);
                }
                catch (e) {
                    console.log(e);
                    return Promise.resolve(e);
                }
            }
            return Promise.resolve(id);
        });
    }
    deleteNode(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.session.run(`MATCH (n:EditorJSNote {id: "${id}"})
                    DELETE n`);
            }
            catch (e) {
                console.log(e);
                return Promise.resolve(e);
            }
            return Promise.resolve(id);
        });
    }
    addSent(sent) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = true;
            if (this.driver === undefined) {
                console.log('not connected');
                return Promise.resolve(false);
            }
            if (sent.words.length === 0) {
                return Promise.resolve(true);
            }
            let tx;
            try {
                tx = this.session.beginTransaction();
                let stmt = `MERGE(:Sentence{text: "${sent.text}", sha1: "${sent.sha1}"})`;
                console.log(stmt);
                tx.run(stmt);
                if (sent.words.length == 1) {
                    tx.run(`MERGE(:Word{text: "${sent.words[0]}"})`);
                }
                else {
                    sent.words.reduce((prev, curr) => {
                        tx.run(`
                        MERGE(:Word{text: "${prev}"})
                        MERGE(:Word{text: "${curr}"})
                    `);
                        tx.run(`
                    MATCH
                        (a:Word{text: "${prev}"}),
                        (b:Word{text: "${curr}"})
                    MERGE (a)-[:SENTENCE_NEXT]->(b)
                    `);
                        tx.run(`
                    MATCH
                        (a:Word{text: "${prev}"}),
                        (s:Sentence{sha1: "${sent.sha1}"})
                    MERGE (a)-[:IN_SENTENCE]->(s)
                    `);
                        tx.run(`
                    MATCH
                        (a:Word{text: "${curr}"}),
                        (s:Sentence{sha1: "${sent.sha1}"})
                    MERGE (a)-[:IN_SENTENCE]->(s)
                    `);
                        return curr;
                    });
                }
                yield tx.commit();
                console.log('tx finished');
            }
            catch (error) {
                console.log(error);
                success = false;
            }
            finally {
                if (tx !== undefined) {
                    yield tx.close();
                }
            }
            return Promise.resolve(success);
        });
    }
}
exports.Neo4jClient = Neo4jClient;


/***/ }),

/***/ "./src/node/server/nlp/index.ts":
/*!**************************************!*\
  !*** ./src/node/server/nlp/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.words = void 0;
const crypto = __webpack_require__(/*! crypto */ "crypto");
function words(sentence) {
    const sha1sum = crypto.createHash('sha1');
    const hex = sha1sum.update(sentence).digest('hex');
    const words = sentence.split(/[\s\.\,\;\!\-\"]+/)
        .map((w) => w.toLowerCase())
        .filter((w) => w.length > 0);
    return {
        words: words,
        text: sentence,
        sha1: hex
    };
}
exports.words = words;


/***/ }),

/***/ "./src/node/server/res/index.ts":
/*!**************************************!*\
  !*** ./src/node/server/res/index.ts ***!
  \**************************************/
/***/ (() => {

throw new Error("Module build failed (from ./node_modules/ts-loader/index.js):\nError: TypeScript emitted no output for /home/zy/ws/res/src/node/server/res/index.ts.\n    at makeSourceMapAndFinish (/home/zy/ws/res/node_modules/ts-loader/dist/index.js:52:18)\n    at successLoader (/home/zy/ws/res/node_modules/ts-loader/dist/index.js:39:5)\n    at Object.loader (/home/zy/ws/res/node_modules/ts-loader/dist/index.js:22:5)");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ }),

/***/ "cheerio":
/*!**************************!*\
  !*** external "cheerio" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("cheerio");

/***/ }),

/***/ "compromise":
/*!*****************************!*\
  !*** external "compromise" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("compromise");

/***/ }),

/***/ "compromise-ngrams":
/*!************************************!*\
  !*** external "compromise-ngrams" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("compromise-ngrams");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("cors");

/***/ }),

/***/ "css":
/*!**********************!*\
  !*** external "css" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("css");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "extract-zip":
/*!******************************!*\
  !*** external "extract-zip" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("extract-zip");

/***/ }),

/***/ "got":
/*!**********************!*\
  !*** external "got" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("got");

/***/ }),

/***/ "isomorphic-git":
/*!*********************************!*\
  !*** external "isomorphic-git" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("isomorphic-git");

/***/ }),

/***/ "jquery":
/*!*************************!*\
  !*** external "jquery" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("jquery");

/***/ }),

/***/ "jsdom":
/*!************************!*\
  !*** external "jsdom" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("jsdom");

/***/ }),

/***/ "neo4j-driver":
/*!*******************************!*\
  !*** external "neo4j-driver" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("neo4j-driver");

/***/ }),

/***/ "stopword":
/*!***************************!*\
  !*** external "stopword" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("stopword");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "yargs":
/*!************************!*\
  !*** external "yargs" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("yargs");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/node/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map