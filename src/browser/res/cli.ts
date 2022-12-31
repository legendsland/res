/**
 * running from browser console
 */
import * as $ from 'jquery';
import {SearchResult, SearchResultManager} from './search-result';

interface MatchedText {
    original: string,
    originalHtml: string;
    top: number,
    hasMatch: boolean
}

export class Cli {

    private readonly fullText: string;
    private readonly $container: JQuery;
    private readonly height: number;

    private readonly texts = new Map<JQuery, MatchedText>();

    private searchResultMgr: SearchResultManager = new SearchResultManager(
        () => {
            // clean matched texts
            this.texts.forEach((matchedText, $elem) => {
                if (matchedText.hasMatch) {
                    $elem.html(matchedText.originalHtml);
                    matchedText.hasMatch = false;
                }
            });
        }
    );

    constructor(
    ) {
        this.height = $(document).height();
        this.$container = $('#book-container');
        this.fullText = this.$container.text();

        try {
            // needs to calculate the heights of each text nodes
            this.$container
                .find('*')
                .contents()
                .filter(function () {
                    return this.nodeType === 3
                        && $(this).text().trim() !== ''
                        ;
                })
                .parent()
                .each((idx, elem: HTMLElement) => {
                    const $elem = $(elem);
                    const top = elem.getBoundingClientRect().top + document.documentElement.scrollTop;
                    this.texts.set($elem, {
                        original: $elem.text(),
                        originalHtml: $elem.html(),
                        top: top,
                        hasMatch: false
                    });
                })
        } catch (e) {
            // stack overflow
        }
    }

    f(str: string) {
        this.c();

        const re = new RegExp(str,"g");
        const searchResults: SearchResult[] = [];

        const start = Date.now();
        this.texts.forEach((text, $elem) => {
            const original = text.original;
            const len = original.length;

            const spannedTexts: string[] = [];
            const unmatched: string[] = [];

            let lastMatchedEnd = 0;
            let highlightText = '';
            Array.from(original.matchAll(re)).forEach(match => {
                text.hasMatch = true;
                const matchedLen = match[0].length;

                const matchedEnd = match.index + matchedLen;

                const start = Math.max(0, match.index-5);
                const end = Math.min(len, matchedEnd + 5);

                const start2 = Math.max(0, match.index-40);
                const end2 = Math.min(len, matchedEnd + 40);

                searchResults.push({
                    title: original.substring(start, end),
                    text: original.substring(start2, end2),
                    pos: text.top
                });

                // bug: other html are gone ...
                if (match.index !== 0) {
                    unmatched.push(original.substring(lastMatchedEnd, match.index));
                } else {
                    unmatched.push('');
                }

                lastMatchedEnd = matchedEnd;

                spannedTexts.push(`<span class="book-search-matched">${match[0]}</span>`);
            });

            if (text.hasMatch) {
                unmatched.push(original.substring(lastMatchedEnd));

                spannedTexts.push(''); // last empty string
                unmatched.forEach((un, idx) => {
                    highlightText += (un + spannedTexts[idx]);
                });

                // console.log(highlightText);
                $elem.html(highlightText);
            }
        });

        this.searchResultMgr.show(str, searchResults, Date.now() - start);
    }

    c() {
        this.searchResultMgr.close();
    }

    get $() {
        return $;
    }

    s(stop?: boolean) {
        if (stop) {
            $('html, body').stop();
        } else {
            const currentHeight = document.documentElement.scrollTop;
            const distance = this.height - currentHeight;
            const speed = 1000; // pixels per second
            const duration = 1000 * (distance / speed);
            console.log(`distance: ${distance}px, speed: ${speed}px/s, duration: ${duration}ms`);
            $('html, body').animate({
                scrollTop: this.height
            }, {
                duration: duration,
                easing: 'linear',
                progress(animation: JQuery.Animation<HTMLElement>, progress: number, remainingMs: number) {
                }
            });
        }
    }
}

