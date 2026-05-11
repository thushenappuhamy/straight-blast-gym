// Utility functions to safely work with various data types

export type ContentData = string | string[] | { items?: any[]; description?: string; text?: string; content?: string };

/**
 * Convert any content to an array of strings for rendering
 */
export function contentToArray(content: any): string[] {
  if (!content) return [];
  
  // If it's a string, return as array
  if (typeof content === 'string') {
    return [content];
  }

  // If it's already an array, convert items to strings
  if (Array.isArray(content)) {
    return content.map((item) =>
      typeof item === 'string' ? item : item.name || item.item || String(item)
    );
  }

  // If it's an object with 'items' property
  if (content.items && Array.isArray(content.items)) {
    return content.items.map((item: any) =>
      typeof item === 'string' ? item : item.name || item.item || String(item)
    );
  }

  // If it's an object with string properties
  if (content.description) return [content.description];
  if (content.text) return [content.text];
  if (content.content) return [content.content];

  return [];
}

/**
 * Convert any content to a plain string
 */
export function contentToString(content: any): string {
  const arr = contentToArray(content);
  return arr.join(' • ');
}

/**
 * Check if content is renderable and non-empty
 */
export function isContentRenderable(content: any): boolean {
  if (!content) return false;
  
  if (typeof content === 'string' && content.trim().length > 0) return true;
  if (Array.isArray(content) && content.length > 0) return true;
  
  if (typeof content === 'object') {
    if (content.items && Array.isArray(content.items) && content.items.length > 0)
      return true;
    if (content.description || content.text || content.content) return true;
  }
  
  return false;
}

/**
 * Extract a single line or short text from content
 */
export function contentToSingleLine(content: any): string {
  if (typeof content === 'string') {
    return content.split('\n')[0].substring(0, 100);
  }
  const arr = contentToArray(content);
  return arr[0]?.substring(0, 100) || '';
}
