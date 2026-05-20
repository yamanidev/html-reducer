import TurndownService from "turndown";

export type OutputFormat = "html" | "markdown" | "text";

let _turndown: TurndownService | null = null;
function getTurndown(): TurndownService {
  if (_turndown) return _turndown;

  _turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  return _turndown;
}

export function toMarkdown(html: string): string {
  if (!html.trim()) return "";

  return getTurndown().turndown(html).trim();
}

// MDN's flow-content list — elements the UA stylesheet renders as block-level.
const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "caption",
  "dd",
  "details",
  "dialog",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

export function toText(html: string): string {
  if (!html.trim()) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body ?? doc.documentElement;

  return walkText(body)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function walkText(node: Node): string {
  let output = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output += child.textContent ?? "";

      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const el = child as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") {
      output += "\n";

      return;
    }
    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) output += "\n";

    output += walkText(el);

    if (isBlock) output += "\n";
  });

  return output;
}

export function formatOutput(html: string, format: OutputFormat): string {
  switch (format) {
    case "html":
      return html;
    case "markdown":
      return toMarkdown(html);
    case "text":
      return toText(html);
  }
}
