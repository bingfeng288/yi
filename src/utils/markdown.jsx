import { createElement, Fragment } from 'react';

// Parse inline markdown formatting into React elements
function parseInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let match;

    // Bold: **text**
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic: *text*
    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      parts.push(<em key={key++}>{match[1]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code: `text`
    match = remaining.match(/^`(.+?)`/);
    if (match) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-200 text-[13px] font-mono">
          {match[1]}
        </code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Link: [text](url)
    match = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (match) {
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer"
           className="text-ink-700 dark:text-ink-200 underline underline-offset-2 hover:text-ink-950 dark:hover:text-ink-50">
          {match[1]}
        </a>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Strikethrough: ~~text~~
    match = remaining.match(/^~~(.+?)~~/);
    if (match) {
      parts.push(<del key={key++} className="text-ink-400">{match[1]}</del>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // No match — consume one character
    // Batch consecutive plain text
    const nextSpecial = remaining.search(/[\*`\[~]/);
    if (nextSpecial <= 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts.length === 1 ? parts[0] : parts;
}

// Render a single line, handling inline code and emphasis
function renderLine(line) {
  return parseInline(line);
}

// Simple markdown to React elements
export function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading: ### text
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = `h${level + 1}`; // h2-h4
      const classes = {
        1: 'text-lg font-bold text-ink-950 dark:text-ink-50 mt-4 mb-2',
        2: 'text-base font-bold text-ink-900 dark:text-ink-100 mt-3 mb-1.5',
        3: 'text-sm font-bold text-ink-800 dark:text-ink-200 mt-2 mb-1',
      };
      elements.push(createElement(Tag, { key: key++, className: classes[level] }, renderLine(headingMatch[2])));
      i++;
      continue;
    }

    // Unordered list: - item or * item
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-2 text-sm text-ink-700 dark:text-ink-300">
          {items.map((item, j) => (
            <li key={j}>{renderLine(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list: 1. item
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1 my-2 text-sm text-ink-700 dark:text-ink-300">
          {items.map((item, j) => (
            <li key={j}>{renderLine(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote: > text
    if (/^>\s*/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s*/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="pl-3 border-l-2 border-ink-300 dark:border-ink-600 my-2 text-sm text-ink-600 dark:text-ink-400 italic">
          {quoteLines.map((ql, j) => <p key={j}>{renderLine(ql)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3}\s|[-*]\s|\d+\.\s|>\s)/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    elements.push(
      <p key={key++} className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed my-1.5">
        {paraLines.map((pl, j) => <Fragment key={j}>{j > 0 && <br />}{renderLine(pl)}</Fragment>)}
      </p>
    );
  }

  return elements;
}
