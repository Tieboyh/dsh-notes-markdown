# dsh-notes-markdown

[English](./README.md) | [简体中文](./README.zh-CN.md)

Editable Markdown notes in the DeepSeek Harness sidebar.

Unlike a read-only docs panel, this plugin lets you create, edit, preview, rename, search, and delete Markdown documents without leaving DSH. Notes are regular `.md` files stored in `~/.dsh/docs` by default.

## Features

- A persistent **Markdown Notes** page in Better Sidebar
- Create, open, edit, rename, search, and delete notes
- Debounced autosave with visible saving status
- Safe Markdown preview with GFM support and sanitized HTML
- Revision checks that reject stale writes from another DSH window
- Atomic saves, duplicate-name protection, path traversal protection, and symlink rejection
- Chinese and English UI following the page language
- Responsive two-pane layout for narrow and wide sidebars

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
