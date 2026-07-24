import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import styles from './PdfRenderer.module.css';
export const PdfRenderer = ({ url }) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const renderPdf = async () => {
            try {
                setLoading(true);
                setError(null);
                // Dynamically import pdfjs-dist
                const pdfjsLib = await import('pdfjs-dist');
                // Set worker source from the installed package
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
                // Load the PDF document
                const pdf = await pdfjsLib.getDocument({ url }).promise;
                if (cancelled)
                    return;
                const container = containerRef.current;
                if (!container)
                    return;
                // Clear any previous content
                container.innerHTML = '';
                // Render each page
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    // Calculate scale to fit container width (800px max)
                    const viewport = page.getViewport({ scale: 1 });
                    const scale = Math.min(800 / viewport.width, 1.5);
                    const scaledViewport = page.getViewport({ scale });
                    // Create a canvas for this page
                    const canvas = document.createElement('canvas');
                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;
                    const pageDiv = document.createElement('div');
                    pageDiv.className = styles.page;
                    pageDiv.appendChild(canvas);
                    container.appendChild(pageDiv);
                    // Render the page onto the canvas
                    await page.render({ canvas, viewport: scaledViewport }).promise;
                }
                if (!cancelled)
                    setLoading(false);
            }
            catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to render PDF');
                    setLoading(false);
                }
            }
        };
        renderPdf();
        return () => {
            cancelled = true;
        };
    }, [url]);
    if (error) {
        return _jsxs("div", { className: styles.error, children: ["Error: ", error] });
    }
    return (_jsxs(_Fragment, { children: [loading && _jsx("div", { className: styles.loading, children: "Loading PDF..." }), _jsx("div", { ref: containerRef, className: styles.container })] }));
};
