import * as $ from 'jquery';
import * as _ from 'lodash';
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
            left: pos.x
        }}
    >
        <div
            style={{
               position: 'relative',
               display: display,
               backgroundColor: 'white',
               top: pos.y,
               zIndex: 999
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
    const idx: number = props.idx;
    const islocal: boolean = props.islocal;
    const url = new URL(window.location.href);

    const annotatedElem = $(note.selector.path)[0];
    const top = annotatedElem.getBoundingClientRect().top + document.documentElement.scrollTop;
    const zIndex = Math.floor(document.body.offsetHeight) - Math.floor(top);

    const mark = () => {
        const mk = ann.mark(idx, note.selector.path);
        mk.mark(note.selected, {
            separateWordSearch: false,
            acrossElements: true,
            // accuracy: 'exactly',
            each: (elem) => {
                $(elem).on('click', () => ann.show(idx))
            }
        });
    }

    const unmark = () => {
        ann.unmark(idx, {
        });
    }

    const [content, setContent] = useState(note.note);
    const [newTag, setNewTag] = useState('');
    const [del, setDel] = useState('hidden');

    const handleChange = (e: any) => {
        ann.debouncedRequest('resAnnUpdate', url.pathname, note.id, e.target.value)
            .then((n: any) => {
               note.note = n;
            });
        setContent(e.target.value);
    }

    const handleFinishEdit = () => {
        $(`#res-ann-${idx} .res-ann-note-editor`).hide();
        $(`#res-ann-${idx} .res-ann-note-container`).show();
    }

    const handleEdit = () => {
        $(`#res-ann-${idx} .res-ann-note-container`).hide();
        $(`#res-ann-${idx} .res-ann-note-editor`).show();
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
            .then(() => unmark());
    }

    const blinkBorder = (index: number) => {
        if (index === idx) {
            const $elem = $(`#res-ann-${idx}`).parent();
            $elem[0].scrollIntoView({
                block: 'center',
            });
            $elem.css('outline', '1px red solid');
            setTimeout(() => {
                $elem.css('outline', 'none');
            }, 300);
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
            id={`res-ann-${idx}`}
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
            <p
                style={{
                    color: 'darkgray',
                    fontStyle: 'italic',
                    paddingLeft: '2px',
                    paddingRight: '10px',
                    marginTop: 0,
                    marginBottom: 0,
                    display: '-webkit-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    textIndent: 0,
                    lineHeight: '13px',
                }}
                onClick={handleClick}
            >
                {note.selected}
            </p>

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
                {islocal &&
                <span>
                    <i
                        className="fa fa-solid fa-edit"
                        onClick={() => handleEdit()}
                    />
                </span>
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
                    fontSize: '12px',
                    resize: 'vertical',
                    border: 0,
                    textAlign: 'left',
                    marginBottom: '-10px'
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
                    flexDirection: 'column',
                }}
            >
                <div
                    className={'res-ann-tags'}
                >
                    {
                        note.tags.map((tag, idx) => {return (
                            <div
                                style={{
                                    display: 'inline-block',
                                    fontSize: 'smaller',
                                }}
                            >
                                <a
                                    className={'res-ann-tag'}
                                    onClick={handleClickTag}
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
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginTop: '-10px',
                    }}
                >
                    {islocal &&
                    <Fragment>
                    <input
                        style={{
                            width: '50%',
                            height: '18px',
                            fontSize: '12px',
                            border: 0,
                            textAlign: 'left',
                            paddingLeft: '5px',
                        }}
                        value={newTag}
                        onChange={handleChangeNewTag}
                        onBlur={handleNewTagBlur}
                        placeholder={''}
                    >
                    </input>
                    <div
                        style={{
                            width: '50%',
                        }}
                    >
                        <div
                            style={{
                                //@ts-ignore
                                visibility: del,
                                height: '18px',
                                fontSize: '14px',
                                padding: 0,
                                margin: 0,
                                textAlign: 'right',
                            }}
                        >
                            <i className="fa fa-solid fa-xmark"
                               onClick={handleDel}
                            />
                        </div>
                    </div>
                    </Fragment>
                    }
                </div>
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
            {
                ann?.notes.map((note, idx) => { return (
                    <AnnotationView
                        ann={ann}
                        note={note}
                        idx={idx}
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

    marks: Map<number, Mark> = new Map<number, Mark>();
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

        // render annotations to page
        this.db_.annotation().get(this.path)?.forEach(n => {
            if (n.tags === undefined) {
                n.tags = [];
            }
            this.notes.push(n);
        });

        ReactDOM.render(<AnnotationsView ann={this}/>, this.$container[0]);
    }

    on(callback: any) {
        this.callbacks.push(callback);
    }

    show(index: number) {
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

    mark(idx: number, selector: string): Mark {
        const mk = new Mark($(selector)[0]);
        this.marks.set(idx, mk);
        return mk;
    }

    unmark(idx: number, options?: MarkOptions) {
        const mk = this.marks.get(idx);
        mk.unmark(options);
        this.marks.delete(idx);
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
                        const start = range.startOffset;
                        const end = range.endOffset;

                        const path = this.getPath(range.startContainer.parentElement);
                        if (path !== undefined) {
                            this.showTooltip({
                                    id: '' + Date.now(),
                                    selected: text,
                                    selector: {
                                        path: path,
                                        start: start,
                                        end: end
                                    },
                                    note: '',
                                    tags: [],
                                },
                                e.clientX,
                                e.clientY);
                        }
                    }
            })
        ;
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

    private hideTooltip() {
        this.tooltip.hide();
    }

    private showTooltip(n: Note, x: number, y: number) {
        // get mouse position
        this.tooltip.show(x, y, n);
    }

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

