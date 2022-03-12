
// add toc to a calibre generated html ebook.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const yargs = require('yargs');

const argv = yargs
    .usage('Usage: $0 -i [id1] ... <input>')
    .option('ids', {
        alias: 'i',
        type: 'array',
        desc: 'Element IDs of One or more toc'
    })
    .option('replace', {
        alias: 's',
        boolean: true,
        default: false
    })
    .option('debug', {
        alias: 'd',
        boolean: true,
        default: false
    })
    .argv;

if ( argv.d ) {
    console.log(argv);
}

const input = argv._[0];
const elemIds = argv.i;

const styleId = 'book-toc-style';
const scriptId = 'book-toc-script';
const scriptData = 'book-toc-data'

if (!fs.existsSync(input)) {
    console.log(`File: '${input}' not exists`);
    process.exit(1);
}

// ebook
const fileContent = fs.readFileSync(input).toString();

const $ = cheerio.load(fileContent);


//Search headers if elemIds is empty
if (elemIds === undefined) {
    const id = "book-toc-generated";

    let toc = `<div id="${id}"><ul style="list-style-type:none;padding:0;margin:0;">\n`;

    $('h1,h2,h3,h4').each((idx: number, elem: Element) => {
        const tag = $(elem).prop("tagName").toLowerCase();
        const text = $(elem).text();
        const id = getId(elem);

        let sz = 7;
        const fontsz = ['xx-smaller', 'x-smaller', 'smaller', 'small', 'medium', 'large', 'larger', 'x-larger', 'x-larger', 'xx-larger'];
        let indent = '&nbsp;';
        if (id !== undefined) {
            switch(tag) {
                case 'h1': sz -= 1; indent = indent.repeat(1); break;
                case 'h2': sz -= 2; indent = indent.repeat(2); break;
                case 'h3': sz -= 3; indent = indent.repeat(3); break;
                case 'h4': sz -= 4; indent = indent.repeat(4); break;
                case 'h5': sz -= 5; indent = indent.repeat(5); break;
                default: sz = 3;
            }

            toc += `<li><a href="#${id}" style="font-size: ${fontsz[sz]};">${indent}${text}</a></li>\n`
        }
        // console.log(`${tag}  ${id}: ${text}`)
    });

    toc += '</ul></div>\n';
    // console.log(toc);

    // insert to book
    $('body').append(toc);
    decorate(id, 0);

} else {
    elemIds.forEach((elemId: string, idx: number) => {
        decorate(elemId, idx);
    });
}

genFile();


function getId(elem: Element) {
    let id = undefined;
    while (elem !== undefined && id === undefined) {
        id = $(elem).attr('id');
        elem = $(elem).parent();
    }
    return id;
}

function decorate(elemId: string, idx: number) {

    // toc id
    if ($(`#${elemId}`).length === 0 ) {
        console.log(`ID: '${elemId}' not exists`);
        return;
    }

    const toc = $(`#${elemId}`);
    toc.addClass('book-toc');
    const wrapClass = "book-toc-wrapper";
    const wrapId = `${wrapClass}-${elemId}`;
    toc.wrap(`<div class="${wrapClass}" id="${wrapId}" style="left: ${idx*100}px;"></div>`);
    $(`#${wrapId}`).append('TOC');


    if ($(`#${styleId}`).length === 0 ) {
        // add common css
        const css = fs.readFileSync('./book.css').toString();
        $('head').append(`<style id="${styleId}">${css}</style>`);
    }

    if ($(`#${scriptId}`).length === 0 ) {
        // add common script
        const scripts = fs.readFileSync('./book.html').toString();
        $('html').append(scripts);
    }

    if ($(`#${scriptData}`).length === 0 ) {
        const book_toc_data = JSON.stringify([{wrapid:wrapId, tocid:elemId}]);
        $('html').append(`<script id="${scriptData}">var book_toc_data = '${book_toc_data}'</script>`);
    } else {
        const scriptElem = $(`#${scriptData}`);
        const prevContent = scriptElem.html();
        const start = "var book_toc_data = '".length;
        const end = prevContent.length - 1;

        const data = JSON.parse(prevContent.substring(start, end));
        data.push({wrapid:wrapId, tocid:elemId});
        scriptElem.html(`var book_toc_data = '${JSON.stringify(data)}'`)
    }
}

function genFile() {
    let dir = `./gen`;
    if (argv.s) {
        dir = path.parse(input).dir;
    }
    const filename = path.parse(input).name;
    const genfile = dir + '/' + filename + '.toc.html';
    fs.writeFileSync(genfile, $.root().html());
    console.log(`${genfile} created`);
}
