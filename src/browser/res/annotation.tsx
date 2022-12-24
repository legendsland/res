import * as $ from 'jquery';
import pDebounce from 'p-debounce';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Fragment, useCallback, useEffect, useState} from 'react';
import {Db, Note} from '../../common/db';
import {post} from '../server/request';
import Mark = require('mark.js');
import {MarkOptions} from 'mark.js';

type ViewEvent = {
    name: string,
    data: any
}

const TooltipView = (props: any) => {
    const tooltip: Tooltip = props.tooltip;

    const [pos, setPos] = useState({x:0, y:0});
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
        setPos({x: x_, y: y_});
        setDisplay('block');
    }

    const handleHide = () => {
        setDisplay('none');
    }

    const handleClick = (e: any) => {
        tooltip.newAnnotation();
        handleHide();
    };

    return <div
        className='res-ann-tooltip'
        style={{
            position: 'absolute',
            top: 0,
            left: pos.x,
        }}
    >
        <div
            style={{
                position: 'relative',
                display: display,
                backgroundColor: 'white',
                top: pos.y,
                zIndex: 999,
                marginTop: 0,
                paddingTop: 0,
            }}>
            <ul>
                <li
                    onClick={handleClick}
                >
                    <i className="fa fa-solid fa-plus"/>
                </li>
            </ul>
        </div>
    </div>
}

export class Tooltip {
    private callback: (event: any) => void;
    public newAnn_: Note;

    constructor(
        readonly ann: Ann,
        readonly containerId: string
    ) {
        const elem = $(`#${this.containerId}`);
        if (elem.length === 0) {
            $('body').append(`<div id="${this.containerId}"></div>`);
        }

        ReactDOM.render(<TooltipView tooltip={this}/>, $(`#${this.containerId}`)[0]);
    }

    show(x: number, y: number, ann: Note) {
        this.newAnn_ = ann;
        this.callback?.({
            name: 'show',
            data: {x: x, y: y},
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
        this.ann.newAnnotation(this.newAnn_);
    }
}

export const AnnotationView  = (props: any) => {

    const ann: Ann = props.ann;
    const note: Note = props.note;
    const id: string = note.id;
    const islocal: boolean = props.islocal;
    const url = new URL(window.location.href);

    const annotatedElem = $(note.selector.path)[0];
    const top = annotatedElem.getBoundingClientRect().top + document.documentElement.scrollTop;
    const zIndex = Math.floor(document.body.offsetHeight) - Math.floor(top);

    const mark = () => {

        // already marked
        if ($(`mark.${id}`).length !== 0) {
            return;
        }

        // console.log(`mark ${id}`);
        const mk = ann.mark(id, note.selector.path);
        console.log(`mark: {${id}: ${note?.pos.top}, ${note?.pos.left}}`);

        let minTop = Number.MAX_SAFE_INTEGER;
        let minLeft = Number.MAX_SAFE_INTEGER;

        mk.mark(note.selected, {
            separateWordSearch: false,
            acrossElements: true,
            // exclude: [
            //   'mark'
            // ],
            // accuracy: 'exactly',
            each: (elem) => {

                let {top, left} = $(elem).offset();
                top = Math.floor(top);
                left = Math.floor(left);
                minTop = Math.min(minTop, top);
                minLeft = Math.min(minLeft, left);

                $(elem).on('click', () => {
                    ann.show(id);
                    console.log(elem);
                }).attr('class', id);

                console.log(`min: {${minTop}, ${minLeft}}`);
            },

            done: (nums) => {
                // workaround: previous saved start, end is incorrect
                // update pos
                if (islocal) {
                    const newNote = Object.assign({}, note);
                    if (newNote?.pos?.top !== minTop
                        || newNote?.pos?.left !== minLeft) {
                        console.log('update ' + id + ': ' + newNote.pos.top + ' ' + newNote.pos.left + ' **');
                        newNote.pos = {top: minTop, left: minLeft};
                        ann.updateAnn(url, newNote).then(() => {
                            Object.assign(note, newNote);
                        })
                    }
                }
            }
        });
    }

    const [content, setContent] = useState(note.note);
    const [newTag, setNewTag] = useState('');
    const [del, setDel] = useState('hidden');

    const handleChange = (e: any) => {
        const newNote = Object.assign({}, note);
        newNote.note = e.target.value;
        ann.debounced(ann.updateAnn, url, newNote)
            .then((n: any) => {
               note.note = n;
            });
        setContent(e.target.value);
    }

    const handleFinishEdit = () => {
        $(`#res-ann-${id} .res-ann-note-editor`).hide();
        $(`#res-ann-${id} .res-ann-note-container`).show();
    }

    const handleEdit = () => {
        $(`#res-ann-${id} .res-ann-note-container`).hide();
        $(`#res-ann-${id} .res-ann-note-editor`).show();
    }

    const handleChangeNewTag = (e: any) => {
        setNewTag(e.target.value.trim());
    }

    const handleNewTagBlur = (e: any) => {
        if (newTag !== '') {
            ann.addTag(url, note.id, newTag);
        }
    }

    const handleClick = (e: any) => {
        // move to annotated text
        annotatedElem.scrollIntoView({
            block: 'center',
        });
    }

    const handleMouseEnter = (e: any) => {
        setDel('visible');
    }

    const handleMouseLeave = (e: any) => {
        setDel('hidden');
    }

    const handleDel = (e: any) => {
        ann.delAnnotation(url, note.id)
            .then(/* no need due to this bad interface, it will remove all () => unmark()*/);
    }

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
    }

    const handleClickTag = () => {

    }

    const handleDelTag = (idx: number) => {
        ann.delTag(url, note.id, idx)
    }

    useEffect(() => {
        ann.on((event: ViewEvent) => {
            if (event.name === 'blink') {
                blinkBorder(event.data.index);
            }
        });

    }, [])

    return <div
        className='res-ann-a-container'
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
            className='res-ann'
            style={{
                width: '100%',
                // marginRight: '5px',
                border: 'hidden',
                paddingLeft: '5px',
                paddingRight: '5px',
            }}
        >
            {mark()}
            {/*annotated text*/}
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

            {/*editor*/}
            <div
                className={'res-ann-note-container'}
            >
                {/* rendering node */}
                {
                    content.split('\n').map(para => {return (
                        <p>{para}</p>
                    )})
                }
            </div>
            {islocal &&
            <textarea
                className={'res-ann-note-editor'}
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
                    margin: 0
                }}
                value={content}
                onChange={handleChange}
                onBlur={handleFinishEdit}
            >
            </textarea>
            }
            {/*tags*/}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: 0,
                }}
            >
                {islocal &&
                <span>
                    <i
                        className="fa fa-solid fa-edit"
                        onClick={() => handleEdit()}
                    />
                </span>
                }
                <div
                    className={'res-ann-tags'}
                    style={{
                        margin: 0,
                    }}
                >
                    {
                        note.tags.map((tag, idx) => {return (
                            <div
                                className={'res-ann-a-tag'}
                                style={{
                                    fontSize: 'smaller',
                                }}
                            >
                                <a
                                    className={'res-ann-tag'}
                                    onClick={handleClickTag}
                                    style={{
                                        color: 'darkgray',
                                    }}
                                >
                                    {tag}
                                </a>
                                {islocal &&
                                    <i className="fa fa-solid fa-xmark"
                                       onClick={() => handleDelTag(idx)}
                                    />
                                }
                            </div>
                        )})
                    }
                </div>
                {islocal &&
                <Fragment>
                <input
                    style={{
                        fontSize: '12px',
                        border: 0,
                        textAlign: 'left',
                        paddingLeft: '10px',
                        margin: 0,
                    }}
                    value={newTag}
                    onChange={handleChangeNewTag}
                    onBlur={handleNewTagBlur}
                    placeholder={''}
                >
                </input>
                <div
                    style={{
                        //@ts-ignore
                        visibility: del,
                        fontSize: '14px',
                    }}
                >
                    <i className="fa fa-solid fa-xmark"
                       onClick={handleDel}
                    />
                </div>
                </Fragment>
                }
            </div>
        </div>
    </div>
}

export const AnnotationsView = (props: any) => {

    const ann: Ann = props.ann;
    const [force, forceUpdate] = React.useReducer(x => x + 1, 0);

    useEffect(() => {
        ann.on((event: ViewEvent) => {
            if (event.name === 'invalidation') {
                console.log('invalidation');
                forceUpdate();
            } else if (event.name === 'show') {
                toggle(true);
            }
        });

        // hide
        $('#res-ann-all').hide();
    }, [])

    const handleClick = () => {
        toggle();
    }

    const toggle = (show?: boolean) => {
        if(show) {
            $('#res-ann-all').show();
        } else {
            $('#res-ann-all').toggle();
        }
    }

    return <Fragment
        key={force}
    >
        <button
            onClick={handleClick}
        >
            Notes ({ann.notes.length})
        </button>
        <div
            id={'res-ann-all'}
        >
            {ann.unmark()}
            {
                ann?.notes.sort((a, b) => ann.compareNote(a, b))
                // ann?.notes
                    .map((note) => { return (
                        <AnnotationView
                            ann={ann}
                            note={note}
                            islocal={ann.isLocal}
                        />
                )})
            }
        </div>
    </Fragment>;
}

export class Ann {
    public notes: Note[];
    private callbacks: ((event: any) => void)[] = [];
    private path: string;
    private $container: JQuery;
    public isLocal: boolean;
    private tooltip: Tooltip;

    marks: Map<string, Mark> = new Map<string, Mark>();
    constructor(
        private db_: Db
    ) {
        const url = new URL(window.location.href);
        this.path = url.pathname;
        this.isLocal = url.hostname === 'localhost';
        this.notes = [];

        const $ann = $('#res-ann-container');
        if ($ann.length === 0) {
            $('body').append('<div id="res-ann-container"></div>');
        }

        this.tooltip = new Tooltip(this, 'res-ann-tooltip-container');

        this.$container = $('#res-ann-container');
        this.isLocal && this.textSelect();

        let promises: Promise<any>[] = [];
        // render annotations to page
        this.db_.annotation().get(this.path)?.map(n => {
            const newNote = Object.assign({}, n);

            // for old db version
            let needsUpdate = false;


            if (newNote.tags === undefined) {
                needsUpdate = true;
                newNote.tags = [];
            }

            this.notes.push(newNote);

            if (needsUpdate) {
                promises.push(
                    this.updateAnn(url, newNote)
                        .catch(() => console.log('failed update notes'))
                )
            }
        });

        this.notes.sort(this.compareNote.bind(this));
        ReactDOM.render(<AnnotationsView ann={this}/>, this.$container[0]);
        Promise.all(promises);
    }

    on(callback: any) {
        this.callbacks.push(callback);
    }

    show(index: string) {
        this.callbacks.forEach((callback) => callback({
            name: 'show'
        }));
        this.callbacks.forEach((callback) => callback({
            name: 'blink',
            data: {
                index: index
            }
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

    unmark(options?: MarkOptions) {
        this.marks.forEach(mk => mk.unmark(options));
    }

    private textSelect() {
        $('#book-container')
            .on('mouseup', (e) => {
                    const selection = document.getSelection();
                    const text = selection.toString();
                    // console.log(text);
                    if (text === '') {
                        this.hideTooltip();
                    } else {
                        const range = selection.getRangeAt(0);
                        // const rect = range.getBoundingClientRect();
                        // const start = range.startOffset;  // offset of text node
                        // const end = range.endOffset;  // offset of text node

                        const path = this.getPath(range.startContainer.parentElement);
                        // const offsetTop = $(range.startContainer.parentElement).offset().top;
                        // const offsetLeft = $(range.startContainer.parentElement).offset().left;
                        // console.log(`offsetTop: ${offsetTop}`);
                        if (path !== undefined) {
                            this.showTooltip({
                                    id: '' + Date.now(),
                                    selected: text,
                                    selector: {
                                        path: path,
                                        // start: start,
                                        // end: end
                                    },
                                    note: '',
                                    tags: [],
                                    pos: {top: 0, left: 0}
                                },
                                e.clientX,
                                e.clientY);
                        }
                    }
            })
        ;
    }

    compareNote(a: Note, b: Note): number {
        if (a.pos === undefined || b.pos === undefined)
            return 0;
        const result = this.compareNumbers_([
            [a.pos.top, b.pos.top],
            [a.pos.left, b.pos.left],
        ]);

        // console.log(`{${a.pos.top}, ${b.pos.top}}, {${a.pos.left}, ${b.pos.left}}: ${result}`);
        return result;
    }

    compareNumbers_(nums: [number, number][]): number {
        if (nums.length === 0)
            return 0;
        else {
            const pair = nums.shift();
            return pair[0]>pair[1]? 1:
                pair[0]===pair[1]? this.compareNumbers_(nums): -1;
        }
    }

    private getPath(elem: HTMLElement) {

        let path = '';
        while (elem !== null)
        {
            if (elem.id === 'book-container') {
                path = '#book-container' + path;
                break;
            }

            let id = $(elem.parentNode).children(elem.tagName).index(elem);
            let nth = ':eq(' + id + ')';
            path = ' > ' + elem.tagName.toLowerCase() + nth + path;

            elem = elem.parentElement;
        }
        if (path.startsWith('#book-container')) {
            return path;
        } else {
            return undefined;
        }
    }

    newAnnotation(note: Note) {
        return this.request('resAnnAdd', this.path, note)
            .then(() => {
                this.notes.push(note);
                this.callbacks.forEach((callback) => callback({
                    name: 'invalidation'
                }));
        });
    }

    async delAnnotation(url: URL, id: string): Promise<any> {
        return this.request('resAnnDel', url.pathname, id)
            .then(() => {
                const idx = this.notes.findIndex(n => n.id === id);
                if (idx !== -1) {
                    this.notes.splice(idx, 1);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation'
                    }));
                }
            });
    }

    async delTag(url: URL, id: string, idx: number): Promise<any> {
        return this.request('resAnnDelTag', url.pathname, id, idx)
            .then(() => {
                const nodeIdx = this.notes.findIndex(n => n.id === id);
                if (nodeIdx !== -1) {
                    this.notes[nodeIdx].tags.splice(idx, 1);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation'
                    }));
                }
            });
    }

    async addTag(url: URL, id: string, tag: string): Promise<any> {
        return this.request('resAnnAddTag', url.pathname, id, tag)
            .then(() => {
                const idx = this.notes.findIndex(n => n.id === id);
                if (idx !== -1) {
                    this.notes[idx].tags.push(tag);
                    this.callbacks.forEach((callback) => callback({
                        name: 'invalidation'
                    }));
                }
            });
    }

    async updateAnn(url: URL, n: Note): Promise<any> {
        return this.request('resAnnUpdate', url.pathname, JSON.stringify(n))
            .then(() => {
                this.callbacks.forEach((callback) => callback({
                    name: 'invalidation'
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

    debounced = (func: any, ...args: any) => pDebounce(func, 2000).bind(this)(...args);
    debouncedRequest = pDebounce(this.request, 2000).bind(this);

    request(method: string, ...params: any[]): Promise<any> {
        if (this.isLocal) {
            // set timeout promise
            const timeout = this.timeoutAfter(10);

            // real request
            const req = post('/res', {
                    method: method,
                    params: params
            });
            return Promise.race([timeout, req]);
        } else {
            return Promise.reject();
        }
    }

    private timeoutAfter(seconds: number): Promise<any> {
        //@ts-ignore
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({status: -2, reason: 'request timeout'});
            }, seconds * 1000);
        });
    }
}

