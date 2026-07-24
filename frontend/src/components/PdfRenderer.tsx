import React, { useEffect, useRef, useState } from 'react';
import styles from './PdfRenderer.module.css';

interface PdfRendererProps {
  url: string;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker source from the installed package
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        // Normalize the PDF URL so it works both in dev and in production.
        // For GitHub Pages, the asset must be available as a static file under the site root.
        const normalizedUrl = url.startsWith('http')
          ? url
          : url.startsWith('/media/')
            ? url.replace('/media/', '/assets/')
            : url;
        const resolvedUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `${window.location.origin}${normalizedUrl}`;

        // Load the PDF document
        const pdf = await pdfjsLib.getDocument({ url: resolvedUrl }).promise;

        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

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

        if (!cancelled) setLoading(false);
      } catch (err) {
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
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <>
      {loading && <div className={styles.loading}>Loading PDF...</div>}
      <div ref={containerRef} className={styles.container} />
    </>
  );
};
