/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';
import pDebounce from 'p-debounce';
import React, {
    Fragment, useReducer, useEffect, useState, ChangeEvent,
} from 'react';
import { MarkOptions } from 'mark.js';
import Mark from 'mark.js';
import { createRoot } from 'react-dom/client';
import { post } from '../server/request';
import { Db, Note } from '../../common/db';

type ViewEvent = {
    name: string,
    data: any
}

type TooltipViewProps = {
    tooltip: Tooltip
}

/**
 * Popup when text is selected.
 */
const TooltipView = ({
    tooltip,
}: TooltipViewProps) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [display, setDisplay] = useState('none');

    useEffect(() => {
        tooltip.on((event: any) => {
            if (event.name === 'show') {
                handleShow(event.data.x, event.data.y);
                setDisplay('block');
            } else if (event.name === 'hide') {
                handleHide();
            }
        });
    }, []);

    const handleShow = (x: number, y: number) => {
        const x_ = x + document.documentElement.scrollLeft;
        const y_ = y + document.documentElement.scrollTop;
        console.log('select pos', x, document.documentElement.scrollLeft, y, document.documentElement.scrollTop);
        setPos({ x: x_, y: y_ });
        setDisplay('block');
    };

    const handleHide = () => {
        setDisplay('none');
    };

    const handleClick = () => {
        tooltip.newAnnotation();
        handleHide();
    };

    useEffect(() => {
        console.log('render TooltipView', pos);
    });

    return (
        <div
            className="res-ann-tooltip"
            style={{
                position: 'absolute',
                top: 0,
                left: pos.x,
            }}
        >
            <div
                style={{
                    position: 'relative',
                    display,
                    backgroundColor: 'white',
                    top: pos.y,
                    zIndex: 999,
                    marginTop: 0,
                    paddingTop: 0,
                }}
            >
                <ul>
                    <li
                        onClick={handleClick}
                    >
                        <i className="fa fa-solid fa-plus" />
                    </li>
                </ul>
            </div>
        </div>
    );
};

class Tooltip {
    private callback: (event: unknown) => void;

    public newAnn_: Note;

    constructor(
        readonly ann: Ann,
        readonly containerId: string,
    ) {
        const elem = $(`#${this.containerId}`);
        if (elem.length === 0) {
            $('body').append(`<div id="${this.containerId}"></div>`);
        }

        createRoot($(`#${this.containerId}`)[0])
            .render(<TooltipView tooltip={this} />);
    }

    show(x: number, y: number, ann: Note) {
        this.newAnn_ = ann;
        this.callback?.({
            name: 'show',
            data: { x, y },
        });
    }

    hide() {
        this.newAnn_ = undefined;
        this.callback?.({
            name: 'hide',
        });
    }

    on(callback: (event: any) => void) {
        this.callback = callback;
    }

    newAnnotation() {
        console.log('new annotation', this.newAnn_);
        this.ann.newAnnotation(this.newAnn_);
    }
}

type AnnotationViewProps = {
    ann: Ann,
    note: Note,
    local: boolean
}

/**
 * Annotation boxes you can view, edit and delete comments.
 */
const AnnotationView = ({
    ann,
    note,
    local,
}: AnnotationViewProps) => {
    const { id } = note;
    const [content, setContent] = useState(note.note);
    const [newTag, setNewTag] = useState('');
    const [del, setDel] = useState('hidden');

    const annotatedElem = $(note.selector.path)[0];
    if (annotatedElem === undefined) {
        console.log(`invalid selector ${note.selector.path}`);
        return;
    }

    useEffect(() => {
        console.log('render AnnotationView', note.pos.top, note.selected);
        ann.on((event: ViewEvent) => {
            if (event.name === 'blink') {
                blinkBorder(event.data.index);
            }
        });
    }, []);

    // mark all notes in a document

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleFinishEdit = () => {
        note.note = content;
        ann.updateAnn(note);
        $(`#res-ann-${id} .res-ann-note-editor`).hide();
        $(`#res-ann-${id} .res-ann-note-container`).show();
    };

    const handleEdit = () => {
        $(`#res-ann-${id} .res-ann-note-container`).hide();
        $(`#res-ann-${id} .res-ann-note-editor`).show();
    };

    const handleChangeNewTag = (e: ChangeEvent<HTMLInputElement>) => {
        setNewTag(e.target.value.trim());
    };

    const handleNewTagBlur = () => {
        if (newTag !== '') {
            ann.addTag(note.id, newTag);
        }
    };

    const handleClick = () => {
        // move to annotated text
        annotatedElem.scrollIntoView({
            block: 'center',
        });
    };

    const handleMouseEnter = () => {
        setDel('visible');
    };

    const handleMouseLeave = () => {
        setDel('hidden');
    };

    const handleDel = () => {
        ann.delAnnotation(note.id)
            .then(/* no need due to this bad interface, it will remove all () => unmark() */);
    };

    const blinkBorder = (index: string) => {
        if (index === id) {
            const $elem = $(`#res-ann-${id}`).parent();
            $elem[0].scrollIntoView({
                block: 'center',
            });
            $elem.css('outline', '2px red solid');
            setTimeout(() => {
                $elem.css('outline', 'none');
            }, 500);
        }
    };

    const handleClickTag = () => {

    };

    const handleDelTag = (idx: number) => {
        ann.delTag(note.id, idx);
    };

    return (
        <div
            className="res-ann-a-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                margin: '10px',
                fontSize: '12px',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                id={`res-ann-${id}`}
                className="res-ann"
                style={{
                    width: '100%',
                    // marginRight: '5px',
                    border: 'hidden',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                }}
            >
                {/* {mark()} */}
                {/* annotated text */}
                <blockquote
                    style={{
                        color: 'darkgray',
                        // fontStyle: 'italic',
                        // paddingLeft: '2px',
                        // paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '2px',
                        marginTop: 0,
                        marginBottom: 0,
                        // display: '-webkit-box',
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis',
                        // WebkitBoxOrient: 'vertical',
                        // WebkitLineClamp: 2,
                        textIndent: 0,
                        lineHeight: '15px',
                    }}
                    onClick={handleClick}
                >
                    {note.selected}
                </blockquote>

                {/* editor */}
                <div
                    className="res-ann-note-container"
                >
                    {/* rendering node */}
                    {
                        content?.split('\n').map((para) => (
                            <p
                                key={`res-ann-${id}-line`}
                            >
                                {para}
                            </p>
                        ))
                    }
                </div>
                {local
                && (
                    <textarea
                        className="res-ann-note-editor"
                        style={{
                            display: 'none',
                            width: '97%',
                            // height: '100px',
                            minHeight: '100px',
                            maxHeight: '300px',
                            resize: 'vertical',
                            border: 0,
                            textAlign: 'left',
                            marginBottom: '-10px',
                            margin: 0,
                        }}
                        value={content}
                        onChange={handleChange}
                        onBlur={handleFinishEdit}
                    />
                )}
                {/* tags */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        margin: 0,
                    }}
                >
                    {local
                    && (
                        <span>
                            <i
                                className="fa fa-solid fa-edit"
                                onClick={() => handleEdit()}
                            />
                        </span>
                    )}
                    <div
                        className="res-ann-tags"
                        style={{
                            display: 'flex',
                            margin: 0,
                        }}
                    >
                        {
                            note.tags.map((tag, idx) => (
                                <div
                                    className="res-ann-a-tag"
                                    style={{
                                        fontSize: 'smaller',
                                    }}
                                >
                                    <a
                                        className="res-ann-tag"
                                        onClick={handleClickTag}
                                        style={{
                                            color: 'darkgray',
                                        }}
                                    >
                                        <span>
                                            {tag}
                                        </span>
                                    </a>
                                    {local
                                        && (
                                            <i
                                                className="fa fa-solid fa-xmark"
                                                onClick={() => handleDelTag(idx)}
                                            />
                                        )}
                                </div>
                            ))
                        }
                    </div>
                    {local
                    && (
                        <>
                            <input
                                style={{
                                    fontSize: '12px',
                                    border: 0,
                                    textAlign: 'left',
                                    paddingLeft: '10px',
                                    width: '100%',
                                    margin: 0,
                                }}
                                value={newTag}
                                onChange={handleChangeNewTag}
                                onBlur={handleNewTagBlur}
                                placeholder=""
                            />
                            <div
                                style={{
                                // @ts-ignore
                                    visibility: del,
                                    fontSize: '14px',
                                }}
                            >
                                <i
                                    className="fa fa-solid fa-xmark"
                                    onClick={handleDel}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

type AnnotationsViewProps = {
    ann: Ann
}

/**
 * Right-side annotation list
 */
const AnnotationsView = ({
    ann,
}: AnnotationsViewProps) => {
    const [force, forceUpdate] = useReducer((x) => x + 1, 0);

    const mark = (note: Note) => {
        // console.log(`mark: {${note.id}: ${note?.pos.top}, ${note?.pos.left}}, ${note?.selected}`);

        // already marked
        if ($(`mark.${note.id}`).length !== 0) {
            // console.log('already marked');
            return;
        }

        // console.log(`mark ${id}`);
        const mk = ann.mark(note.id, note.selector.path);

        let minTop = Number.MAX_SAFE_INTEGER;
        let minLeft = Number.MAX_SAFE_INTEGER;

        mk.mark(note.selected, {
            separateWordSearch: false,
            acrossElements: true,
            // debug: true,
            // exclude: [
            //   'mark'
            // ],
            // accuracy: 'exactly',

            // it has bugs, may not be called
            each: (elem: Element) => {
                let { top, left } = $(elem).offset();
                top = Math.floor(top);
                left = Math.floor(left);
                minTop = Math.min(minTop, top);
                minLeft = Math.min(minLeft, left);

                $(elem).on('click', () => {
                    ann.show(note.id);
                    console.log(elem);
                }).attr('class', note.id);

                console.log(`min: {${minTop}, ${minLeft}}`);
            },

            done: (nums) => {
                console.log(`total marked: ${nums}`);
                // workaround: previous saved start, end is incorrect
                // update pos
                if (ann.local) {
                    const newNote = { ...note };
                    if (newNote?.pos?.top !== minTop
                        || newNote?.pos?.left !== minLeft) {
                        console.log(`update ${note.id}: ${newNote.pos.top} ${newNote.pos.left} **`);
                        newNote.pos = { top: minTop, left: minLeft };
                        ann.updateAnn(newNote).then(() => {
                            Object.assign(note, newNote);
                        });
                    }
                }
            },

            noMatch(term: string) {
                console.log(`noMatch: ${term}`);
            },
        });
    };

    const isInsideViewPort = (top: number) => document.documentElement.scrollTop < top
        && document.documentElement.scrollTop > top - document.documentElement.clientHeight;

    const scrollListener = () => {
        // console.log('scroll', document.documentElement.scrollTop, document.documentElement.clientHeight);
        ann.notes.forEach((note) => {
            if (isInsideViewPort(note.pos.top)) {
                mark(note);
            }
        });
    };

    useEffect(() => {
        ann.on((event: ViewEvent) => {
            if (event.name === 'invalidation') {
                console.log('invalidation');
                forceUpdate();
            } else if (event.name === 'show') {
                toggle(true);
            }
        });

        window.addEventListener('scroll', scrollListener);

        // hide
        $('#res-ann-all').hide();

        return () => window.removeEventListener('scroll', scrollListener);
    }, []);

    useEffect(() => {
        // ann.unmark();

        scrollListener();
    });

    const handleClick = () => {
        toggle();
    };

    const toggle = (show?: boolean) => {
        if (show) {
            $('#res-ann-all').show();
        } else {
            $('#res-ann-all').toggle();
        }
    };

    return (
        <Fragment
            key={force}
        >
            <button
                type="button"
                onClick={handleClick}
            >
                Notes ({ann.notes.length})
            </button>
            <div
                id="res-ann-all"
            >
                {/* {ann.unmark()} */}
                {
                    ann?.notes.sort((a, b) => ann.compareNote(a, b))
                    // ann?.notes
                        .map((note) => (
                            <AnnotationView
                                key={note.id}
                                ann={ann}
                                note={note}
                                local={ann.local}
                            />
                        ))
                }
            </div>
        </Fragment>
    );
};

export class Ann {
    public notes: Note[];

    private callbacks: ((event: unknown) => void)[] = [];

    private path: string;

    private $container: JQuery;

    public local: boolean;

    private tooltip: Tooltip;

    private readonly elem = 'res-ann-container';

    private readonly elemId = '#res-ann-container';

    marks: Map<string, Mark> = new Map<string, Mark>();

    constructor(
        private readonly parent: string,
        private db_: Db,
    ) {
        const url = new URL(window.location.href);
        this.path = url.pathname + url.search;
        this.local = url.hostname === 'localhost';
        this.notes = [];

        const $ann = $(this.elemId);
        if ($ann.length === 0) {
            $('body').append(`<div id=${this.elem} class="${this.elem}-${this.parent}"></div>`);
        }

        this.tooltip = new Tooltip(this, 'res-ann-tooltip-container');

        this.$container = $(this.elemId);

        // listen text select event if the server is local hosted
        // remote is hosted on GitHub.
        if (this.local) {
            this.textSelect();
        }

        const promises: Promise<unknown>[] = [];
        // render annotations to page
        this.db_.annotation().get(this.path)?.forEach((n) => {
            const newNote = { ...n };

            // for old db version
            let needsUpdate = false;

            if (newNote.tags === undefined) {
                needsUpdate = true;
                newNote.tags = [];
            }

            this.notes.push(newNote);

            if (needsUpdate) {
                promises.push(
                    this.updateAnn(newNote)
                        .catch(() => console.log('failed update notes')),
                );
            }
        });

        this.notes.sort(this.compareNote.bind(this));
        createRoot(this.$container[0]).render(<AnnotationsView ann={this} />);
        Promise.all(promises);
    }

    on(callback: (event: unknown) => void) {
        this.callbacks.push(callback);
    }

    show(index: string) {
        this.callbacks.forEach((callback) => callback({
            name: 'show',
        }));
        this.callbacks.forEach((callback) => callback({
            name: 'blink',
            data: {
                index,
            },
        }));
    }

    mark(idx: string, selector: string): Mark {
        let mk = this.marks.get(idx);
        if (mk === undefined) {
            mk = new Mark($(selector)[0]);
            this.marks.set(idx, mk);
        }
        return mk;
    }

    unmark(id: string) {
        console.log('unmark', id);
        const mk = this.marks.get(id);
        if (mk !== undefined) {
            mk.unmark();
            this.marks.delete(id);
        }
    }

    private textSelect() {
        $(`#${this.parent}`)
            .on('mouseup', (e) => {
                console.log('mouseup');
                const selection = document.getSelection();
                const text = selection.toString();
                console.log(text);
                if (text === '') {
                    this.hideTooltip();
                } else {
                    console.log(`selected: ${text}`);

                    const ranges = [];
                    for (let i = 0; i < selection.rangeCount; i++) {
                        ranges[i] = selection.getRangeAt(i);
                        console.log(ranges[i]);
                        const rect1 = ranges[i].getBoundingClientRect();
                        console.log(rect1);
                        const rect2 = ranges[i].getClientRects();
                        console.log(rect2);
                    }

                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const top = rect.top + document.documentElement.scrollTop;
                    const left = rect.left + document.documentElement.scrollLeft;

                    console.log('selected', top, left);

                    const path = this.getPath(range.startContainer.parentElement);
                    // const offsetTop = $(range.startContainer.parentElement).offset().top;
                    // const offsetLeft = $(range.startContainer.parentElement).offset().left;
                    // console.log(`offsetTop: ${offsetTop}`);
                    if (path !== undefined) {
                        this.showTooltip(
                            {
                                id: `${Date.now()}`,
                                selected: text,
                                selector: {
                                    path,
                                // start: start,
                                // end: end
                                },
                                note: '',
                                tags: [],
                                pos: { top, left },
                            },
                            e.clientX,
                            e.clientY,
                        );
                    }
                }
            });
    }

    compareNote(a: Note, b: Note): number {
        if (a.pos === undefined || b.pos === undefined) { return 0; }
        const result = this.compareNumbers_([
            [a.pos.top, b.pos.top],
            [a.pos.left, b.pos.left],
        ]);

        // console.log(`{${a.pos.top}, ${b.pos.top}}, {${a.pos.left}, ${b.pos.left}}: ${result}`);
        return result;
    }

    compareNumbers_(nums: [number, number][]): number {
        if (nums.length === 0) return 0;

        const pair = nums.shift();
        return pair[0] > pair[1] ? 1
            : pair[0] === pair[1] ? this.compareNumbers_(nums) : -1;
    }

    private getPath(elem: HTMLElement) {
        let path = '';
        while (elem !== null) {
            if (elem.id === this.parent) {
                path = `#${this.parent} ${path}`;
                break;
            }

            const id = $(elem.parentNode).children(elem.tagName).index(elem);
            const nth = `:eq(${id})`;
            path = ` > ${elem.tagName.toLowerCase()}${nth}${path}`;

            elem = elem.parentElement;
        }
        console.log(`get path: ${path}`);

        if (path.startsWith(`#${this.parent}`)) {
            return path;
        }
        return undefined;
    }

    newAnnotation(note: Note) {
        return this.request('resAnnAdd', this.path, note)
            .then(() => {
                this.notes.push(note);
                this.callbacks.forEach((callback) => callback({
                    name: 'invalidation',
                }));
            });
    }

    async delAnnotation(id: string): Promise<unknown> {
        return this.request('resAnnDel', this.path, id)
            .then(() => {
                const idx = this.notes.findIndex((n) => n.id === id);
                if (idx !== -1) {
                    this.notes.splice(idx, 1);
                    this.unmark(id);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation',
                    }));
                }
            });
    }

    async delTag(id: string, idx: number): Promise<unknown> {
        return this.request('resAnnDelTag', this.path, id, idx)
            .then(() => {
                const nodeIdx = this.notes.findIndex((n) => n.id === id);
                if (nodeIdx !== -1) {
                    this.notes[nodeIdx].tags.splice(idx, 1);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation',
                    }));
                }
            });
    }

    async addTag(id: string, tag: string): Promise<unknown> {
        return this.request('resAnnAddTag', this.path, id, tag)
            .then(() => {
                const idx = this.notes.findIndex((n) => n.id === id);
                if (idx !== -1) {
                    this.notes[idx].tags.push(tag);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation',
                    }));
                }
            });
    }

    async updateAnn(n: Note): Promise<unknown> {
        return this.request('resAnnUpdate', this.path, JSON.stringify(n))
            .then(() => {
                this.callbacks.forEach((callback) => callback({
                    name: 'invalidation',
                }));
            });
    }

    private hideTooltip() {
        this.tooltip.hide();
    }

    private showTooltip(n: Note, x: number, y: number) {
        // get mouse position
        this.tooltip.show(x, y, n);
    }

    debounced = (
        func: Parameters<typeof pDebounce>[0],
        ...args: unknown[]
    ) => pDebounce(func, 2000).bind(this)(...args);

    debouncedRequest = pDebounce(this.request, 2000).bind(this);

    request(method: string, ...params: unknown[]): Promise<unknown> {
        if (this.local) {
            // set timeout promise
            const timeout = this.timeoutAfter(10);

            // real request
            const req = post('/res', {
                method,
                params,
            });
            return Promise.race([timeout, req]);
        }
        return Promise.reject(new Error('not local hosted'));
    }

    private timeoutAfter(seconds: number): Promise<unknown> {
        // @ts-ignore
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('request timeout'));
            }, seconds * 1000);
        });
    }
}
