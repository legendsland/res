// Core viewer
import { Worker, Viewer } from '@react-pdf-viewer/core';

// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

export type PDFViewerProperties = {
    url: string
}

export const PDFViewer2 = ({
    url
}: PDFViewerProperties) => {

// Create new plugin instance
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return <Worker workerUrl={workerSrc}>
        <Viewer
            fileUrl={url}
            plugins={[
                // Register plugins
                defaultLayoutPluginInstance,
            ]}
        />
    </Worker>
}
