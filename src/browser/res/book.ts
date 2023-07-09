/**
 * Decratorm of book
 */

import * as $ from 'jquery';


interface TocEntry {
    id: string;
    fs: number;
    text: string;
}

interface TocContent {
    entries: TocEntry[];
}


class LinkNode {
    children: LinkNode[];
    level: number;

    constructor(
        readonly id: string,
        readonly text: string
    ) {
        this.children = [];
        this.level = 0;
    }

    isElemAncestor(id: string) {
        const ids = $(document.getElementById(id)).parents('[id]').map(function () {
            return this.id
        })
            .get();

        // console.log(id + ' ? ' + this.id + ': ' + ids.includes(this.id));
        // console.log(ids);
        // found
        return ids.includes(this.id);
    }
}

class LinkTree {

    private root: LinkNode = new LinkNode('', 'root');

    add(id: string, text: string) {
        const p = this.parent(this.root, id);
        p.children.push(new LinkNode(id, text));
    }

    // search by layer
    parent(start: LinkNode, id: string): LinkNode {
        for(let i=0; i<start.children.length; ++i) {
            if (start.children[i].isElemAncestor(id)) {
                return this.parent(start.children[i], id);
            }
        }

        return start;
    }

    private depthFirst_(parent: LinkNode, nodes: LinkNode[], level: number) {
        parent.level = level;
        nodes.push(parent);
        parent.children.forEach(child => {
            this.depthFirst_(child, nodes, level+1);
        })
    }

    depthFirst(): LinkNode[] {
        const nodes: LinkNode[] = [];
        this.depthFirst_(this.root, nodes, 0);
        return nodes;
    }
}

export class Toc {

    generate() {

        let tocHtml = '';
        const $prebuilt = $('#res-toc-prebuilt');

        if ($prebuilt.length === 0) {
            console.log('no prebuilt');
            const toc: TocContent = {
                entries: []
            };

            // remove duplicated
            let preText = '';
            const ignored = this.ignore();  // notes, refs
            $('[id]').each((index: number, element: HTMLElement) => {
                const id = $(element).prop('id');
                const tag = $(element).prop("tagName").toLowerCase();
                // console.log(id + ':' + tag);

                // get first text node child of max font size
                const $text = $(element).find('*').contents()
                    .filter(function () {
                        return this.nodeType === 3
                            && $(this).text().trim() !== ''
                            ;
                    })
                    .first();

                const text = $text.text();

                // console.log(text);
                // too long, it may be text, not title
                if (text.length < 64
                    && text !== ''
                    && text !== preText
                    && text.match(ignored) === null) {

                    const fspx = $text.parent().css('font-size')
                    const fs = fspx.substring(0, fspx.length - 'px'.length);

                    toc.entries.push({
                        id: id,
                        fs: Number.parseInt(fs),
                        text: text,
                    });
                    preText = text;
                }

                if (tag === 'h1'
                    || tag === 'h2'
                    || tag === 'h3'
                    || tag === 'h4'
                ) {
                    const text2 = $(element).text().trim();
                    // console.log('---- ' + text2);
                    if (text2.length < 64
                        && text2 !== ''
                        && text2 !== text
                        && text2 !== preText
                        && text2.match(ignored) === null) {

                        const fspx = $(element).css('font-size')
                        const fs = fspx.substring(0, fspx.length - 'px'.length);

                        toc.entries.push({
                            id: id,
                            fs: Number.parseInt(fs),
                            text: text2,
                        });
                        preText = text2;
                    }
                }
            });

            // console.log(toc.entries);
            const fonts = new Set<number>();
            toc.entries.forEach(entry => {
                fonts.add(entry.fs);
            });

            const fontsArray = Array.from(fonts);
            toc.entries.forEach(entry => {
                entry.fs = fontsArray.indexOf(entry.fs);
            });

            if (toc.entries.length > 0) {
                tocHtml = toc.entries.map((entry) =>
                    `<li class="res-toc-fs-${entry.fs}"><a href="#${entry.id}">${entry.text}</a></li>`
                ).reduce((prev, curr) => `${prev}\n${curr}`);

                tocHtml = `<ul>\n${tocHtml}\n</ul>`;
            }
        }

        else {
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

        $('#res-toc-content').on('mouseenter', function () {
            $(this).removeClass('transparent');
        }).on('mouseleave', function () {
            $(this).addClass('transparent');
        }).on('click', function (event) {
            event.stopPropagation();
        }).hide();

        $(window).on('click', function () {
            $('#res-toc-content').hide();
        });
    }

    private toggle(id: string) {
        const $elem = $('#' + id);
        const hidden = $elem.is(":hidden");
        if (hidden) {
            $elem.removeClass('transparent');
            $elem.show();
        } else {
            $elem.addClass('transparent');
            $elem.hide();
        }
    }

    private ignore() {
        return /(\[(\d+|\*+)\])|(\((\d+|\*+)\))|(〔(\d+|\*+)〕)/g
    }
}

