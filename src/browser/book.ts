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

export class Toc {

    generate() {

        const toc: TocContent = {
            entries: []
        };

        $('[id]').each((index: number, element: HTMLElement) => {
            const id = $(element).prop('id');

            const tag = $(element).prop("tagName").toLowerCase();
            console.log(id + ':' + tag);

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

        const tocHtml = toc.entries.map((entry) => 
            `<li class="res-toc-${entry.tag}"><a href="#${entry.id}">${entry.text}</a></li>`
        )
        .reduce((prev, curr) => `${prev}\n${curr}`);

        $('body').prepend(`
        <div id="res-toc-container">
            <button id="res-toc-control">TOC</button>
            <div id="res-toc-content"><ul>\n${tocHtml}\n</ul></div>
        </div>
        `);

        $('#res-toc-control').on('click', (event) => {
            console.log('control');
            this.toggle('res-toc-content');
            event.stopPropagation();
        });

        $('#res-toc-content').on('click', (event) => {
            event.stopPropagation();
        });

        $('#res-toc-content').on('mouseenter', function () {
            $(this).removeClass('transparent');
        });
    
        $('#res-toc-content').on('mouseleave', function () {
            $(this).addClass('transparent');
        });

        $(window).on('click', (event) => {
            console.log('window');
            $('#res-toc-content').hide();
        });

        $('#res-toc-content').hide();
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

