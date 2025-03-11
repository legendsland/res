/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';
import pDebounce from 'p-debounce';
import React, {
    Fragment, useReducer, useEffect, useState, ChangeEvent,
} from 'react';
import { createRoot } from 'react-dom/client';
import { post } from '../server/request';
import { Db, Note } from '../../common/db';

type ViewEvent = {
    name: string,
    data: any
}

type AnnotationViewProps = {
    ann: PDFAnn,
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

    const annotatedElem = $(`#res-pdf-highlight-${note.id}`)[0];
    if (annotatedElem === undefined) {
        console.log(`invalid selector path #res-pdf-highlight-${note.id}`);
        // return;
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
        ann.jump(note);
        // annotatedElem.scrollIntoView({
        //     block: 'center',
        // });
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
    ann: PDFAnn
}

/**
 * Right-side annotation list
 */
const AnnotationsView = ({
    ann,
}: AnnotationsViewProps) => {
    const [force, forceUpdate] = useReducer((x) => x + 1, 0);

    const isInsideViewPort = (top: number) => document.documentElement.scrollTop < top
        && document.documentElement.scrollTop > top - document.documentElement.clientHeight;

    const scrollListener = () => {
        // console.log('scroll', document.documentElement.scrollTop, document.documentElement.clientHeight);
        ann.notes.forEach((note) => {
            if (isInsideViewPort(note.pos.top)) {
                // mark(note);
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
        const url = new URL(window.location.href);
        if (!url.pathname.endsWith('pdf.html')) {
            scrollListener();
        }
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

export class PDFAnn {
    public notes: Note[];

    private callbacks: ((event: unknown) => void)[] = [];

    private path: string;

    private $container: JQuery;

    public local: boolean;

    private readonly elem = 'res-ann-container';

    private readonly elemId = '#res-ann-container';

    constructor(
        private readonly parent: string,
        private db_: Db,
        ro?: boolean,
    ) {
        const url = new URL(window.location.href);
        this.path = url.pathname + url.search;
        this.local = url.hostname === 'localhost';
        this.notes = [];

        const $ann = $(this.elemId);
        if ($ann.length === 0) {
            $('body').append(`<div id=${this.elem} class="${this.elem}-${this.parent}"></div>`);
        }

        this.$container = $(this.elemId);

        // listen text select event if the server is local hosted
        // remote is hosted on GitHub.
        if (!ro && this.local) {
        }

        // render annotations to page
        this.notes = this.db_.annotation().get(this.path) || [];

        this.notes.sort(this.compareNote.bind(this));
        createRoot(this.$container[0]).render(<AnnotationsView ann={this} />);
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

    compareNote(a: Note, b: Note): number {
        if (a.pos === undefined || b.pos === undefined) { return 0; }
        const result = this.compareNumbers_([
            [a.pos.pageIndex, b.pos.pageIndex],
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
                    // this.unmark(id);
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

    jump(n: Note) {
        this.callbacks.forEach((callback) => callback({
            name: 'jump',
            data: n,
        }));
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
