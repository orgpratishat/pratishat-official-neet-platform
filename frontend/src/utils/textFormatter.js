// // Utility function to parse formatted text from RichTextEditor
// export const parseFormattedText = (text) => {
//   if (!text) return '';

//   // Convert formatting markers to HTML
//   let formattedText = text
//     // Bold: **text**
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     // Italic: *text*
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     // Underline: __text__
//     .replace(/__(.*?)__/g, '<u>$1</u>')
//     // Subscript: ~text~
//     .replace(/~(.*?)~/g, '<sub>$1</sub>')
//     // Superscript: ^text^
//     .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
//     // Line breaks
//     .replace(/\n/g, '<br>');

//   return formattedText;
// }


// Utility function to parse formatted text from RichTextEditor
export const parseFormattedText = (text) => {
  if (!text) return '';

  // Convert formatting markers to HTML
  let formattedText = text
    // Bold: **text** (non-greedy match)
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* (non-greedy match)
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    // Underline: __text__ (non-greedy match)
    .replace(/__([^_]+?)__/g, '<u>$1</u>')
    // Subscript: ~text~ (non-greedy match)
    .replace(/~([^~]+?)~/g, '<sub>$1</sub>')
    // Superscript: ^text^ (non-greedy match)
    .replace(/\^([^^]+?)\^/g, '<sup>$1</sup>')
    // Line breaks
    .replace(/\n/g, '<br>');

  return formattedText;
};

// Function to strip formatting for plain text (useful for validation)
export const stripFormatting = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\*([^*]+?)\*/g, '$1')
    .replace(/__([^_]+?)__/g, '$1')
    .replace(/~([^~]+?)~/g, '$1')
    .replace(/\^([^^]+?)\^/g, '$1');
};;