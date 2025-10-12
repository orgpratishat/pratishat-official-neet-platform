import React, { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text..." }) => {
  const editorRef = useRef(null);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);

  // Greek letters and common math symbols
  const symbols = [
    // Greek lowercase
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν',
    'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    // Greek uppercase
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν',
    'Ξ', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
    // Math symbols
    '±', '×', '÷', '=', '≠', '≈', '≡', '≤', '≥', '≪', '≫',
    '∞', '∂', '∇', '∫', '∑', '∏', '√', '∝', '°', '∠', '∥', '⊥',
    // Set theory
    '∀', '∃', '∈', '∉', '⊂', '⊃', '∪', '∩', '∅',
    // Logic
    '→', '↔', '⇒', '⇔', '¬', '∧', '∨',
    // Number sets
    'ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', 'ℏ'
  ];

  const insertSymbol = (symbol) => {
    const editor = editorRef.current;
    if (editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const newValue = value.substring(0, start) + symbol + value.substring(end);
      onChange(newValue);
      
      // Focus and set cursor position after symbol
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
    setShowSymbols(false);
  };

  const applyFormatting = (format) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = value.substring(start, end);

    let newValue, newCursorPos;

    switch (format) {
      case 'bold':
        newValue = value.substring(0, start) + '**' + selectedText + '**' + value.substring(end);
        newCursorPos = end + 4;
        break;
      case 'italic':
        newValue = value.substring(0, start) + '*' + selectedText + '*' + value.substring(end);
        newCursorPos = end + 2;
        break;
      case 'underline':
        newValue = value.substring(0, start) + '__' + selectedText + '__' + value.substring(end);
        newCursorPos = end + 4;
        break;
      case 'subscript':
        newValue = value.substring(0, start) + '~' + selectedText + '~' + value.substring(end);
        newCursorPos = end + 2;
        break;
      case 'superscript':
        newValue = value.substring(0, start) + '^' + selectedText + '^' + value.substring(end);
        newCursorPos = end + 2;
        break;
      default:
        return;
    }

    onChange(newValue);
    
    // Focus and set cursor position
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    setShowFormatting(false);
  };

  const insertList = (type) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const newValue = type === 'bullet' 
      ? value + '\n• '
      : value + '\n1. ';
    
    onChange(newValue);
    
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(newValue.length, newValue.length);
    }, 0);
    setShowFormatting(false);
  };

  // Parse and render formatted text
  const renderFormattedText = (text) => {
    if (!text) return placeholder;
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~(.*?)~/g, '<sub>$1</sub>')
      .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
      .replace(/\n/g, '<br>');
  };

  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => setShowFormatting(!showFormatting)}
            className="toolbar-btn"
            title="Formatting"
          >
            <strong>B</strong>
          </button>
          
          <button
            type="button"
            onClick={() => setShowSymbols(!showSymbols)}
            className="toolbar-btn symbols-btn"
            title="Insert Symbols"
          >
            Σ
          </button>

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="toolbar-btn"
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? "Edit" : "👁"}
          </button>
        </div>

        {/* Formatting Dropdown */}
        {showFormatting && (
          <div className="formatting-dropdown">
            <button type="button" onClick={() => applyFormatting('bold')} className="format-option">
              <strong>B</strong> Bold
            </button>
            <button type="button" onClick={() => applyFormatting('italic')} className="format-option">
              <em>I</em> Italic
            </button>
            <button type="button" onClick={() => applyFormatting('underline')} className="format-option">
              <u>U</u> Underline
            </button>
            <button type="button" onClick={() => applyFormatting('subscript')} className="format-option">
              X<sub>2</sub> Subscript
            </button>
            <button type="button" onClick={() => applyFormatting('superscript')} className="format-option">
              X<sup>2</sup> Superscript
            </button>
            <div className="divider"></div>
            <button type="button" onClick={() => insertList('bullet')} className="format-option">
              • Bullet List
            </button>
            <button type="button" onClick={() => insertList('number')} className="format-option">
              1. Numbered List
            </button>
          </div>
        )}

        {/* Symbols Popup */}
        {showSymbols && (
          <div className="symbols-popup">
            <div className="symbols-grid">
              {symbols.map((symbol, index) => (
                <button
                  key={index}
                  type="button"
                  className="symbol-btn"
                  onClick={() => insertSymbol(symbol)}
                  title={`Insert ${symbol}`}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowSymbols(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="editor-container">
        {isPreview ? (
          <div 
            className="preview-area"
            dangerouslySetInnerHTML={{ __html: renderFormattedText(value) || `<span class="placeholder">${placeholder}</span>` }}
          />
        ) : (
          <textarea
            ref={editorRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="editor-textarea"
            rows={6}
          />
        )}
      </div>

      <style jsx>{`
        .rich-text-editor {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          position: relative;
        }

        .toolbar {
          background: #f9fafb;
          border-bottom: 1px solid #d1d5db;
          padding: 8px;
          display: flex;
          align-items: center;
          position: relative;
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .toolbar-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .symbols-btn {
          font-weight: bold;
          font-size: 16px;
        }

        .formatting-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 150px;
        }

        .format-option {
          display: block;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
        }

        .format-option:hover {
          background: #f3f4f6;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }

        .symbols-popup {
          position: absolute;
          top: 100%;
          left: 50px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .symbols-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          margin-bottom: 12px;
          max-height: 200px;
          overflow-y: auto;
        }

        .symbol-btn {
          padding: 8px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          min-width: 32px;
          height: 32px;
        }

        .symbol-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .close-btn {
          width: 100%;
          padding: 8px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .close-btn:hover {
          background: #4b5563;
        }

        .editor-container {
          position: relative;
        }

        .editor-textarea {
          width: 100%;
          border: none;
          padding: 12px;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
          outline: none;
        }

        .preview-area {
          padding: 12px;
          min-height: 120px;
          line-height: 1.5;
          font-size: 14px;
          border: none;
          background: white;
        }

        .placeholder {
          color: #9ca3af;
        }

        .preview-area :global(strong) {
          font-weight: bold;
        }

        .preview-area :global(em) {
          font-style: italic;
        }

        .preview-area :global(u) {
          text-decoration: underline;
        }

        .preview-area :global(sub) {
          vertical-align: sub;
          font-size: 0.8em;
        }

        .preview-area :global(sup) {
          vertical-align: super;
          font-size: 0.8em;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;