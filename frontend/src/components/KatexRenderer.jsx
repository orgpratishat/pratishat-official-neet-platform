// components/KatexRenderer.jsx - Simplified version
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const KatexRenderer = ({ text, className = '' }) => {
  const renderWithKaTeX = (content) => {
    if (!content) return null;

    // Split content by LaTeX delimiters and process each segment
    const segments = content.split(/(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\$[^$]+\$)/g);
    
    return segments.map((segment, index) => {
      // Check if this segment is a LaTeX expression
      if (segment.startsWith('\\[') && segment.endsWith('\\]')) {
        // Display mode: \[...\]
        const latexContent = segment.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latexContent, {
                  displayMode: true,
                  throwOnError: false,
                })
              }}
            />
          );
        } catch (error) {
          return <span key={index} style={{ color: 'red' }}>{segment}</span>;
        }
      } else if (segment.startsWith('$$') && segment.endsWith('$$')) {
        // Display mode: $$...$$
        const latexContent = segment.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latexContent, {
                  displayMode: true,
                  throwOnError: false,
                })
              }}
            />
          );
        } catch (error) {
          return <span key={index} style={{ color: 'red' }}>{segment}</span>;
        }
      } else if (segment.startsWith('\\(') && segment.endsWith('\\)')) {
        // Inline mode: \(...\)
        const latexContent = segment.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latexContent, {
                  displayMode: false,
                  throwOnError: false,
                })
              }}
            />
          );
        } catch (error) {
          return <span key={index} style={{ color: 'red' }}>{segment}</span>;
        }
      } else if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2) {
        // Inline mode: $...$
        const latexContent = segment.slice(1, -1);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latexContent, {
                  displayMode: false,
                  throwOnError: false,
                })
              }}
            />
          );
        } catch (error) {
          return <span key={index} style={{ color: 'red' }}>{segment}</span>;
        }
      } else {
        // Regular text
        return <span key={index}>{segment}</span>;
      }
    });
  };

  return <div className={className}>{renderWithKaTeX(text)}</div>;
};

export default KatexRenderer;