import { Marked, type Renderer, type Tokens } from "marked";
import { highlight } from "@k2b/stdlib";
import type { FibelPlugin } from "../types";
import { escapeHtml, slugify } from "../utils";

export function markdownPlugin(): FibelPlugin {
  return {
    name: "markdown",
    setup(context) {
      context.services.renderMarkdown = (markdown) => renderMarkdown(markdown);
    },
  };
}

function renderMarkdown(markdown: string) {
  const marked = new Marked({ gfm: true, breaks: false });
  let skippedFirstH1 = false;

  marked.use({
    renderer: {
      heading(token: Tokens.Heading) {
        const text = token.text;
        const id = slugify(text);
        if (token.depth === 1 && !skippedFirstH1) {
          skippedFirstH1 = true;
          return "";
        }
        if (token.depth >= 2 && token.depth <= 4) {
          return `<h${token.depth} id="${id}" class="heading-anchor group">${text}<button class="heading-copy" type="button" data-copy-heading="${escapeHtml(id)}" aria-label="Copy link to ${escapeHtml(stripHtml(text))}"><span class="heading-copy-icon">${linkIcon()}</span></button></h${token.depth}>`;
        }
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>`;
      },
      code(token: Tokens.Code) {
        return renderCode(token);
      },
      codespan(token: Tokens.Codespan) {
        return `<code>${escapeHtml(token.text)}</code>`;
      },
      table(token: Tokens.Table) {
        return renderTable.call(this, token);
      },
    },
  });

  return String(marked.parse(markdown));
}

export function renderAssistantMarkdown(markdown: string) {
  const marked = new Marked({ gfm: true, breaks: true });

  marked.use({
    renderer: {
      heading(token: Tokens.Heading) {
        return `<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
      },
      code(token: Tokens.Code) {
        return renderCode(token);
      },
      codespan(token: Tokens.Codespan) {
        return `<code>${escapeHtml(token.text)}</code>`;
      },
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      link(token: Tokens.Link) {
        const label = this.parser.parseInline(token.tokens);
        const href = safeAssistantHref(token.href);
        if (!href) return label;
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
        return `<a href="${escapeHtml(href)}"${title} target="_blank" rel="noreferrer noopener">${label}</a>`;
      },
      image(token: Tokens.Image) {
        return escapeHtml(token.text);
      },
      table(token: Tokens.Table) {
        return renderTable.call(this, token);
      },
    },
  });

  return String(marked.parse(markdown));
}

function normalizeLanguage(language: string | undefined) {
  return language?.trim().toLowerCase().split(/\s+/)[0] ?? "";
}

function renderCode(token: Tokens.Code) {
  const language = normalizeLanguage(token.lang);
  const label = language || "txt";
  const highlighted = highlightCode(token.text, language);
  const copyPayload = encodeCopyPayload(token.text);
  return `<div class="code-frame" data-language="${escapeHtml(label)}"><div class="code-toolbar"><span class="code-language">${escapeHtml(label)}</span><button class="code-copy" type="button" data-copy-code="${copyPayload}" aria-label="Copy ${escapeHtml(label)} code"><span class="code-copy-icon" aria-hidden="true">${copyIcon()}</span></button></div><pre><code>${highlighted}</code></pre></div>`;
}

function renderTable(this: Renderer, token: Tokens.Table) {
  const header = this.tablerow({
    text: token.header.map((cell) => this.tablecell(cell)).join(""),
  });
  const rows = token.rows
    .map((row) =>
      this.tablerow({
        text: row.map((cell) => this.tablecell(cell)).join(""),
      }),
    )
    .join("");
  const body = rows ? `<tbody>${rows}</tbody>` : "";
  return `<div class="fibel-table-scroll"><table><thead>${header}</thead>${body}</table></div>\n`;
}

function safeAssistantHref(href: string) {
  const value = href.trim();
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (value && !value.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return undefined;
}

function highlightCode(code: string, language: string) {
  if (["bash", "sh", "shell", "zsh"].includes(language)) return highlight.presets.shell(code);
  if (["sql", "pgsql", "postgres", "postgresql", "mysql", "mariadb", "sqlite"].includes(language)) {
    return highlight.presets.sql(code);
  }
  if (
    ["js", "jsx", "javascript", "ts", "tsx", "typescript", "json", "css", "html", "xml"].includes(language)
  ) {
    return highlight.presets.code(code);
  }
  return highlight.escape(code);
}

function encodeCopyPayload(code: string) {
  return Buffer.from(code, "utf8").toString("base64");
}

function copyIcon() {
  return '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
}

function linkIcon() {
  return '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93"/><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07"/></svg>';
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}
