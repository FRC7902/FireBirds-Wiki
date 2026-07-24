import React from 'react';

interface PdfEmbedProps {
  src: string;
  title?: string;
}

export default function PdfEmbed({src, title}: PdfEmbedProps): React.ReactElement {
  return (
    <iframe
      src={src}
      title={title || 'PDF Document'}
      width="100%"
      height="600px"
      style={{border: 'none'}}
      allowFullScreen
    />
  );
}