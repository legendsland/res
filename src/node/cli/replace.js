const fs = require('fs');
const { JSDOM } = require('jsdom');

const input = process.argv[2];
const output = `${input}.wrap.html`;

// Read the HTML file
const inputHTML = fs.readFileSync(input, 'utf8');

// Parse with JSDOM
const dom = new JSDOM(inputHTML);
const { document } = dom.window;

global.document = document;
const $ = jQuery = require('jquery')(dom.window);

// Select all divs and wrap text content with <span>
// $('div').filter(function () {
//     return $(this).contents().length === 1 && this.childNodes[0].nodeType === 3;
// }).each(function () {
//     $(this).html(`<p>${$(this).text().trim()}</p>`);
// });

// use jquery to wrap all text nodes in <div> with <p>, but not the text nodes in <span>
$('div').wrapInner('<p></p>');

// Save the modified HTML
fs.writeFileSync(output, dom.serialize());

console.log(`Updated HTML saved to ${output}`);
