import { describe, expect, test } from "bun:test";
import type { GenerateRequest, GenerateResult, Provider, StreamEvent } from "@k2b/nessi/ai";
import { createMemoryRateLimiter } from "../src/plugins/rate-limit";
import config from "./fixture-config";
import { createFibelApp, defaultPlugins } from "../src";
import {
  agentSkillsPlugin,
  assistantPlugin,
  mcpPlugin,
  providerFromEnv,
  type AssistantSystemPromptContext,
} from "../src/plugins";
import { renderAssistantMarkdown } from "../src/plugins/markdown";

function docsProvider(
  requests: GenerateRequest[],
  options: { href?: string; searchCollection?: string } = {},
): Provider {
  return {
    name: "test",
    family: "openai-compatible",
    model: "test-model",
    capabilities: {
      streaming: true,
      tools: true,
      images: false,
      thinking: false,
      usage: true,
    },
    async *stream(request): AsyncIterable<StreamEvent> {
      requests.push(request);
      const toolResults = request.messages.filter((message) => message.role === "tool_result");
      if (!toolResults.some((message) => message.name === "search_docs")) {
        yield {
          type: "block_start",
          blockId: "tool-1",
          index: 0,
          kind: "tool_call",
          callId: "call-1",
          name: "search_docs",
        };
        yield {
          type: "block_end",
          blockId: "tool-1",
          index: 0,
          block: {
            type: "tool_call",
            id: "call-1",
            name: "search_docs",
            args: {
              query: "theme",
              ...(options.searchCollection
                ? { collection: options.searchCollection }
                : {}),
            },
          },
        };
        yield { type: "usage", usage: { input: 10, output: 2, total: 12 }, finishReason: "tool_use" };
        return;
      }
      if (!toolResults.some((message) => message.name === "read_doc")) {
        yield {
          type: "block_start",
          blockId: "tool-2",
          index: 0,
          kind: "tool_call",
          callId: "call-2",
          name: "read_doc",
        };
        yield {
          type: "block_end",
          blockId: "tool-2",
          index: 0,
          block: {
            type: "tool_call",
            id: "call-2",
            name: "read_doc",
            args: { href: options.href ?? "/en/theme" },
          },
        };
        yield { type: "usage", usage: { input: 12, output: 3, total: 15 }, finishReason: "tool_use" };
        return;
      }

      yield { type: "block_start", blockId: "text-1", index: 0, kind: "text" };
      yield { type: "block_delta", blockId: "text-1", delta: "Use the **theme**" };
      yield { type: "block_delta", blockId: "text-1", delta: " configuration." };
      yield {
        type: "block_end",
        blockId: "text-1",
        index: 0,
        block: { type: "text", text: "Use the **theme** configuration." },
      };
      yield { type: "usage", usage: { input: 20, output: 5, total: 25 }, finishReason: "stop" };
    },
    async complete(): Promise<GenerateResult> {
      throw new Error("complete() is not used by these tests");
    },
  };
}

function directProvider(requests: GenerateRequest[]): Provider {
  return {
    name: "test",
    family: "openai-compatible",
    model: "test-model",
    capabilities: {
      streaming: true,
      tools: true,
      images: false,
      thinking: false,
      usage: true,
    },
    async *stream(request): AsyncIterable<StreamEvent> {
      requests.push(request);
      yield { type: "block_start", blockId: "text", index: 0, kind: "text" };
      yield { type: "block_delta", blockId: "text", delta: "Done." };
      yield {
        type: "block_end",
        blockId: "text",
        index: 0,
        block: { type: "text", text: "Done." },
      };
      yield {
        type: "usage",
        usage: { input: 1, output: 1, total: 2 },
        finishReason: "stop",
      };
    },
    async complete(): Promise<GenerateResult> {
      throw new Error("complete() is not used by these tests");
    },
  };
}

describe("assistant plugin", () => {
  test("creates native Nessi providers from explicit environment values", () => {
    const provider = providerFromEnv({
      FIBEL_AI_PROVIDER: "openai",
      FIBEL_AI_MODEL: "gpt-test",
      OPENAI_API_KEY: "secret",
    });
    expect(provider.name).toBe("openai");
    expect(provider.model).toBe("gpt-test");

    expect(() => providerFromEnv({ FIBEL_AI_MODEL: "model" })).toThrow("OPENROUTER_API_KEY");
    expect(() =>
      providerFromEnv({
        FIBEL_AI_PROVIDER: "unknown",
        FIBEL_AI_MODEL: "model",
      }),
    ).toThrow("Unsupported FIBEL_AI_PROVIDER");
  });

  test("renders the assistant through the body slot and keeps its routes internal", async () => {
    const app = await createFibelApp({
      ...config,
      plugins: [...defaultPlugins(), assistantPlugin({ provider: docsProvider([]) })],
    });

    const html = await (await app.fetch(new Request("http://localhost/en"))).text();
    expect(html).toContain("data-fibel-assistant");
    expect(html).toContain('data-endpoint="/_fibel/assistant"');
    expect(html).toMatch(/href="\/_fibel\/assistant\.css\?v=[^"]+"/);
    expect(html).toMatch(/src="\/_fibel\/assistant\.js\?v=[^"]+"/);
    expect(html).not.toContain("fibel-assistant__header");
    expect(html).toContain("data-fibel-assistant-welcome");
    expect(html).toMatch(/data-fibel-assistant-input[^>]+autofocus/);
    expect(html).toContain('data-fibel-assistant-send aria-label="Send"');
    expect(html).toContain('data-fibel-assistant-expand');
    expect(html).toContain('<span>Ask Fibel</span>');
    expect(html).toContain('class="fibel-assistant-launcher__icon"');
    expect(html).toContain("data-fibel-footer");
    expect(html).not.toContain('d="M4 5.5A2.5');
    expect(html).not.toContain("Answers from visible pages");

    const internal = await app.fetch(new Request("http://localhost/_fibel/assistant.js"));
    expect(internal.status).toBe(200);
    expect(internal.headers.get("content-type")).toContain("application/javascript");
    expect(internal.headers.get("cache-control")).toBe("no-cache");
    const internalScript = await internal.text();
    expect(internalScript).toContain("fibel-assistant-scroll-locked");
    expect(internalScript).toContain('document.querySelector("[data-fibel-footer]")');
    expect(internalScript).toContain("getBoundingClientRect()");
    expect(internalScript).toContain("requestAnimationFrame");
    expect(internalScript).toContain("focus({ preventScroll: true })");
    expect(internalScript).toContain('link.target = "_blank"');
    expect(internalScript).toContain('link.rel = "noreferrer noopener"');

    const styles = await app.fetch(new Request("http://localhost/_fibel/assistant.css"));
    expect(styles.status).toBe(200);
    const assistantCss = await styles.text();
    expect(assistantCss).toContain(".fibel-assistant-scroll-locked");
    expect(assistantCss).toContain(
      "bottom: calc(1.25rem + var(--fibel-assistant-footer-offset, 0px))",
    );
    expect(assistantCss).toContain(
      "bottom: calc(.85rem + var(--fibel-assistant-footer-offset, 0px))",
    );
    expect(assistantCss).toContain("var(--fibel-focus-ring)");
    expect(assistantCss).toContain(".fibel-table-scroll");
    expect(assistantCss).not.toMatch(/table\s*\{\s*display:\s*block/);
    expect((await app.fetch(new Request("http://localhost/assistant.js"))).status).toBe(404);

    const mounted = await createFibelApp({
      ...config,
      routing: { ...config.routing, basePath: "/docs" },
      plugins: [...defaultPlugins(), assistantPlugin({ provider: docsProvider([]) })],
    });
    const mountedHtml = await (await mounted.fetch(new Request("http://localhost/docs/en"))).text();
    expect(mountedHtml).toContain('data-endpoint="/docs/_fibel/assistant"');
    expect((await mounted.fetch(new Request("http://localhost/docs/_fibel/assistant.js"))).status).toBe(200);
  });

  test("supports an escaped custom launcher label and falls back for blank labels", async () => {
    const custom = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider([]),
          launcherLabel: "Ask Cloud <Beta>",
        }),
      ],
    });
    const customHtml = await (await custom.fetch(new Request("http://localhost/en"))).text();
    expect(customHtml).toContain("<span>Ask Cloud &lt;Beta&gt;</span>");
    expect(customHtml).not.toContain("<span>Ask Cloud <Beta></span>");

    const blank = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider([]),
          launcherLabel: "   ",
        }),
      ],
    });
    const blankHtml = await (await blank.fetch(new Request("http://localhost/en"))).text();
    expect(blankHtml).toContain("<span>Ask Fibel</span>");
  });

  test("streams a bounded tool loop with documentation sources", async () => {
    const requests: GenerateRequest[] = [];
    const usage: Array<{ provider: string; total: number }> = [];
    const app = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider(requests),
          systemPrompt:
            "Prefer configuration examples for {{siteTitle}}.\nSite summary: {{siteDescription}}\nUse {{language}} ({{locale}}).\nCurrent page: {{currentPage}} / {{currentPageTitle}}\nCurrent page summary: {{currentPageDescription}}\nToday is {{weekday}}, {{date}} at {{time}} {{timezone}}.",
          onUsage(event) {
            usage.push({ provider: event.provider, total: event.usage.total });
          },
        }),
      ],
    });

    const response = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ message: "How do themes work?", locale: "en", page: "/en/configuration" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    const events = (await response.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(events).toContainEqual({ type: "delta", text: "Use the **theme**" });
    expect(events).toContainEqual({ type: "delta", text: " configuration." });
    const renderedEvents = events.filter((event) => event.type === "rendered");
    expect(renderedEvents).toEqual([
      { type: "rendered", html: "<p>Use the <strong>theme</strong></p>\n" },
      { type: "rendered", html: "<p>Use the <strong>theme</strong> configuration.</p>\n" },
    ]);
    expect(events.indexOf(renderedEvents[0])).toBeLessThan(
      events.findIndex((event) => event.type === "delta" && event.text === " configuration."),
    );
    expect(events.find((event) => event.type === "sources")?.sources).toEqual([
      expect.objectContaining({ title: "Light and dark mode", href: "/en/theme" }),
    ]);
    expect(events.at(-1)?.type).toBe("done");
    expect(requests).toHaveLength(3);
    expect(requests[0]?.systemPrompt).toContain("Prefer configuration examples for Fibel.");
    expect(requests[0]?.systemPrompt).toContain(
      "Site summary: Publish Markdown collections and host-rendered application pages",
    );
    expect(requests[0]?.systemPrompt).toContain("Use English (en)");
    expect(requests[0]?.systemPrompt).toContain(
      "Current page: /en/configuration / Configuration",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "Current page summary: Configure content folders",
    );
    expect(requests[0]?.systemPrompt).not.toContain("{{");
    expect(requests[0]?.systemPrompt).toMatch(/Today is \w+, \d{4}-\d{2}-\d{2} at \d{2}:\d{2} \S+\./);
    expect(requests[0]?.systemPrompt).toContain("You answer only questions that can be answered from the Fibel documentation.");
    expect(requests[0]?.systemPrompt).toContain(
      "Do not call tools when that context fully answers the question.",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "For instructions, configuration, APIs, code, exact behavior",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "Match explanatory prose to the language used by the user's latest question.",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "The documentation or page language does not determine the answer language.",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "Copy commands, code blocks, configuration, frontmatter, paths, package names, identifiers, option and flag names, literal values, and exact UI labels verbatim",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "Never translate, normalize, improve, or invent them.",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "using English only as fallback, and keep technical source material verbatim.",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "site_description=Publish Markdown collections and host-rendered application pages in one documentation shell",
    );
    expect(requests[0]?.systemPrompt).toContain(
      "current_page_description=Configure content folders",
    );
    expect(requests[0]?.systemPrompt).toContain("fenced code blocks with a language");
    expect(requests[0]?.systemPrompt).toContain("Never imitate those structures with bullet glyphs");
    expect(requests[0]?.systemPrompt).toContain('Write a React Hello World app.');
    expect(requests[0]?.tools?.map((tool) => tool.name)).toEqual(["search_docs", "read_doc"]);
    expect(JSON.stringify(requests[0]?.tools)).toContain("Do not use for unrelated requests");
    expect(JSON.stringify(requests[0]?.tools)).toContain(
      "simple questions already answered",
    );
    expect(JSON.stringify(requests[2]?.messages)).toContain("/en/theme");
    expect(usage).toEqual([{ provider: "test", total: 52 }]);
  });

  test("describes only active agent integrations using the request origin and routing", async () => {
    async function capturePrompt(
      extraPlugins: Parameters<typeof createFibelApp>[0]["plugins"],
      requestUrl = "https://docs.example.com/_fibel/assistant",
      basePath = "",
      assistantFirst = false,
      origin = new URL(requestUrl).origin,
    ) {
      const requests: GenerateRequest[] = [];
      const assistant = assistantPlugin({ provider: directProvider(requests) });
      const app = await createFibelApp({
        ...config,
        siteUrl: origin,
        routing: { ...config.routing, basePath },
        plugins: assistantFirst
          ? [...defaultPlugins(), assistant, ...(extraPlugins ?? [])]
          : [...defaultPlugins(), ...(extraPlugins ?? []), assistant],
      });
      const response = await app.fetch(
        new Request(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: origin,
          },
          body: JSON.stringify({
            message: "How can I connect a coding agent?",
            locale: "en",
            page: `${basePath}/en`,
          }),
        }),
      );
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('"type":"done"');
      return requests[0]?.systemPrompt ?? "";
    }

    const none = await capturePrompt([]);
    expect(none).toContain("website_url=https://docs.example.com/");
    expect(none).not.toContain("Trusted agent access:");
    expect(none).not.toContain("agent_skills_install_command");
    expect(none).not.toContain("mcp_endpoint");

    const skills = await capturePrompt([
      agentSkillsPlugin({ directory: "skills" }),
    ]);
    expect(skills).toContain("Trusted agent access:");
    expect(skills).toContain(
      "agent_skills_install_command=bunx skills add https://docs.example.com",
    );
    expect(skills).not.toContain("mcp_endpoint");
    expect(skills).not.toContain("agent_setup_recommendation");

    const mcp = await capturePrompt([mcpPlugin()]);
    expect(mcp).toContain("Trusted agent access:");
    expect(mcp).toContain(
      "mcp_endpoint=https://docs.example.com/_fibel/mcp",
    );
    expect(mcp).toContain(
      "mcp_access=public read-only documentation search and reading without authentication",
    );
    expect(mcp).not.toContain("agent_skills_install_command");
    expect(mcp).not.toContain("agent_setup_recommendation");

    const both = await capturePrompt(
      [
        agentSkillsPlugin({ directory: "skills" }),
        mcpPlugin(),
      ],
      "http://fibel.internal/docs/_fibel/assistant",
      "/docs",
      true,
      "https://docs.example.com",
    );
    expect(both).toContain(
      "agent_skills_install_command=bunx skills add https://docs.example.com",
    );
    expect(both).toContain(
      "mcp_endpoint=https://docs.example.com/docs/_fibel/mcp",
    );
    expect(both).toContain("website_url=https://docs.example.com/docs");
    expect(both).not.toContain("website_url=http://fibel.internal");
    expect(both).toContain(
      "agent_setup_recommendation=Install the skill for compact workflow guidance and connect MCP for exact current documentation.",
    );
  });

  test("builds operator guidance from a synchronous request context", async () => {
    const requests: GenerateRequest[] = [];
    let received: AssistantSystemPromptContext | undefined;
    const app = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider(requests),
          systemPrompt(context) {
            received = context;
            return `Guide ${context.language} readers on ${context.currentPage} for ${context.siteTitle}.`;
          },
        }),
      ],
    });

    const response = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ message: "How do themes work?", locale: "en", page: "/en/configuration" }),
      }),
    );
    await response.text();

    expect(response.status).toBe(200);
    expect(received).toEqual(
      expect.objectContaining({
        siteTitle: "Fibel",
        siteDescription: expect.stringContaining("Publish Markdown collections and host-rendered application pages"),
        locale: "en",
        language: "English",
        currentPage: "/en/configuration",
        currentPageTitle: "Configuration",
        currentPageDescription: expect.stringContaining("Configure content folders"),
      }),
    );
    expect(received?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(received?.time).toMatch(/^\d{2}:\d{2}$/);
    expect(received?.weekday).toBeTruthy();
    expect(received?.timezone).toBeTruthy();
    expect(requests[0]?.systemPrompt).toContain("Guide English readers on /en/configuration for Fibel.");
  });

  test("uses the current collection as assistant search context", async () => {
    const requests: GenerateRequest[] = [];
    const app = await createFibelApp({
      ...config,
      content: undefined,
      collections: [
        {
          id: "docs",
          label: "Docs",
          description: "Fibel guides.",
          content: "docs",
        },
        {
          id: "ui",
          label: "UI",
          description: "Fibel component reference.",
          content: "docs",
        },
      ],
      defaultCollection: "docs",
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider(requests, { href: "/en/ui/theme" }),
          systemPrompt:
            "Collection: {{currentCollectionLabel}} ({{currentCollection}}) — {{currentCollectionDescription}}",
        }),
      ],
    });

    const response = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          message: "How do themes work?",
          locale: "en",
          page: "/en/ui/configuration",
        }),
      }),
    );
    expect(response.status).toBe(200);
    await response.text();

    expect(requests[0]?.systemPrompt).toContain(
      "Collection: UI (ui) — Fibel component reference.",
    );
    expect(requests[0]?.systemPrompt).toContain("current_collection=ui");
    expect(requests[0]?.systemPrompt).toContain(
      'Search the current "UI" collection first.',
    );
    expect(JSON.stringify(requests[1]?.messages)).toContain('"collection":"ui"');
    expect(JSON.stringify(requests[1]?.messages)).not.toContain("/en/docs/theme");
    expect(JSON.stringify(requests[2]?.messages)).toContain("/en/ui/theme");
    expect(requests[0]?.tools?.[0]?.description).toContain('pass "all"');
  });

  test("renders compact assistant Markdown without trusting model HTML or unsafe links", () => {
    const html = renderAssistantMarkdown(
      "# Small\n\nUse **bold** and [docs](/en), not [unsafe](javascript:alert(1)).\n\n| Name | Value |\n| --- | --- |\n| Theme | Dark |\n\n<script>alert(1)</script>",
    );

    expect(html).toContain("<h1>Small</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('<a href="/en" target="_blank" rel="noreferrer noopener">docs</a>');
    expect(html).toContain('<div class="fibel-table-scroll"><table>');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  test.each(["/docs/en/hosting?mode=backup#scaling", "./backups", "#scaling", "https://example.com/docs", "mailto:docs@example.com"])("opens assistant link %s in a new tab", (href) => {
    expect(renderAssistantMarkdown(`[Docs](${href})`)).toContain(
      `<a href="${href}" target="_blank" rel="noreferrer noopener">Docs</a>`,
    );
  });

  test.each([true, false])("uses the current website instead of a configured example URL (Origin header: %s)", async (withOrigin) => {
    const requests: GenerateRequest[] = [];
    const app = await createFibelApp({
      ...config,
      siteUrl: "https://rsql.example",
      plugins: [...defaultPlugins(), assistantPlugin({ provider: directProvider(requests) })],
    });
    const response = await app.fetch(new Request("https://rsql.k2b.dev/_fibel/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(withOrigin ? { Origin: "https://rsql.k2b.dev" } : {}),
      },
      body: JSON.stringify({ message: "What is this?", locale: "en", page: "/en" }),
    }));
    expect(response.status).toBe(200);
    await response.text();
    expect(requests[0]?.systemPrompt).toContain("website_url=https://rsql.k2b.dev/");
    expect(requests[0]?.systemPrompt).not.toContain("https://rsql.example");
    expect(requests[0]?.systemPrompt).toContain("copy the exact root-relative href");
  });

  test("renders an icon-only code toolbar and highlights shell and SQL fences", () => {
    const html = renderAssistantMarkdown(
      "```sql\nSELECT id FROM users WHERE email = $1;\n```\n\n```sh\nif [ $USER ]; then echo \"ok\"; fi\n```",
    );

    expect(html).toContain('<span class="code-language">sql</span>');
    expect(html).toContain('<span class="code-language">sh</span>');
    expect(html).toContain('class="code-copy-icon"');
    expect(html).not.toContain("code-copy-label");
    expect(html).toContain('<span class="hl-keyword">SELECT</span>');
    expect(html).toContain('<span class="hl-parameter">$1</span>');
    expect(html).toContain('<span class="hl-variable">$USER</span>');
  });

  test("enforces injected rate limiters before calling the provider", async () => {
    const requests: GenerateRequest[] = [];
    const app = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider(requests),
          rateLimiters: {
            session: createMemoryRateLimiter(1, 60_000),
            global: createMemoryRateLimiter(10, 60_000),
          },
        }),
      ],
    });

    const first = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "Theme?", locale: "en", page: "/en" }),
      }),
    );
    const cookie = first.headers.get("set-cookie")?.split(";")[0] ?? "";
    await first.text();

    const second = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost", Cookie: cookie },
        body: JSON.stringify({ message: "Theme again?", locale: "en", page: "/en" }),
      }),
    );

    expect(second.status).toBe(429);
    expect(second.headers.get("retry-after")).toBeTruthy();
    expect(requests).toHaveLength(3);
  });

  test("rejects cross-origin and oversized messages without a provider call", async () => {
    const requests: GenerateRequest[] = [];
    const app = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider: docsProvider(requests),
          limits: { maxInputChars: 10 },
        }),
      ],
    });

    const crossOrigin = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://example.com" },
        body: JSON.stringify({ message: "Hello", locale: "en", page: "/en" }),
      }),
    );
    expect(crossOrigin.status).toBe(403);

    const oversized = await app.fetch(
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "This message is too long", locale: "en", page: "/en" }),
      }),
    );
    expect(oversized.status).toBe(413);
    expect(requests).toHaveLength(0);
  });

  test("accepts the configured public origin behind a TLS reverse proxy", async () => {
    const requests: GenerateRequest[] = [];
    const app = await createFibelApp({
      ...config,
      plugins: [...defaultPlugins(), assistantPlugin({ provider: docsProvider(requests) })],
    });

    const response = await app.fetch(
      new Request("http://fibel.internal/_fibel/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://fibel.dev" },
        body: JSON.stringify({ message: "How do themes work?", locale: "en", page: "/en/configuration" }),
      }),
    );

    expect(response.status).toBe(200);
    await response.text();
    expect(requests).toHaveLength(3);
  });

  test("allows one active response per session and caps global concurrency", async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const provider: Provider = {
      ...docsProvider([]),
      async *stream() {
        await gate;
        yield { type: "block_start", blockId: "text", index: 0, kind: "text" };
        yield { type: "block_delta", blockId: "text", delta: "Done" };
        yield { type: "block_end", blockId: "text", index: 0, block: { type: "text", text: "Done" } };
        yield { type: "usage", usage: { input: 1, output: 1, total: 2 }, finishReason: "stop" };
      },
    };
    const app = await createFibelApp({
      ...config,
      plugins: [
        ...defaultPlugins(),
        assistantPlugin({
          provider,
          limits: { maxConcurrent: 1 },
        }),
      ],
    });
    const request = (cookie?: string) =>
      new Request("http://localhost/_fibel/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify({ message: "Wait", locale: "en", page: "/en" }),
      });

    const first = await app.fetch(request());
    const cookie = first.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();
    expect((await app.fetch(request(cookie))).status).toBe(409);
    expect((await app.fetch(request())).status).toBe(503);

    release?.();
    expect(await first.text()).toContain('"text":"Done"');
  });
});
