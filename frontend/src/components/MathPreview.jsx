// components/MathPreview.jsx
import React from 'react';
import KatexRenderer from './KatexRenderer';

const MathPreview = ({ text, label = "Preview" }) => {
  if (!text) return null;

  return (
    <div className="mt-2 p-3 bg-gray-100 rounded-md">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}:</div>
      <KatexRenderer text={text} className="text-gray-800" />
    </div>
  );
};

export default MathPreview;