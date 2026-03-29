export type ReducerConfiguration = {
  // Strip elements
  stripScripts: boolean;
  stripStyles: boolean;
  stripComments: boolean;
  stripMetaLinkHead: boolean;
  stripHidden: boolean;
  stripSvg: boolean;
  stripNoscript: boolean;
  stripEventHandlers: boolean;
  // Strip attributes
  stripAllAttrs: boolean;
  stripIdClass: boolean;
  stripHref: boolean;
  stripSrcAlt: boolean;
  // Structure
  collapseWhitespace: boolean;
  removeEmptyTags: boolean;
};

export const DEFAULT_CONFIG: ReducerConfiguration = {
  stripScripts: true,
  stripStyles: true,
  stripComments: true,
  stripMetaLinkHead: true,
  stripHidden: true,
  stripSvg: true,
  stripNoscript: true,
  stripEventHandlers: true,
  stripAllAttrs: false,
  stripIdClass: false,
  stripHref: false,
  stripSrcAlt: false,
  collapseWhitespace: true,
  removeEmptyTags: true,
};

export function reduceHtml(html: string, config: ReducerConfiguration): string {
  if (!html.trim()) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (config.stripScripts) removeBySelector(doc, "script");
  if (config.stripStyles) removeBySelector(doc, "style");
  if (config.stripMetaLinkHead) removeBySelector(doc, "head, meta, link");
  if (config.stripSvg) removeBySelector(doc, "svg");
  if (config.stripNoscript) removeBySelector(doc, "noscript");
  if (config.stripHidden) removeHidden(doc);
  if (config.stripComments) removeComments(doc);
  if (config.stripEventHandlers) removeEventHandlers(doc);

  if (config.stripAllAttrs) {
    doc.querySelectorAll("*").forEach((el) => {
      while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name);
    });
  } else {
    doc.querySelectorAll("*").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      Array.from(el.attributes)
        .filter((attribute) => {
          if (attribute.name.startsWith("on")) return false; // handled by removeEventHandlers

          if (attribute.name === "id" || attribute.name === "class") return config.stripIdClass;

          if (attribute.name === "href" && tag === "a") return config.stripHref;

          if ((attribute.name === "src" || attribute.name === "alt") && tag === "img")
            return config.stripSrcAlt;

          return true;
        })
        .forEach((a) => el.removeAttribute(a.name));
    });
  }

  if (config.removeEmptyTags) removeEmptyElements(doc);

  const body = doc.body ?? doc.documentElement;
  let result = body.innerHTML;

  if (config.collapseWhitespace) result = collapseWhitespace(result);

  return result.trim();
}

function removeBySelector(doc: Document, selector: string): void {
  doc.querySelectorAll(selector).forEach((el) => el.remove());
}

function removeHidden(doc: Document): void {
  // Only detectable via inline styles and the `hidden` attribute —
  // computed styles are not available on a disconnected DOMParser document.
  doc.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.hasAttribute("hidden")) {
      el.remove();
      return;
    }
    const style = el.getAttribute("style") ?? "";
    if (/display\s*:\s*none/i.test(style) || /visibility\s*:\s*hidden/i.test(style)) {
      el.remove();
    }
  });
}

function removeComments(doc: Document): void {
  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_COMMENT);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => n.parentNode?.removeChild(n));
}

function removeEventHandlers(doc: Document): void {
  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes)
      .filter((a) => a.name.startsWith("on"))
      .forEach((a) => el.removeAttribute(a.name));
  });
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function removeEmptyElements(doc: Document): void {
  // Reverse document order so children are processed before parents,
  // enabling cascading removal (empty parent after child removed) in one pass.
  Array.from(doc.querySelectorAll("*"))
    .reverse()
    .forEach((el) => {
      if (VOID_ELEMENTS.has(el.tagName.toLowerCase())) return;
      if ((el.textContent?.trim() ?? "") === "" && el.children.length === 0) {
        el.remove();
      }
    });
}

function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
