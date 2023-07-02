import * as pdfjs from 'pdfjs-dist';
import {useEffect} from 'react';

const workerSrc =  require('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export type PDFViewerProperties = {
    url: string
}

export const PDFViewer = ({
    url
}: PDFViewerProperties) => {

    useEffect(() => {
        console.log(`open ${url}`);
        pdfjs.getDocument(url).promise.then(function (pdf) {
            // Get the first page of the PDF
            pdf.getPage(1).then(function (page) {
                // Set the scale for rendering the page
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                // Prepare the canvas element
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Append the canvas to the PDF container element
                const pdfContainer = document.getElementById('book-container');
                pdfContainer.appendChild(canvas);

                // Render the page on the canvas
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                page.render(renderContext);
            });
        });
    });

    return <></>
}
