
import {useState} from 'react';
// Core viewer
import { Worker, Viewer, Button, Position, Tooltip, PrimaryButton  } from '@react-pdf-viewer/core';

// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, Trigger, HighlightArea, RenderHighlightTargetProps, RenderHighlightsProps, RenderHighlightContentProps, MessageIcon } from '@react-pdf-viewer/highlight';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

export type PDFViewerProperties = {
    url: string
}

const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
    <div
        style={{
            background: '#eee',
            display: 'flex',
            position: 'absolute',
            left: `${props.selectionRegion.left}%`,
            top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
            transform: 'translate(0, 8px)',
        }}
    >
        <Tooltip
            position={Position.TopCenter}
            target={
                <Button onClick={props.toggle}>
                    <MessageIcon />
                </Button>
            }
            content={() => <div style={{ width: '100px' }}>Add a note</div>}
            offset={{ left: 10, top: 30 }}
        />
    </div>
);

const renderHighlightContent = (props: RenderHighlightContentProps) => {
    const [message, setMessage] = useState('');

    const addNote = () => {
        // We will implement it later
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

const areas: any[] = [
        {
            pageIndex: 0,
            height: 1.55401,
            width: 28.1674,
            left: 27.5399,
            top: 15.0772,
        }
];

const renderHighlights = (props: RenderHighlightsProps) => (
    <div>
        {areas
            .filter((area) => area.pageIndex === props.pageIndex)
            .map((area, idx) => (
                <div
                    key={idx}
                    className="highlight-area"
                    style={Object.assign(
                        {},
                        {
                            background: 'yellow',
                            opacity: 0.3,
                        },
                        props.getCssProperties(area, props.rotation)
                    )}
                />
            ))}
    </div>
);

export const PDFViewer = ({
    url
}: PDFViewerProperties) => {

// Create new plugin instance
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const highlightPluginInstance = highlightPlugin({
        // renderHighlightTarget,
        // renderHighlightContent,
        // renderHighlights,
        trigger: Trigger.None,
    });

    const onDocumentLoad = () => {

    }

    return <Worker workerUrl={workerSrc}>
        <Viewer
            fileUrl={url}
            onDocumentLoad={onDocumentLoad}
            plugins={[
                // Register plugins
                defaultLayoutPluginInstance,
                highlightPluginInstance
            ]}
        />
    </Worker>
}

