/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { useState } from 'react';
// Core viewer
import {
    Worker,
    Viewer,
    Button,
    Position,
    Tooltip,
    PrimaryButton,
    DocumentLoadEvent,
    PageChangeEvent,
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

const workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.js',
    import.meta.url,
).toString();

export type PDFViewerProperties = {
    url: string,
    onload: () => void
}

interface Note {
    id: number;
    content: string;
    highlightAreas: HighlightArea[];
    quote: string;
}

export const PDFView = ({
    url,
    onload,
}: PDFViewerProperties) => {
    const [message, setMessage] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    let noteId = notes.length;
    const noteEles: Map<number, HTMLElement> = new Map();

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

    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        const addNote = () => {
            if (message !== '') {
                const note: Note = {
                    id: ++noteId,
                    content: message,
                    highlightAreas: props.highlightAreas,
                    quote: props.selectedText,
                };
                setNotes(notes.concat([note]));
                props.cancel();
            }
        };

        return (
            <div
                style={{
                    background: '#fff',
                    border: '1px solid rgba(0, 0, 0, .3)',
                    borderRadius: '2px',
                    padding: '8px',
                    position: 'absolute',
                    left: `${props.selectionRegion.left}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    zIndex: 1,
                }}
            >
                <div>
                    <textarea
                        rows={3}
                        style={{
                            border: '1px solid rgba(0, 0, 0, .3)',
                        }}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        marginTop: '8px',
                    }}
                >
                    <div style={{ marginRight: '8px' }}>
                        <PrimaryButton onClick={addNote}>Add</PrimaryButton>
                    </div>
                    <Button onClick={props.cancel}>Cancel</Button>
                </div>
            </div>
        );
    };

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {notes.map((note) => (
                <div key={note.id}>
                    {note.highlightAreas
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, idx) => (
                            <div
                                key={idx}
                                style={({

                                    background: 'yellow',
                                    opacity: 0.4,
                                    ...props.getCssProperties(area, props.rotation),
                                })}
                                onClick={() => console.log(note)}
                                ref={(ref): void => {
                                    noteEles.set(note.id, ref as HTMLElement);
                                }}
                            />
                        ))}
                </div>
            ))}
        </div>
    );

    // Create new plugin instance
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });

    const onDocumentLoad = (ev: DocumentLoadEvent) => {
        console.log(`onDocumentLoad ${ev.doc.numPages}, ${ev.file.name}`);
        onload();
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
                ]}
            />
        </Worker>
    );
};

export class PDFViewer {
    render() {

    }
}
