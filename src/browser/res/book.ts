/**
 * Decratorm of book
 */

import * as $ from 'jquery';


interface TocEntry {
    id: string;
    tag: string;
    text: string;
}

interface TocContent {
    entries: TocEntry[];
}

class LinkTree {

    add(id: string) {

    }


}

export class Toc {

    generate() {

        const toc: TocContent = {
            entries: []
        };

        // get all internal links and organize them in a tree-like structure
        // display at most five layers as a table of content.

        // const links = new LinkTree();
        //
        // $('a[href]').each((index: number, elem: HTMLElement) => {
        //     const href: string = $(elem).prop('href');
        //     if (href.charAt(0) === '#') {
        //         const id = href.substring(1);
        //         links.add(id);
        //     }
        // });

        $('[id]').each((index: number, element: HTMLElement) => {
            const id = $(element).prop('id');

            const tag = $(element).prop("tagName").toLowerCase();
            // console.log(id + ':' + tag);

            if (tag === 'h1'
                || tag === 'h2'
                || tag === 'h3'
                || tag === 'h4'
            ) {
                toc.entries.push({
                    id: id,
                    tag: tag,
                    text: $(element).text(),
                });
            }
        });

        let tocHtml = '';
        if (toc.entries.length > 0) {
            tocHtml = toc.entries.map((entry) =>
                `<li class="res-toc-${entry.tag}"><a href="#${entry.id}">${entry.text}</a></li>`
            ).reduce((prev, curr) => `${prev}\n${curr}`);
        }

        $('body').prepend(`
        <div id="res-toc-container">
            <button id="res-toc-control">TOC</button>
            <div id="res-toc-content"><ul>\n${tocHtml}\n</ul></div>
        </div>
        `);

        $('#res-toc-control').on('click', (event) => {
            this.toggle('res-toc-content');
            event.stopPropagation();
        })
        .on('mouseenter', function () {
            $(this).removeClass('transparent');
        })
        .on('mouseleave', function () {
            $(this).addClass('transparent');
        })

        $('#res-toc-content').hide();

        $(window).on('click', (event) => {
            $('#res-toc-content').hide();
        });
    }

    private toggle(id: string) {
        const hidden = $('#' + id).is(":hidden");
        if (hidden) {
            $('#' + id).show();
        } else {
            $('#' + id).hide();
        }
    }
}

