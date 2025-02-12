const fs = require("fs");
const { JSDOM } = require("jsdom");

// Read the HTML file
const inputHTML = fs.readFileSync("/home/zy/ws/res/res/ssci/input.html", "utf8");

// Parse with JSDOM
const dom = new JSDOM(inputHTML);
const document = dom.window.document;

global.document = document;
const $ = jQuery = require('jquery')(dom.window);

// Select all divs and wrap text content with <span>
$("div").filter(function() {
    return $(this).contents().length === 1 && this.childNodes[0].nodeType === 3;
}).each(function() {
    $(this).html(`<p>${$(this).text().trim()}</p>`);
});


// Save the modified HTML
fs.writeFileSync("/home/zy/ws/res/res/ssci/output.html", dom.serialize());

console.log("Updated HTML saved to output.html");
