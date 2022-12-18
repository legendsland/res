import * as $ from 'jquery';
import * as _ from 'lodash';
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

async function request(name: string, params: any[]) {
    return post('/res', {
        method: name,
        params: params,
    });
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
                    <i className="fa-solid fa-plus"></i>
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

const debounceChange = _.debounce((url: string, id: string, ann: string, cb: any) => {
    // send request to server
    request('resAnnUpdate', [
        url,
        id,
        ann
    ]).then(() => {
        cb(ann);
    });

}, 3000);

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
        // const mk = new Mark($(note.selector.path));

        const mk = ann.mark(idx, note.selector.path);
        mk.mark(note.selected, {
            separateWordSearch: false,
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
    const [del, setDel] = useState('hidden');

    const handleChange = (e: any) => {
        debounceChange(url.pathname, note.id, e.target.value, (n: any) => note.note = n);
        setContent(e.target.value);
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
        request('resAnnDel', [
            url.pathname,
            note.id,
        ]).then(() => {
            unmark();
            ann.delAnnotation(note.id);
        })
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
        }}
        onClick={handleClick}
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
            <p
                style={{
                    color: 'darkgray',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    paddingLeft: '2px',
                    paddingRight: '10px',
                    marginTop: 0,

                    display: '-webkit-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                }}
            >
                {note.selected}
            </p>
            <textarea
                className={`${note?.isnew? 'res-ann-new':''}`}
                style={{
                    width: '97%',
                    height: '100px',
                    fontSize: '12px',
                    resize: 'none',
                    border: 0,
                    textAlign: 'left',
                }}
                value={content}
                onChange={handleChange}
                readOnly={!islocal}
            >
            </textarea>
        </div>
        <div
            style={{
                //@ts-ignore
                visibility: del
            }}
        >
            <i className="fa-solid fa-xmark"
               onClick={handleDel}
            />
        </div>
    </div>
}

export const AnnotationsView = (props: any) => {

    const ann: Ann = props.ann;
    const [force, forceUpdate] = React.useReducer(x => x + 1, 0);

    useEffect(() => {
        ann.on((event: ViewEvent) => {
            if (event.name === 'invalidation') {
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
            Notes
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
                                    isnew: true,
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
        request('resAnnAdd', [
            this.path,
            note
        ]).then(() => {
            note.isnew = undefined;
            this.notes.push(note);
            this.callbacks.forEach((callback) => callback({
                name: 'invalidation'
            }));
        });
    }

    delAnnotation(id: string) {
        const idx = this.notes.findIndex(n => n.id === id);
        if (idx !== -1) {
            this.notes.splice(idx, 1);
            this.callbacks.forEach((callback) => callback({
                name: 'invalidation'
            }));
        }
    }

    private hideTooltip() {
        this.tooltip.hide();
    }

    private showTooltip(ann: Note, x: number, y: number) {
        // get mouse position
        this.tooltip.show(x, y, ann);
    }

}

