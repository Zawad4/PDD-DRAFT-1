/**
 * Sanitizes user input to prevent XSS, HTML injection, and malicious input.
 * Strips script tags, trims whitespace, and escapes dangerous characters.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char] || char))
    .trim();
}

/**
 * Sanitizes all string values within an object or array.
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      clean[key] = sanitizeInput(val);
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeObject(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

