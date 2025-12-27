/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';

interface TocEntry {
    id: string;
    fs: number; // font-size
    text: string;
}

interface TocContent {
    entries: TocEntry[];
}

export class Toc {
    generate() {
        let tocHtml = '';
        const $dynamic = $('#res-toc-dynamic');
        const $prebuilt = $('#res-toc-prebuilt');
        if ($dynamic.length !== 0) {
            console.log('has dynamic');
            const sel = $dynamic.attr('sel');
            console.log(`sel: ${sel}`);
            if (sel !== undefined && sel !== '') {
                // assume selectors is an array
                const selectors = new Function(`return ${sel}`)() as string[];
                // pass 1:
                const toc = $(selectors.join(','))
                    .map(function (index) {
                        const cloned = $(this).clone();
                        if (!$(this).attr('id')) {
                            // Assign a unique ID (e.g., "toc-0", "toc-1")
                            $(this).attr('id', 'res-toc-dynamic-item-' + index);
                        }

                        // NOTE: <a> cannot be nested
                        cloned.find('a').each(function () {
                            $(this).replaceWith($(this).text());
                        });

                        return `<li><div class="res-toc-dynamic-item-container"><a href="#${this.id}">${cloned[0].outerHTML}</a></div></li>`;
                    })
                    .get()
                    .join('\n');

                // pass 2: set rank
                const $toc = $(`<ul>${toc}</ul>`);
                let rank = 0;
                selectors.forEach((selector, rk) => {
                    rank = rk + 1;
                    $(selector, $toc).each(function () {
                        $(this).parent().parent().attr('data-res-toc-rank', rank);
                    });
                });

                // pass 3: simplification
                $('.res-toc-dynamic-item-container > a', $toc).each(function () {
                    const rk = parseInt($(this).parent().attr('data-res-toc-rank') || '1');
                    const spaces = '&nbsp;'.repeat(rk * 4);
                    const text = $(this).text().trim();
                    $(this).html(`${spaces}${text}`);
                });

                tocHtml = $toc[0].outerHTML;
            }
        } else if ($prebuilt.length !== 0) {
            console.log('has prebuilt');
            const sel = $prebuilt.attr('sel');
            if (sel !== undefined && sel !== '') {
                console.log('sel', sel);
                const wrap = $prebuilt.attr('wrap');
                if (wrap !== undefined) {
                    tocHtml = `<${wrap}>${$(sel).html()}</${wrap}>`;
                } else {
                    tocHtml = $(sel).html();
                }
            }
        } else {
            console.log('no prebuilt');
            const toc: TocContent = {
                entries: [],
            };

            // remove duplicated
            let preText = '';
            const ignored = this.ignore(); // notes, refs
            $('[id]').each((index: number, element: HTMLElement) => {
                const id = $(element).prop('id');
                const tag = $(element).prop('tagName').toLowerCase();
                // console.log(id + ':' + tag);

                // get first text node child of max font size
                const $text = $(element)
                    .find('*')
                    .contents()
                    .filter(function () {
                        return this.nodeType === 3 && $(this).text().trim() !== '';
                    })
                    .first();

                const text = $text.text();

                // console.log(text);
                // too long, it may be text, not title
                if (text.length < 64 && text !== '' && text !== preText && text.match(ignored) === null) {
                    const fspx = $text.parent().css('font-size');
                    const fs = fspx.substring(0, fspx.length - 'px'.length);

                    toc.entries.push({
                        id,
                        fs: Number.parseInt(fs),
                        text,
                    });
                    preText = text;
                }

                if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
                    const text2 = $(element).text().trim();
                    // console.log('---- ' + text2);
                    if (
                        text2.length < 64 &&
                        text2 !== '' &&
                        text2 !== text &&
                        text2 !== preText &&
                        text2.match(ignored) === null
                    ) {
                        const fspx = $(element).css('font-size');
                        const fs = fspx.substring(0, fspx.length - 'px'.length);

                        toc.entries.push({
                            id,
                            fs: Number.parseInt(fs),
                            text: text2,
                        });
                        preText = text2;
                    }
                }
            });

            // console.log(toc.entries);
            const fonts = new Set<number>();
            toc.entries.forEach((entry) => {
                fonts.add(entry.fs);
            });

            const fontsArray = Array.from(fonts);
            toc.entries.forEach((entry) => {
                entry.fs = fontsArray.indexOf(entry.fs);
            });

            if (toc.entries.length > 0) {
                tocHtml = toc.entries
                    .map((entry) => `<li class="res-toc-fs-${entry.fs}"><a href="#${entry.id}">${entry.text}</a></li>`)
                    .reduce((prev, curr) => `${prev}\n${curr}`);

                tocHtml = `<ul>\n${tocHtml}\n</ul>`;
            }
        }

        $('body').prepend(`
<div id="res-toc-container">
    <button id="res-toc-control">TOC</button>
    <div id="res-toc-content">${tocHtml}</div>
</div>
`);

        $('#res-toc-control').on('click', (event) => {
            this.toggle('res-toc-content');
            event.stopPropagation();
        });

        $('#res-toc-content')
            .on('mouseenter', function () {
                $(this).removeClass('transparent');
            })
            .on('mouseleave', function () {
                $(this).addClass('transparent');
            })
            .on('click', (event) => {
                event.stopPropagation();
            })
            .hide();

        $(window).on('click', () => {
            $('#res-toc-content').hide();
        });
    }

    private toggle(id: string) {
        const $elem = $(`#${id}`);
        const hidden = $elem.is(':hidden');
        if (hidden) {
            $elem.removeClass('transparent');
            $elem.show();
        } else {
            $elem.addClass('transparent');
            $elem.hide();
        }
    }

    private ignore() {
        return /(\[(\d+|\*+)\])|(\((\d+|\*+)\))|(〔(\d+|\*+)〕)/g;
    }
}
