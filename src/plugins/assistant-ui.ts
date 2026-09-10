export const assistantStyles = String.raw`
.fibel-assistant-scroll-locked {
  overflow: hidden;
}
.fibel-assistant-scroll-locked body {
  position: fixed;
  top: var(--fibel-assistant-scroll-offset);
  right: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
}
.fibel-assistant-launcher {
  position: fixed;
  right: 1.25rem;
  bottom: calc(1.25rem + var(--fibel-assistant-footer-offset, 0px));
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  min-height: 2.75rem;
  padding: 0 .95rem;
  border: 1px solid color-mix(in srgb, var(--fibel-accent) 55%, transparent);
  border-radius: 999px;
  background: #fff;
  color: var(--fibel-accent-foreground-strong);
  box-shadow: 0 12px 35px rgb(24 24 27 / .15);
  font: 600 .875rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.fibel-assistant-launcher:hover { border-color: var(--fibel-accent); background: var(--fibel-accent-surface); }
.fibel-assistant-launcher:focus-visible,
.fibel-assistant button:focus-visible,
.fibel-assistant a:focus-visible { outline: 2px solid var(--fibel-focus-ring); outline-offset: 2px; }
.fibel-assistant-launcher svg { width: 1.1rem; height: 1.1rem; }
.fibel-assistant {
  position: fixed;
  right: 1.25rem;
  bottom: 4.75rem;
  z-index: 65;
  display: grid;
  grid-template-rows: minmax(12rem, 1fr) auto;
  width: min(26rem, calc(100vw - 2rem));
  height: min(39rem, calc(100vh - 7rem));
  overflow: hidden;
  border: 1px solid #e4e4e7;
  border-radius: 1rem;
  background: #fff;
  color: #18181b;
  box-shadow: 0 24px 70px rgb(24 24 27 / .22);
}
.fibel-assistant[hidden] { display: none; }
.fibel-assistant[data-expanded="true"] {
  inset: 1.25rem;
  width: auto;
  height: auto;
}
.fibel-assistant__controls {
  position: absolute;
  top: .65rem;
  right: .65rem;
  z-index: 2;
  display: flex;
  gap: .2rem;
}
.fibel-assistant__control {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / .86);
  color: #a1a1aa;
  cursor: pointer;
}
.fibel-assistant__control:hover { background: #f4f4f5; color: #18181b; }
.fibel-assistant__control svg { width: .95rem; height: .95rem; }
.fibel-assistant__restore-icon { display: none; }
.fibel-assistant[data-expanded="true"] .fibel-assistant__expand-icon { display: none; }
.fibel-assistant[data-expanded="true"] .fibel-assistant__restore-icon { display: inline-grid; }
.fibel-assistant__messages {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  padding: 3.25rem 1rem 1rem;
  scroll-behavior: smooth;
}
.fibel-assistant__welcome {
  max-width: 17rem;
  margin: auto;
  padding: 2rem 1rem;
  color: #a1a1aa;
  text-align: center;
  font-size: .8rem;
  line-height: 1.55;
}
.fibel-assistant__welcome[hidden] { display: none; }
.fibel-assistant__message { display: flex; margin: 0 0 .8rem; }
.fibel-assistant__message[data-role="user"] { justify-content: flex-end; }
.fibel-assistant__bubble {
  max-width: 88%;
  margin: 0;
  padding: .65rem .75rem;
  border-radius: .65rem;
  background: #f4f4f5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: .86rem;
  line-height: 1.55;
}
.fibel-assistant__message[data-role="assistant"] .fibel-assistant__bubble[data-rendered="true"] {
  white-space: normal;
}
.fibel-assistant__bubble[data-rendered="true"] > :first-child { margin-top: 0; }
.fibel-assistant__bubble[data-rendered="true"] > :last-child { margin-bottom: 0; }
.fibel-assistant__bubble[data-rendered="true"] p,
.fibel-assistant__bubble[data-rendered="true"] ul,
.fibel-assistant__bubble[data-rendered="true"] ol,
.fibel-assistant__bubble[data-rendered="true"] blockquote,
.fibel-assistant__bubble[data-rendered="true"] .code-frame,
.fibel-assistant__bubble[data-rendered="true"] table {
  margin: .65rem 0;
}
.fibel-assistant__bubble[data-rendered="true"] h1,
.fibel-assistant__bubble[data-rendered="true"] h2,
.fibel-assistant__bubble[data-rendered="true"] h3,
.fibel-assistant__bubble[data-rendered="true"] h4,
.fibel-assistant__bubble[data-rendered="true"] h5,
.fibel-assistant__bubble[data-rendered="true"] h6 {
  margin: .85rem 0 .35rem;
  font-weight: 650;
  line-height: 1.3;
}
.fibel-assistant__bubble[data-rendered="true"] h1 { font-size: 1.08rem; }
.fibel-assistant__bubble[data-rendered="true"] h2 { font-size: 1rem; }
.fibel-assistant__bubble[data-rendered="true"] h3,
.fibel-assistant__bubble[data-rendered="true"] h4,
.fibel-assistant__bubble[data-rendered="true"] h5,
.fibel-assistant__bubble[data-rendered="true"] h6 { font-size: .92rem; }
.fibel-assistant__bubble[data-rendered="true"] ul,
.fibel-assistant__bubble[data-rendered="true"] ol { padding-left: 1.25rem; }
.fibel-assistant__bubble[data-rendered="true"] li + li { margin-top: .25rem; }
.fibel-assistant__bubble[data-rendered="true"] blockquote {
  border-left: 2px solid var(--fibel-accent);
  padding-left: .7rem;
  color: #52525b;
}
.fibel-assistant__bubble[data-rendered="true"] a {
  color: var(--fibel-accent-foreground);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.fibel-assistant__bubble[data-rendered="true"] code {
  border-radius: .25rem;
  background: rgb(24 24 27 / .08);
  padding: .08rem .28rem;
  font: .82em/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.fibel-assistant__bubble[data-rendered="true"] .code-frame {
  position: relative;
  overflow: hidden;
  border-radius: .55rem;
  background: #18181b;
  color: #f4f4f5;
}
.fibel-assistant__bubble[data-rendered="true"] .code-toolbar {
  position: absolute;
  top: .35rem;
  right: .35rem;
  left: .65rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fibel-assistant__bubble[data-rendered="true"] .code-language {
  color: #a1a1aa;
  font: .65rem/1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.fibel-assistant__bubble[data-rendered="true"] .code-frame pre {
  overflow-x: auto;
  margin: 0;
  padding: 2.35rem .75rem .75rem;
}
.fibel-assistant__bubble[data-rendered="true"] .code-frame code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.fibel-assistant__bubble[data-rendered="true"] .code-copy {
  display: inline-grid;
  width: 1.65rem;
  height: 1.65rem;
  place-items: center;
  border: 0;
  border-radius: .3rem;
  background: rgb(255 255 255 / .09);
  padding: 0;
  color: #a1a1aa;
  cursor: pointer;
}
.fibel-assistant__bubble[data-rendered="true"] .code-copy-icon svg { width: .75rem; height: .75rem; }
.fibel-assistant__bubble[data-rendered="true"] .hl-comment { color: #71717a; }
.fibel-assistant__bubble[data-rendered="true"] .hl-string { color: #6ee7b7; }
.fibel-assistant__bubble[data-rendered="true"] .hl-number { color: #fcd34d; }
.fibel-assistant__bubble[data-rendered="true"] .hl-keyword { color: #f6c453; }
.fibel-assistant__bubble[data-rendered="true"] .hl-operator { color: #7dd3fc; }
.fibel-assistant__bubble[data-rendered="true"] .hl-variable,
.fibel-assistant__bubble[data-rendered="true"] .hl-parameter { color: #c4b5fd; }
.fibel-assistant__bubble[data-rendered="true"] .hl-identifier { color: #a5f3fc; }
.fibel-assistant__bubble[data-rendered="true"] .hl-function { color: #bae6fd; }
.fibel-assistant__bubble[data-rendered="true"] .fibel-table-scroll {
  max-width: 100%;
  overflow-x: auto;
}
.fibel-assistant__bubble[data-rendered="true"] table {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
}
.fibel-assistant__bubble[data-rendered="true"] th,
.fibel-assistant__bubble[data-rendered="true"] td {
  border: 1px solid #d4d4d8;
  padding: .3rem .45rem;
  text-align: left;
}
.fibel-assistant__bubble[data-rendered="true"] hr {
  margin: .85rem 0;
  border: 0;
  border-top: 1px solid #d4d4d8;
}
.fibel-assistant__message[data-role="user"] .fibel-assistant__bubble {
  background: #e4e4e7;
  color: #27272a;
}
.fibel-assistant__message[data-pending="true"] .fibel-assistant__bubble:empty::after {
  content: "•••";
  letter-spacing: .12rem;
  color: #a1a1aa;
}
.fibel-assistant__sources { display: flex; flex-wrap: wrap; gap: .35rem; margin: -.2rem 0 .9rem; }
.fibel-assistant__source {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  padding: .28rem .55rem;
  color: var(--fibel-accent-foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: .7rem;
  text-decoration: none;
}
.fibel-assistant__source:hover { border-color: var(--fibel-accent); background: var(--fibel-accent-surface); }
.fibel-assistant__composer { padding: .75rem; background: transparent; }
.fibel-assistant__status { margin: 0 .75rem .4rem; color: #71717a; font-size: .7rem; }
.fibel-assistant__status[hidden] { display: none; }
.fibel-assistant__form {
  display: flex;
  min-height: 3.25rem;
  align-items: flex-end;
  gap: .55rem;
  border: 0;
  border-radius: 1.45rem;
  background: #f4f4f5;
  padding: .38rem .42rem .38rem 1rem;
}
.fibel-assistant textarea {
  min-width: 0;
  min-height: 2.45rem;
  max-height: 8rem;
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  padding: .58rem 0 .48rem;
  font: inherit;
  font-size: .85rem;
  line-height: 1.4;
}
.fibel-assistant__send {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  place-items: center;
  align-self: flex-end;
  border: 0;
  border-radius: 999px;
  padding: 0;
  background: #27272a;
  color: #fff;
  cursor: pointer;
}
.fibel-assistant__send svg { width: 1rem; height: 1rem; }
.fibel-assistant__send:hover { background: #3f3f46; }
.fibel-assistant__send:disabled { background: #e4e4e7; color: #a1a1aa; cursor: default; }
.dark .fibel-assistant-launcher { border-color: color-mix(in srgb, var(--fibel-accent) 42%, transparent); background: #18181b; color: var(--fibel-accent-foreground-strong); }
.dark .fibel-assistant-launcher:hover { background: #27272a; }
.dark .fibel-assistant {
  border-color: rgb(255 255 255 / .11);
  background: #18181b;
  color: #fafafa;
  box-shadow: 0 24px 70px rgb(0 0 0 / .5);
}
.dark .fibel-assistant__welcome,
.dark .fibel-assistant__status { color: #a1a1aa; }
.dark .fibel-assistant__control { background: rgb(24 24 27 / .86); color: #a1a1aa; }
.dark .fibel-assistant__control:hover { background: rgb(255 255 255 / .08); color: #fff; }
.dark .fibel-assistant__bubble { background: #27272a; }
.dark .fibel-assistant__message[data-role="user"] .fibel-assistant__bubble { background: #3f3f46; color: #fafafa; }
.dark .fibel-assistant__bubble[data-rendered="true"] blockquote { color: #d4d4d8; }
.dark .fibel-assistant__bubble[data-rendered="true"] a { color: var(--fibel-accent-foreground); }
.dark .fibel-assistant__bubble[data-rendered="true"] code { background: rgb(255 255 255 / .1); }
.dark .fibel-assistant__bubble[data-rendered="true"] .code-frame code { background: transparent; }
.dark .fibel-assistant__bubble[data-rendered="true"] th,
.dark .fibel-assistant__bubble[data-rendered="true"] td,
.dark .fibel-assistant__bubble[data-rendered="true"] hr { border-color: #52525b; }
.dark .fibel-assistant__source { border-color: rgb(255 255 255 / .13); color: var(--fibel-accent-foreground); }
.dark .fibel-assistant__source:hover { border-color: var(--fibel-accent); background: var(--fibel-accent-surface); }
.dark .fibel-assistant__form { background: #27272a; }
.dark .fibel-assistant textarea { background: transparent; }
.dark .fibel-assistant__send { background: #fafafa; color: #18181b; }
.dark .fibel-assistant__send:hover { background: #e4e4e7; }
.dark .fibel-assistant__send:disabled { background: #3f3f46; color: #71717a; }
@media (max-width: 640px) {
  .fibel-assistant-launcher { right: .85rem; bottom: calc(.85rem + var(--fibel-assistant-footer-offset, 0px)); }
  .fibel-assistant {
    inset: 4.5rem .75rem .75rem;
    width: auto;
    height: auto;
    border-radius: .75rem;
  }
  .fibel-assistant__expand { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fibel-assistant__messages { scroll-behavior: auto; }
}
`;

export const assistantClientScript = String.raw`
const root = document.querySelector("[data-fibel-assistant]");
if (root) {
  const launcher = document.querySelector("[data-fibel-assistant-open]");
  const closeButton = root.querySelector("[data-fibel-assistant-close]");
  const expandButton = root.querySelector("[data-fibel-assistant-expand]");
  const messages = root.querySelector("[data-fibel-assistant-messages]");
  const form = root.querySelector("[data-fibel-assistant-form]");
  const input = root.querySelector("[data-fibel-assistant-input]");
  const send = root.querySelector("[data-fibel-assistant-send]");
  const status = root.querySelector("[data-fibel-assistant-status]");
  const welcome = root.querySelector("[data-fibel-assistant-welcome]");
  const footer = document.querySelector("[data-fibel-footer]");
  let activeController;
  let lockedScrollY;
  let launcherOffsetFrame;

  const labels = {
    ready: root.dataset.ready || "Ready",
    thinking: root.dataset.thinking || "Searching the documentation…",
    error: root.dataset.error || "The assistant could not answer. Please try again.",
    limited: root.dataset.limited || "The usage limit was reached. Please try again later.",
  };

  const focusInput = () => {
    requestAnimationFrame(() => input?.focus({ preventScroll: true }));
  };

  const syncLauncherOffset = () => {
    if (!launcher || launcherOffsetFrame !== undefined) return;
    launcherOffsetFrame = requestAnimationFrame(() => {
      launcherOffsetFrame = undefined;
      const bounds = footer?.getBoundingClientRect();
      const overlap = bounds
        ? Math.max(0, Math.min(window.innerHeight, bounds.bottom) - Math.max(0, bounds.top))
        : 0;
      launcher.style.setProperty("--fibel-assistant-footer-offset", Math.ceil(overlap) + "px");
    });
  };

  const footerResizeObserver =
    footer && typeof ResizeObserver === "function"
      ? new ResizeObserver(syncLauncherOffset)
      : undefined;
  footerResizeObserver?.observe(footer);
  window.addEventListener("scroll", syncLauncherOffset, { passive: true });
  window.addEventListener("resize", syncLauncherOffset);
  syncLauncherOffset();

  const unlockScroll = (restorePosition = true) => {
    if (lockedScrollY === undefined) return;
    const scrollY = lockedScrollY;
    lockedScrollY = undefined;
    document.documentElement.classList.remove("fibel-assistant-scroll-locked");
    document.body.style.removeProperty("--fibel-assistant-scroll-offset");
    if (restorePosition) window.scrollTo(0, scrollY);
  };

  const syncScrollLock = () => {
    const shouldLock = !root.hidden && root.dataset.expanded === "true";
    if (!shouldLock) {
      unlockScroll();
      return;
    }
    if (lockedScrollY !== undefined) return;
    lockedScrollY = window.scrollY;
    document.body.style.setProperty("--fibel-assistant-scroll-offset", "-" + lockedScrollY + "px");
    document.documentElement.classList.add("fibel-assistant-scroll-locked");
  };

  const setOpen = (open) => {
    root.hidden = !open;
    launcher?.setAttribute("aria-expanded", String(open));
    syncScrollLock();
    if (open) focusInput();
    else {
      activeController?.abort();
      launcher?.focus();
    }
  };

  launcher?.addEventListener("click", () => setOpen(true));
  closeButton?.addEventListener("click", () => setOpen(false));
  expandButton?.addEventListener("click", () => {
    const expanded = root.dataset.expanded !== "true";
    root.dataset.expanded = String(expanded);
    expandButton.setAttribute("aria-pressed", String(expanded));
    syncScrollLock();
    focusInput();
    const label = expanded ? expandButton.dataset.restoreLabel : expandButton.dataset.expandLabel;
    if (label) {
      expandButton.setAttribute("aria-label", label);
      expandButton.setAttribute("title", label);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !root.hidden) setOpen(false);
  });
  window.addEventListener("pagehide", () => {
    activeController?.abort();
    footerResizeObserver?.disconnect();
    if (launcherOffsetFrame !== undefined) cancelAnimationFrame(launcherOffsetFrame);
    unlockScroll(false);
  });

  const addMessage = (role, text, pending) => {
    const row = document.createElement("div");
    const bubble = document.createElement("div");
    row.className = "fibel-assistant__message";
    row.dataset.role = role;
    if (pending) row.dataset.pending = "true";
    bubble.className = "fibel-assistant__bubble";
    bubble.textContent = text;
    row.append(bubble);
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
    return { row, bubble };
  };

  const addSources = (sources) => {
    if (!Array.isArray(sources) || sources.length === 0) return;
    const list = document.createElement("div");
    list.className = "fibel-assistant__sources";
    for (const source of sources) {
      if (!source || typeof source.href !== "string") continue;
      const link = document.createElement("a");
      link.className = "fibel-assistant__source";
      link.href = source.href;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = source.title || source.href;
      list.append(link);
    }
    messages.append(list);
  };

  const readLines = async (response, onEvent) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Streaming response unavailable.");
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const part = await reader.read();
      buffer += decoder.decode(part.value || new Uint8Array(), { stream: !part.done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) onEvent(JSON.parse(line));
      }
      if (part.done) break;
    }
    if (buffer.trim()) onEvent(JSON.parse(buffer));
  };

  const submit = async () => {
    const message = input.value.trim();
    if (!message || activeController) return;
    input.value = "";
    input.style.height = "";
    welcome.hidden = true;
    addMessage("user", message, false);
    const assistant = addMessage("assistant", "", true);
    let assistantMarkdown = "";
    send.disabled = true;
    status.hidden = false;
    status.textContent = labels.thinking;
    activeController = new AbortController();

    try {
      const response = await fetch(root.dataset.endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          locale: root.dataset.locale,
          page: root.dataset.page,
        }),
        signal: activeController.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(response.status === 429 ? labels.limited : payload.message || labels.error);
      }

      await readLines(response, (event) => {
        if (event.type === "delta" && typeof event.text === "string") {
          assistantMarkdown += event.text;
          if (assistant.bubble.dataset.rendered !== "true") {
            assistant.bubble.textContent = assistantMarkdown;
          }
          messages.scrollTop = messages.scrollHeight;
        } else if (event.type === "rendered" && typeof event.html === "string") {
          assistant.bubble.innerHTML = event.html;
          assistant.bubble.dataset.rendered = "true";
          messages.scrollTop = messages.scrollHeight;
        } else if (event.type === "sources") {
          addSources(event.sources);
        } else if (event.type === "error") {
          throw new Error(event.message || labels.error);
        }
      });
      if (!assistant.bubble.textContent.trim()) assistant.bubble.textContent = labels.error;
      status.textContent = labels.ready;
      status.hidden = true;
    } catch (error) {
      if (error?.name === "AbortError") {
        assistant.row.remove();
        status.hidden = true;
        return;
      }
      assistant.bubble.textContent = error instanceof Error ? error.message : labels.error;
      status.textContent = labels.error;
      status.hidden = true;
    } finally {
      assistant.row.removeAttribute("data-pending");
      activeController = undefined;
      send.disabled = !input.value.trim();
      if (!root.hidden) focusInput();
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit();
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  });
  input?.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 128) + "px";
    send.disabled = Boolean(activeController) || !input.value.trim();
  });
}
`;
