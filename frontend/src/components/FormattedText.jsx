// import React from 'react';
// import { parseFormattedText } from '../utils/textFormatter';

// // Component to safely render formatted text
// const FormattedText = ({ text, className = "" }) => {
//   const formattedHtml = parseFormattedText(text);
  
//   return (
//     <div 
//       className={`formatted-text ${className}`}
//       dangerouslySetInnerHTML={{ __html: formattedHtml || '&nbsp;' }}
//     />
//   );
// };

// export default FormattedText;





import React from 'react';
import { parseFormattedText } from '../utils/textFormatter';

// Component to safely render formatted text
const FormattedText = ({ text, className = "" }) => {
  const formattedHtml = parseFormattedText(text);
  
  return (
    <div 
      className={`formatted-text ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml || '&nbsp;' }}
    />
  );
};

export default FormattedText;