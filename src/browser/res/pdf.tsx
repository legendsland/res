/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { useMemo, useRef, useState } from 'react';
// Core viewer
import {
    createStore,
    Plugin,
    Worker,
    Viewer,
    Button,
    Position,
    Tooltip,
    DocumentLoadEvent,
    PageChangeEvent,
    PluginFunctions,
} from '@react-pdf-viewer/core';

// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {
    highlightPlugin,
    HighlightArea,
    RenderHighlightTargetProps,
    RenderHighlightsProps,
    RenderHighlightContentProps,
    MessageIcon,
} from '@react-pdf-viewer/highlight';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { PDFAnn } from './pdf-annotation';
import { Note } from '../../common/db';

const workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.js',
    import.meta.url,
).toString();

export type PDFViewerProperties = {
    url: string,
    onload: () => PDFAnn
}

interface PDFNote {
    id: string;
    note: string;
    highlightAreas: HighlightArea[];
    selected: string;
}

interface StoreProps {
    jumpToPage?(pageIndex: number): void;
}

interface JumpToPagePlugin extends Plugin {
    jumpToPage(pageIndex: number): void;
}

const jumpToPagePlugin = (): JumpToPagePlugin => {
    const store = useMemo(() => createStore<StoreProps>(), []);

    return {
        install: (pluginFunctions: PluginFunctions) => {
            store.update('jumpToPage', pluginFunctions.jumpToPage);
        },
        jumpToPage: (pageIndex: number) => {
            const fn = store.get('jumpToPage');
            if (fn) {
                fn(pageIndex);
            }
        },
    };
};

export const PDFView = ({
    url,
    onload,
}: PDFViewerProperties) => {
    const jumpToPagePluginInstance = jumpToPagePlugin();
    const { jumpToPage } = jumpToPagePluginInstance;

    const [notes, setNotes] = useState<PDFNote[]>([]);
    const noteEles: Map<string, HTMLElement> = new Map();

    const ann = useRef<PDFAnn>(null);

    // select and tooltip
    const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
        <div
            style={{
                background: '#eee',
                display: 'flex',
                position: 'absolute',
                left: `${props.selectionRegion.left}%`,
                top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                transform: 'translate(0, 8px)',
                zIndex: 1,
            }}
        >
            <Tooltip
                position={Position.TopCenter}
                target={(
                    <Button onClick={props.toggle}>
                        <MessageIcon />
                    </Button>
                )}
                content={() => <div style={{ width: '100px' }}>Add a note</div>}
                offset={{ left: 0, top: -8 }}
            />
        </div>
    );

    // quote and note component
    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        console.log('renderHighlightContent');

        setTimeout(() => {
            const note: PDFNote = {
                id: `${Date.now()}`,
                note: '',
                highlightAreas: props.highlightAreas,
                selected: props.selectedText,
            };
            setNotes(notes.concat([note]));
            props.cancel();
            console.log(note);

            // add to annotation
            ann?.current.newAnnotation({
                id: note.id,
                selected: note.selected,
                selector: {
                    path: '',
                },
                pos: {
                    top: note.highlightAreas[0].top,
                    left: note.highlightAreas[0].left,
                    width: note.highlightAreas[0].width,
                    height: note.highlightAreas[0].height,
                    pageIndex: note.highlightAreas[0].pageIndex,
                },
                note: note.note,
                tags: [],
                doc: 'pdf',
            });
        });

        return (
            <></>
            // <div
            //     style={{
            //         background: '#fff',
            //         border: '1px solid rgba(0, 0, 0, .3)',
            //         borderRadius: '2px',
            //         padding: '8px',
            //         position: 'absolute',
            //         left: `${props.selectionRegion.left}%`,
            //         top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
            //         zIndex: 1,
            //     }}
            // >
            //     <div>
            //         <textarea
            //             rows={3}
            //             style={{
            //                 border: '1px solid rgba(0, 0, 0, .3)',
            //             }}
            //             onChange={(e) => setMessage(e.target.value)}
            //         />
            //     </div>
            //     <div
            //         style={{
            //             display: 'flex',
            //             marginTop: '8px',
            //         }}
            //     >
            //         <div style={{ marginRight: '8px' }}>
            //             <PrimaryButton onClick={addNote}>Add</PrimaryButton>
            //         </div>
            //         <Button onClick={props.cancel}>Cancel</Button>
            //     </div>
            // </div>
        );
    };

    // highlighted pdf text
    const renderHighlights = (props: RenderHighlightsProps) => {
        console.log('renderHighlights');
        return (
            <div>
                {notes.map((note) => (
                    <div key={note.id}>
                        {note.highlightAreas
                            .filter((area) => area.pageIndex === props.pageIndex)
                            .map((area, idx) => (
                                <div
                                    key={note.id}
                                    id={`res-pdf-highlight-${note.id}`}
                                    style={({

                                        background: 'yellow',
                                        opacity: 0.4,
                                        zIndex: 10,
                                        ...props.getCssProperties(area, props.rotation),
                                    })}
                                    onClick={() => ann.current.show(note.id)}
                                    ref={(ref): void => {
                                        noteEles.set(note.id, ref as HTMLElement);
                                    }}
                                />
                            ))}
                    </div>
                ))}
            </div>
        );
    };

    // Create new plugin instance
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });

    const onDocumentLoad = (ev: DocumentLoadEvent) => {
        console.log(`onDocumentLoad ${ev.doc.numPages}, ${ev.file.name}`);
        const ann_ = onload();
        ann_.on(onNotesEvent);
        ann.current = ann_;
        const notes = ann.current.notes.map((n) => ({
            id: n.id,
            selected: n.selected,
            note: n.note,
            highlightAreas: [{
                top: n.pos.top,
                left: n.pos.left,
                width: n.pos.width,
                height: n.pos.height,
                pageIndex: n.pos.pageIndex,
            }],
        }));
        setNotes(notes);
    };

    const onNotesEvent = (event: { name: string, data: any }) => {
        console.log(`onNotesEvent, ${event.name}`);
        if (event.name === 'invalidation') {
            const notes = ann.current.notes.map((n) => ({
                id: n.id,
                selected: n.selected,
                note: n.note,
                highlightAreas: [{
                    top: n.pos.top,
                    left: n.pos.left,
                    width: n.pos.width,
                    height: n.pos.height,
                    pageIndex: n.pos.pageIndex,
                }],
            }));
            setNotes(notes);
        } else if (event.name === 'jump') {
            const note: Note = event.data;
            console.log(`jump to ${note?.pos?.pageIndex}`);
            jumpToPage(note?.pos?.pageIndex);
        }
    };

    const onPageChange = (ev: PageChangeEvent) => {
        console.log(`onPageChange ${ev.currentPage}`);
    };

    return (
        <Worker workerUrl={workerSrc}>
            <Viewer
                fileUrl={url}
                onDocumentLoad={onDocumentLoad}
                onPageChange={onPageChange}
                plugins={[
                // Register plugins
                    defaultLayoutPluginInstance,
                    highlightPluginInstance,
                    jumpToPagePluginInstance,
                ]}
            />
        </Worker>
    );
};
