# dsh-notes-markdown

[English](./README.md) | [简体中文](./README.zh-CN.md)

Fast, file-backed Markdown notes in the DeepSeek Harness sidebar.

Unlike a read-only docs panel, this plugin lets you create, live-edit, inspect the Markdown source, rename, search, copy, and delete documents without leaving DSH. Notes are regular `.md` files stored in `~/.dsh/docs` by default.

## Why this plugin

DSH conversations are where ideas, decisions, implementation details, and follow-up tasks emerge. **dsh-notes-markdown** gives those results a lightweight place to persist beside the conversation instead of leaving them buried in chat history or forcing you to switch to another editor.

> Conversations generate ideas. Notes preserve the outcome.

This plugin is intentionally a focused Markdown workspace, not a complex knowledge base:

- **Write while you chat** — keep the current DSH conversation visible while recording decisions, plans, APIs, and tasks.
- **Keep real files** — every note is a normal local `.md` file that remains available to editors, Git, scripts, and agents.
- **Stay in flow** — one-click creation, autosave, live editing, source access, search, copy, rename, and delete keep document management out of the way.
- **Collaborate through a path** — copy a note's absolute path and give it directly to an agent working in the same environment.

Typical uses include technical designs, API notes, implementation checklists, meeting conclusions, reusable prompts, code snippets, and Mermaid source blocks.

## Preview

<p align="center">
  <img src="./docs/images/markdown-notes-overview.png" alt="Markdown Notes open beside a DSH conversation" width="100%">
</p>
<p align="center"><sub>Keep the conversation visible while writing and previewing a full Markdown document.</sub></p>

### Focused note workflow

<table>
  <tr>
    <td width="72%" valign="top">
      <img src="./docs/images/note-list.png" alt="Searchable and collapsible Markdown note list" width="100%">
      <br><sub>Search, switch notes, collapse the list, and keep the editor focused.</sub>
    </td>
    <td width="28%" valign="top">
      <img src="./docs/images/sidebar-entry.png" alt="Markdown Notes entry in Better Sidebar" width="100%">
      <br><sub>Open Markdown Notes at any time from Better Sidebar.</sub>
    </td>
  </tr>
</table>

### Rich Markdown rendering

<p align="center">
  <img src="./docs/images/markdown-code-preview.png" alt="GFM preview with styled code blocks and per-block copy controls" width="100%">
</p>
<p align="center"><sub>GFM rendering, nested quotes, task lists, language-labelled code cards, and per-block copy controls.</sub></p>

<p align="center">
  <img src="./docs/images/markdown-mermaid-preview.png" alt="Markdown preview with a Mermaid fenced block rendered by a compatible DSH enhancement" width="100%">
</p>
<p align="center"><sub>Mermaid fenced blocks remain enhancement-friendly and can be visualized when a compatible DSH Mermaid renderer is installed.</sub></p>

## Features

- A persistent **Markdown Notes** page in Better Sidebar
- One-click creation using the current workspace name and an automatic number
- Switch between Typora-style **Live edit** and exact **Source** modes
- Open, search, rename, and delete notes; rename and delete live in the note context menu
- Collapsible note list with remembered visibility
- Debounced autosave with visible saving status
- GFM-aware live editing for headings, links, lists, task lists, quotes, tables, and fenced code blocks
- Source mode remains available for exact Markdown control and unsupported extensions
- Copy the current Markdown content or the document's absolute file path
- Revision checks that reject stale writes from another DSH window
- Atomic saves, duplicate-name protection, path traversal protection, and symlink rejection
- Chinese and English UI following the page language
- Responsive layout for narrow and wide sidebars

## Install

Install Better Sidebar first if it is not already installed:

```sh
dsh plugin --profile web add dsh-better-sidebar
```

Then install this plugin:

```sh
dsh plugin --profile web add github:Tieboyh/dsh-notes-markdown
```

The repository includes a prebuilt plugin bundle, so GitHub installation does not require pnpm build approval.

Restart DSH Web after installing, upgrading, or removing a plugin. Open **Markdown Notes** from Better Sidebar's `+` menu.

## Data

Notes are plain Markdown files under:

```text
~/.dsh/docs
```

The directory is created automatically. To use a different directory, set `DSH_NOTES_MARKDOWN_DIR` before starting DSH Web.

The first release intentionally keeps notes in one flat directory. Document names cannot contain `/`, `\\`, hidden-file prefixes, or path traversal segments.

## Save behavior

Edits are saved about 700 ms after typing stops. Before switching or renaming a document, pending edits are flushed first. Every write includes the revision that was originally read; if another window changed the file, the plugin reports a conflict instead of overwriting newer content.

## Development

```sh
npm install
npm run check
npm run build
dsh plugin --profile web add "$PWD"
```

Restart DSH Web after mounting the local checkout.

## License

MIT
