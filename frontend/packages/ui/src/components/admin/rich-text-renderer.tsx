import sanitizeHtml from "sanitize-html";
import type * as React from "react";
import { cn } from "../../lib";

export interface RichTextRendererProps {
  content?: string | null;
  className?: string;
  emptyFallback?: React.ReactNode;
}

const richTextAllowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "img",
  "figure",
  "figcaption",
  "mark",
  "s",
  "span",
  "sub",
  "sup",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
  "input",
];

const richTextAllowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class", "style", "data-type", "data-checked"],
  a: ["href", "name", "target", "rel"],
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  input: ["type", "checked", "disabled"],
  table: ["style"],
  th: ["colspan", "rowspan", "style"],
  td: ["colspan", "rowspan", "style"],
};

const richTextAllowedStyles: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
    "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
  },
  table: {
    width: [/^\d+(\.\d+)?%$/, /^\d+(\.\d+)?px$/],
  },
  th: {
    width: [/^\d+(\.\d+)?%$/, /^\d+(\.\d+)?px$/],
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
  },
  td: {
    width: [/^\d+(\.\d+)?%$/, /^\d+(\.\d+)?px$/],
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
  },
};

function hasHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function sanitizeRichText(content?: string | null) {
  const source = content?.trim();
  if (!source) return "";

  return sanitizeHtml(hasHtml(source) ? source : plainTextToHtml(source), {
    allowedTags: richTextAllowedTags,
    allowedAttributes: richTextAllowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowedStyles: richTextAllowedStyles,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
      input: sanitizeHtml.simpleTransform("input", { disabled: "disabled" }, true),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true),
    },
  });
}

export function richTextToPlainText(content?: string | null) {
  const clean = sanitizeHtml(content ?? "", {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text) => text.replace(/\s+/g, " "),
  });
  return clean.replace(/\s+/g, " ").trim();
}

export function RichTextRenderer({ content, className, emptyFallback = null }: RichTextRendererProps) {
  const html = sanitizeRichText(content);
  if (!html) return <>{emptyFallback}</>;

  return (
    <div
      className={cn("rich-text-content prose max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
