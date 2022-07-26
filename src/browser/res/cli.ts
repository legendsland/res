/**
 * running from browser console
 */
import * as $ from 'jquery';

export class Cli {

    readonly text: string;

    constructor() {
        this.text = $('#book-container').text();
    }

    find(str: string) {
        const re = new RegExp(str,"g");
        return this.text.match(re);
    }

    get $() {
        return $;
    }
}
