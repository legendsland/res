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

        // get all internal links and organize them in a tree-like structure
        // display at most five layers as a table of content.

        // const links = new LinkTree();
        // const ids: { id: string, level: number }[] = [];
        // $('a[href]').each((index: number, elem: HTMLElement) => {
        //     const href: string = $(elem).prop('href');
        //     const hash = new URL(href).hash;
        //
        //     if (hash.charAt(0) === '#') {
        //         const id = hash.substring(1);
        //         const level = $(document.getElementById(id)).parents().length;
        //         ids.push({
        //             id: id,
        //             level: level
        //         })
        //     }
        // });
        //
        // // sort first
        // ids.sort((a, b) => {
        //     return a.level>b.level? 1:
        //         a.level==b.level? 0:-1;
        // }).forEach(id => links.add(id.id, $(document.getElementById(id.id)).contents()
        //     .filter(function() {
        //         return this.nodeType === 3;
        //     })
        //     .end()
        //     .first()
        //     .text()
        // ));
        //
        // const toc = links.depthFirst();
        //
        // let tocHtml = '';
        //
        // tocHtml = toc.map(node =>
        //     `<li class="res-toc-level${node.level}"><a href="#${node.id}">${node.text}</a></li>`
        // ).reduce((prev, curr) => `${prev}\n${curr}`);

        const toc: TocContent = {
            entries: []
        };

        // remove duplicated
        let preText = '';
        const ignored = /\[(\d+|\*+)\]/g;  // notes, refs
        $('[id]').each((index: number, element: HTMLElement) => {
            const id = $(element).prop('id');
            const tag = $(element).prop("tagName").toLowerCase();
            // console.log(id + ':' + tag);

            // get first text node child of max font size
            const $text = $(element).find('*').contents()
                .filter(function() {
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
                const fs = fspx.substring(0, fspx.length-'px'.length);

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
                    const fs = fspx.substring(0, fspx.length-'px'.length);

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

        let tocHtml = '';
        if (toc.entries.length > 0) {
            tocHtml = toc.entries.map((entry) =>
                `<li class="res-toc-fs-${entry.fs}"><a href="#${entry.id}">${entry.text}</a></li>`
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
}

