/**
 * Utility for sanitizing and rendering markdown content safely.
 * Addresses vulnerability SBP-002: Persistent XSS risk from untrusted content.
 * Uses `marked` for markdown parsing and an allowlist-based HTML sanitizer.
 */

import { marked } from 'marked';

// Allowlist of permitted HTML tags. Anything not listed is stripped entirely.
// This prevents <object>, <embed>, <svg>, <math>, <video>, <audio>, <base>, etc.
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i',
  'li', 'ol', 'p', 'pre', 'span', 'strong',
  'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
]);

/**
 * Allowlist-based sanitizer that works in all environments including Edge Runtime.
 * Strips any HTML tag not in ALLOWED_TAGS, then removes event handlers and
 * javascript: URLs from the remaining permitted tags.
 */
function simpleSanitize(html: string): string {
  if (!html) return '';

  return html
    .replace(
      /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s(?:[^>'"]*|"[^"]*"|'[^']*')*)?(\/?)?>/g,
      (_match, slash, tagName, attrs, selfClose) => {
        if (!ALLOWED_TAGS.has(tagName.toLowerCase())) return '';
        const safeAttrs = (attrs || '')
          // Strip all event handlers (onclick, onload, onerror, etc.)
          .replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/g, '')
          // Strip javascript: from href/src/action attributes
          .replace(
            /(\s+(?:href|src|action|formaction)\s*=\s*)(["']?)\s*javascript\s*:[^"'>\s]*/gi,
            ''
          );
        return `<${slash}${tagName}${safeAttrs}${selfClose || ''}>`;
      }
    );
}

/**
 * Sanitizes HTML content, removing dangerous elements while preserving safe ones.
 * Works in all environments including Edge Runtime and serverless functions.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return simpleSanitize(html);
}

/**
 * Converts markdown to safe HTML.
 * Parses markdown with `marked`, then sanitizes with the allowlist sanitizer.
 */
export function markdownToSafeHtml(text: string): string {
  if (!text) return '';
  
  // Parse markdown to HTML
  const html = marked.parse(text, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  
  // Sanitize the resulting HTML
  return sanitizeHtml(html);
}
