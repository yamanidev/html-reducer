# HTML Reducer

Paste HTML, strip the noise, copy what matters.

## What is it?

HTML Reducer is a browser-based tool for cleaning raw HTML before feeding it to an LLM or a scraper pipeline. Scraped pages are 90%+ boilerplate — scripts, styles, ads, hidden elements, event handlers, layout attributes. This tool strips all of that down to the structure and text that actually matters.

Everything is configurable. Toggle what to remove, decide which attributes to keep, collapse whitespace, remove empty tags. Output updates live as you adjust.

## What it doesn't do

It doesn't fetch URLs. It doesn't send your HTML anywhere — all processing runs locally in the browser. It doesn't store anything.

## Who it's for

Developers who scrape HTML and process it with LLMs or custom parsers. Paste in raw HTML, tweak the options, copy clean output.

## Running it locally

- Install the dependencies:

```bash
pnpm install
```

- Run the development server:

```bash
pnpm dev
```
