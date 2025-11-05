/**
 * Generates a widget name from a prompt
 * Extracts key words and creates a concise, readable name
 */
export function generateWidgetName(prompt: string): string {
  if (!prompt.trim()) {
    return 'Untitled Widget';
  }

  // Remove common stop words and clean up
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'];
  
  // Split into words, filter out stop words, and take first meaningful words
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.includes(word))
    .slice(0, 4); // Take first 4 meaningful words

  if (words.length === 0) {
    // Fallback: use first 30 characters of prompt
    return prompt.substring(0, 30).trim() || 'Untitled Widget';
  }

  // Capitalize first letter of each word and join
  const name = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Limit to 40 characters
  return name.length > 40 ? name.substring(0, 37) + '...' : name;
}

