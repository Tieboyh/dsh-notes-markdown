import DOMPurify from 'dompurify';
import { marked } from 'marked';
import React from 'react';

const STYLE_ID = 'dsh-notes-markdown/css';
const API_PREFIX = '/notes-markdown/api';
const AUTOSAVE_MS = 700;
const LIST_VISIBILITY_KEY = 'dsh-notes-markdown/list-collapsed';

marked.setOptions({ gfm: true, breaks: false });

const CSS = `
.dmn-root{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#171717);font-family:var(--ds-font-family,system-ui,sans-serif)}
.dmn-toolbar{height:44px;flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:0 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.22));background:var(--dsw-alias-bg-layer-1,#fff)}
.dmn-title{min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:650;white-space:nowrap}.dmn-spacer{flex:1}.dmn-status{font-size:11px;color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap}
.dmn-btn{appearance:none;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.28));border-radius:7px;background:transparent;color:inherit;min-height:28px;padding:3px 9px;font:12px/18px inherit;cursor:pointer;white-space:nowrap}.dmn-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.09))}.dmn-btn:focus-visible,.dmn-input:focus-visible{outline:2px solid var(--dsw-alias-button-primary-fill,#246bfd);outline-offset:1px}.dmn-root .dmn-btn.dmn-btn-primary,.dmn-root .dmn-btn.dmn-btn-primary:hover,.dmn-root .dmn-btn.dmn-btn-primary:active{border-color:var(--dsw-alias-button-primary-fill,#246bfd);background:var(--dsw-alias-button-primary-fill,#246bfd);color:var(--dsw-alias-button-primary-label,#fff)}.dmn-root .dmn-btn.dmn-btn-primary:hover{opacity:.86}.dmn-root .dmn-btn.dmn-btn-primary:active{opacity:.72}.dmn-btn-danger{color:var(--dsw-alias-state-error-primary,#d33)}.dmn-btn[disabled]{opacity:.45;cursor:not-allowed}.dmn-sidebar-toggle{width:30px;padding:3px;display:grid;place-items:center}.dmn-sidebar-toggle svg{display:block}
.dmn-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(150px,28%) minmax(0,1fr);transition:grid-template-columns .18s ease}.dmn-body[data-list-collapsed='true']{grid-template-columns:0 minmax(0,1fr)}.dmn-list-pane{min-width:0;overflow:hidden;display:flex;flex-direction:column;border-right:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.025));transition:opacity .14s ease}.dmn-body[data-list-collapsed='true'] .dmn-list-pane{visibility:hidden;opacity:0;pointer-events:none}.dmn-search-wrap{padding:8px}.dmn-input{box-sizing:border-box;width:100%;height:30px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:7px;background:var(--dsw-alias-bg-base,#fff);color:inherit;padding:4px 8px;font:12px/20px inherit}.dmn-list{flex:1;min-height:0;overflow:auto;padding:0 6px 8px}.dmn-list-item{width:100%;display:block;border:0;border-radius:7px;background:transparent;color:inherit;text-align:left;padding:8px;cursor:pointer}.dmn-list-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}.dmn-list-item[aria-current='true'],.dmn-list-item[data-context='true']{background:var(--dsw-alias-interactive-bg-active,rgba(36,107,253,.12));color:var(--dsw-alias-button-primary-fill,#246bfd)}.dmn-list-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:560}.dmn-list-meta{display:block;margin-top:2px;font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}
.dmn-main{min-width:0;min-height:0;display:flex;flex-direction:column}.dmn-note-bar{height:40px;flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:0 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.16))}.dmn-note-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}.dmn-copy-actions{display:flex;align-items:center;gap:3px}.dmn-icon-btn{position:relative;appearance:none;width:28px;height:28px;display:grid;place-items:center;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);padding:0;cursor:pointer}.dmn-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.09));color:var(--dsw-alias-label-primary,#171717)}.dmn-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-button-primary-fill,#246bfd);outline-offset:1px}.dmn-icon-btn[data-copied='true']{color:var(--dsw-alias-state-success-primary,#168a45)}.dmn-icon-btn svg{display:block}.dmn-icon-btn[data-tooltip]::before{content:'';position:absolute;z-index:31;right:8px;top:calc(100% + 2px);border:4px solid transparent;border-bottom-color:rgba(22,24,29,.94);opacity:0;pointer-events:none;transform:translateY(-3px);transition:opacity .12s ease,transform .12s ease}.dmn-icon-btn[data-tooltip]::after{content:attr(data-tooltip);position:absolute;z-index:30;right:0;top:calc(100% + 10px);width:max-content;max-width:220px;border-radius:6px;background:rgba(22,24,29,.94);color:#fff;padding:5px 8px;box-shadow:0 5px 16px rgba(0,0,0,.2);font:11px/16px var(--ds-font-family,system-ui,sans-serif);white-space:nowrap;opacity:0;pointer-events:none;transform:translateY(-3px);transition:opacity .12s ease,transform .12s ease}.dmn-icon-btn[data-tooltip]:hover::before,.dmn-icon-btn[data-tooltip]:hover::after,.dmn-icon-btn[data-tooltip]:focus-visible::before,.dmn-icon-btn[data-tooltip]:focus-visible::after{opacity:1;transform:translateY(0)}.dmn-segment{display:flex;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:7px;overflow:hidden}.dmn-segment button{appearance:none;border:0;border-right:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:transparent;color:var(--dsw-alias-label-secondary,#666);padding:3px 8px;font:11px/20px inherit;cursor:pointer}.dmn-segment button:last-child{border-right:0}.dmn-segment button[aria-pressed='true']{background:var(--dsw-alias-interactive-bg-active,rgba(36,107,253,.12));color:var(--dsw-alias-button-primary-fill,#246bfd)}
.dmn-editor{box-sizing:border-box;flex:1;min-height:0;width:100%;resize:none;border:0;outline:none;background:var(--dsw-alias-bg-base,#fff);color:inherit;padding:18px;font:13px/1.65 var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);tab-size:2}.dmn-editor:focus,.dmn-editor:focus-visible{outline:none}.dmn-preview{flex:1;min-height:0;overflow:auto;padding:18px 22px;font-size:13px;line-height:1.7}.dmn-preview>*:first-child{margin-top:0}.dmn-preview h1,.dmn-preview h2,.dmn-preview h3{line-height:1.3;margin:1.4em 0 .55em}.dmn-preview h1{font-size:1.65em}.dmn-preview h2{font-size:1.35em;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));padding-bottom:.3em}.dmn-preview h3{font-size:1.15em}.dmn-preview pre{overflow:auto;border-radius:8px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.08));padding:12px}.dmn-preview code{font-family:var(--ds-font-family-code,ui-monospace,monospace)}.dmn-preview blockquote{margin-left:0;border-left:3px solid var(--dsw-alias-button-primary-fill,#246bfd);padding-left:12px;color:var(--dsw-alias-label-secondary,#666)}.dmn-preview table{border-collapse:collapse}.dmn-preview th,.dmn-preview td{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));padding:5px 8px}.dmn-preview img{max-width:100%}.dmn-preview a{color:var(--dsw-alias-link-primary,#246bfd)}
.dmn-empty{flex:1;display:grid;place-items:center;padding:24px;text-align:center;color:var(--dsw-alias-label-tertiary,#888)}.dmn-empty strong{display:block;color:var(--dsw-alias-label-secondary,#666);margin-bottom:7px}.dmn-error{flex:0 0 auto;margin:8px 10px 0;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 35%,transparent);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 8%,transparent);color:var(--dsw-alias-state-error-primary,#d33);padding:7px 9px;font-size:11px}.dmn-loading{opacity:.62;pointer-events:none}
.dmn-modal-backdrop{position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:12px;background:rgba(15,17,21,.24);backdrop-filter:blur(2px)}.dmn-root form.dmn-modal{box-sizing:border-box;width:min(320px,calc(100% - 24px));max-width:320px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:10px;background:var(--dsw-alias-bg-base,#fff);box-shadow:0 12px 36px rgba(0,0,0,.2);padding:14px}.dmn-root .dmn-modal h3{margin:0 0 12px;font-size:14px;line-height:20px}.dmn-root .dmn-modal p{margin:0 0 10px;color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.5}.dmn-root .dmn-modal label{display:block;margin:0 0 5px;font-size:11px;line-height:16px}.dmn-root .dmn-modal .dmn-input{height:32px;min-height:32px;border-radius:7px;padding:4px 8px;font-size:12px;line-height:22px;outline:none}.dmn-root .dmn-modal .dmn-input:focus,.dmn-root .dmn-modal .dmn-input:focus-visible{border-color:var(--dsw-alias-button-primary-fill,#246bfd);outline:none;box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-button-primary-fill,#246bfd) 16%,transparent)}.dmn-modal-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:12px}.dmn-root .dmn-modal-actions .dmn-btn{min-height:27px;padding:3px 9px}
.dmn-context-dismiss{position:absolute;inset:0;z-index:14;border:0;background:transparent}.dmn-context-menu{position:absolute;z-index:15;box-sizing:border-box;min-width:128px;padding:4px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.22));border-radius:8px;background:var(--dsw-alias-bg-base,#fff);box-shadow:0 8px 28px rgba(0,0,0,.18)}.dmn-root .dmn-context-item{display:block;width:100%;height:28px;border:0;border-radius:5px;background:transparent;color:inherit;padding:4px 9px;text-align:left;font:12px/20px inherit;cursor:pointer}.dmn-root .dmn-context-item:hover,.dmn-root .dmn-context-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.09));outline:none}.dmn-root .dmn-context-item-danger{color:var(--dsw-alias-state-error-primary,#d33)}
@media(max-width:520px){.dmn-toolbar{padding:0 7px}.dmn-title{display:none}.dmn-body{grid-template-columns:120px minmax(0,1fr)}.dmn-list-item{padding:7px 5px}.dmn-editor,.dmn-preview{padding:12px}.dmn-note-bar{padding:0 7px}.dmn-note-bar .dmn-btn-label{display:none}}
`;

const COPY = {
  en: {
    title: 'Markdown Notes', new: 'New', search: 'Search notes', edit: 'Edit', preview: 'Preview',
    rename: 'Rename', delete: 'Delete', emptyTitle: 'No Markdown notes yet', emptyBody: 'Create a note to start writing.',
    loading: 'Loading…', saved: 'Saved', saving: 'Saving…', unsaved: 'Unsaved', conflict: 'Save conflict',
    renameTitle: 'Rename note', nameLabel: 'Document name', cancel: 'Cancel',
    confirmRename: 'Rename', deleteTitle: 'Delete note?', deleteBody: 'This permanently deletes the Markdown file.', confirmDelete: 'Delete',
    listError: 'Could not load notes.', readError: 'Could not open the note.', saveError: 'Could not save the note.',
    actionError: 'The operation failed.', justNow: 'just now', open: 'Open note', showList: 'Show note list', hideList: 'Hide note list',
    copyContent: 'Copy content', copyPath: 'Copy absolute file path', copied: 'Copied', copyError: 'Could not copy.',
  },
  zh: {
    title: 'Markdown 笔记', new: '新建', search: '搜索笔记', edit: '编辑', preview: '预览',
    rename: '重命名', delete: '删除', emptyTitle: '还没有 Markdown 笔记', emptyBody: '新建一篇文档开始记录。',
    loading: '加载中…', saved: '已保存', saving: '保存中…', unsaved: '未保存', conflict: '保存冲突',
    renameTitle: '重命名笔记', nameLabel: '文档名称', cancel: '取消',
    confirmRename: '重命名', deleteTitle: '删除笔记？', deleteBody: '这会永久删除对应的 Markdown 文件。', confirmDelete: '删除',
    listError: '无法加载笔记列表。', readError: '无法打开笔记。', saveError: '无法保存笔记。',
    actionError: '操作失败。', justNow: '刚刚', open: '打开笔记', showList: '展开笔记列表', hideList: '收起笔记列表',
    copyContent: '复制内容', copyPath: '复制文件绝对路径', copied: '已复制', copyError: '无法复制。',
  },
};

function isChinese() {
  const value = document.documentElement.lang || navigator.language || '';
  return value.toLowerCase().startsWith('zh');
}

function useCopy() {
  const [language, setLanguage] = React.useState(() => (isChinese() ? 'zh' : 'en'));
  React.useEffect(() => {
    const observer = new MutationObserver(() => setLanguage(isChinese() ? 'zh' : 'en'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);
  return COPY[language];
}

async function api(method, args = {}) {
  const response = await fetch(`${API_PREFIX}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    const error = new Error(result?.error?.message || `HTTP ${response.status}`);
    error.code = result?.error?.code || 'request_failed';
    throw error;
  }
  return result;
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function NotesIcon({ size = 16 }) {
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  },
  React.createElement('path', { d: 'M3.5 2.25h7.25a1.75 1.75 0 0 1 1.75 1.75v9.25H5.25A1.75 1.75 0 0 1 3.5 11.5V2.25Z' }),
  React.createElement('path', { d: 'M5.25 13.25A1.75 1.75 0 0 1 5.25 9.75h7.25M6.25 5h3.5M6.25 7.25h2.5' }));
}

function SidebarIcon({ collapsed, size = 16 }) {
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  },
  React.createElement('rect', { x: 2.25, y: 2.5, width: 11.5, height: 11, rx: 1.75 }),
  React.createElement('path', { d: 'M6 2.5v11' }),
  React.createElement('path', { d: collapsed ? 'm8.5 6 2 2-2 2' : 'm10.5 6-2 2 2 2' }));
}

function CopyIcon({ kind, copied, size = 16 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  };
  if (copied) return React.createElement('svg', props, React.createElement('path', { d: 'm3.25 8.25 3 3 6.5-6.5' }));
  if (kind === 'path') return React.createElement('svg', props,
    React.createElement('path', { d: 'M6.25 9.75 9.75 6.25M5.1 11.9l-1 .1a2.6 2.6 0 0 1 0-5.2l2.15.2M10.9 4.1l1-.1a2.6 2.6 0 0 1 0 5.2l-2.15-.2' }));
  return React.createElement('svg', props,
    React.createElement('rect', { x: 5.25, y: 5.25, width: 7.5, height: 7.5, rx: 1.5 }),
    React.createElement('path', { d: 'M10.75 5.25V4.5A1.5 1.5 0 0 0 9.25 3h-4.5A1.75 1.75 0 0 0 3 4.75v4.5a1.5 1.5 0 0 0 1.5 1.5h.75' }));
}

function formatTime(value, copy) {
  if (!value) return copy.justNow;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return copy.justNow;
  return new Intl.DateTimeFormat(isChinese() ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function workspaceNameOf(cwd) {
  if (typeof cwd !== 'string') return 'note';
  const segments = cwd.replace(/[\\/]+$/, '').split(/[\\/]/);
  return segments.at(-1)?.trim() || 'note';
}

function Dialog({ type, note, copy, busy, onCancel, onSubmit }) {
  const [value, setValue] = React.useState(note?.title || '');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  const destructive = type === 'delete';
  function submit(event) {
    event.preventDefault();
    onSubmit(value);
  }
  return React.createElement('div', { className: 'dmn-modal-backdrop', onPointerDown: (event) => { if (event.target === event.currentTarget) onCancel(); } },
    React.createElement('form', { className: 'dmn-modal', onSubmit: submit, role: 'dialog', 'aria-modal': 'true' },
      React.createElement('h3', null, destructive ? copy.deleteTitle : copy.renameTitle),
      destructive
        ? React.createElement('p', null, `${note?.title || ''} — ${copy.deleteBody}`)
        : React.createElement(React.Fragment, null,
          React.createElement('label', { htmlFor: 'dmn-name', className: 'dmn-list-meta' }, copy.nameLabel),
          React.createElement('input', { id: 'dmn-name', ref: inputRef, className: 'dmn-input', value, maxLength: 120, onChange: (event) => setValue(event.target.value) })),
      React.createElement('div', { className: 'dmn-modal-actions' },
        React.createElement('button', { type: 'button', className: 'dmn-btn', disabled: busy, onClick: onCancel }, copy.cancel),
        React.createElement('button', { type: 'submit', className: `dmn-btn ${destructive ? 'dmn-btn-danger' : 'dmn-btn-primary'}`, disabled: busy || (!destructive && !value.trim()) }, destructive ? copy.confirmDelete : copy.confirmRename))));
}

function NotesView({ visible, workspaceName }) {
  const copy = useCopy();
  const [notes, setNotes] = React.useState([]);
  const [note, setNote] = React.useState(null);
  const [savedContent, setSavedContent] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [mode, setMode] = React.useState('edit');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [saveState, setSaveState] = React.useState('saved');
  const [dialog, setDialog] = React.useState(null);
  const [dialogBusy, setDialogBusy] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [listCollapsed, setListCollapsed] = React.useState(() => localStorage.getItem(LIST_VISIBILITY_KEY) !== 'false');
  const [copiedKind, setCopiedKind] = React.useState(null);
  const noteRef = React.useRef(null);
  const savedContentRef = React.useRef('');
  const timerRef = React.useRef(null);
  const saveQueueRef = React.useRef(Promise.resolve());
  const loadedRef = React.useRef(false);
  const contextMenuRef = React.useRef(null);
  const copiedTimerRef = React.useRef(null);

  React.useEffect(() => { noteRef.current = note; }, [note]);
  React.useEffect(() => { savedContentRef.current = savedContent; }, [savedContent]);
  React.useEffect(() => { localStorage.setItem(LIST_VISIBILITY_KEY, String(listCollapsed)); }, [listCollapsed]);
  React.useEffect(() => () => clearTimeout(copiedTimerRef.current), []);
  React.useEffect(() => {
    if (!contextMenu) return undefined;
    requestAnimationFrame(() => contextMenuRef.current?.querySelector('button')?.focus());
    const closeOnEscape = (event) => { if (event.key === 'Escape') setContextMenu(null); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [contextMenu]);

  const updateListItem = React.useCallback((updated) => {
    setNotes((items) => items.map((item) => item.name === updated.name
      ? { ...item, title: updated.title, size: updated.size, updatedAt: updated.updatedAt }
      : item));
  }, []);

  const queueSave = React.useCallback((snapshot) => {
    const task = saveQueueRef.current.catch(() => {}).then(async () => {
      const latest = noteRef.current;
      if (!latest || latest.name !== snapshot.name) return null;
      if (latest.content === savedContentRef.current) return latest;
      setSaveState('saving');
      try {
        const result = await api('save', {
          name: latest.name,
          content: latest.content,
          revision: latest.revision,
        });
        const persistedContent = latest.content;
        const persisted = { ...latest, revision: result.note.revision, size: result.note.size, updatedAt: result.note.updatedAt };
        noteRef.current = persisted;
        setNote((current) => current?.name === result.note.name ? { ...current, revision: result.note.revision, size: result.note.size, updatedAt: result.note.updatedAt } : current);
        if (noteRef.current?.name === result.note.name && noteRef.current.content === persistedContent) {
          savedContentRef.current = persistedContent;
          setSavedContent(persistedContent);
          setSaveState('saved');
        }
        updateListItem(result.note);
        return result.note;
      } catch (saveError) {
        setSaveState(saveError.code === 'conflict' ? 'conflict' : 'error');
        setError(`${copy.saveError} ${saveError.message}`);
        throw saveError;
      }
    });
    saveQueueRef.current = task;
    return task;
  }, [copy.saveError, updateListItem]);

  const flushCurrent = React.useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const current = noteRef.current;
    if (!current || current.content === savedContentRef.current) return true;
    try {
      await queueSave(current);
      return true;
    } catch {
      return false;
    }
  }, [queueSave]);

  React.useEffect(() => {
    if (!note || note.content === savedContent) return undefined;
    setSaveState('unsaved');
    timerRef.current = setTimeout(() => { void queueSave(note); }, AUTOSAVE_MS);
    return () => clearTimeout(timerRef.current);
  }, [note?.name, note?.content, note?.revision, savedContent, queueSave]);

  const openNote = React.useCallback(async (name, { skipFlush = false } = {}) => {
    if (noteRef.current?.name === name) return true;
    if (!skipFlush && !(await flushCurrent())) return false;
    setLoading(true);
    setError('');
    try {
      const result = await api('read', { name });
      noteRef.current = result.note;
      savedContentRef.current = result.note.content;
      setNote(result.note);
      setSavedContent(result.note.content);
      setSaveState('saved');
      setMode('edit');
      return true;
    } catch (readError) {
      setError(`${copy.readError} ${readError.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [copy.readError, flushCurrent]);

  const loadNotes = React.useCallback(async ({ selectFirst = true } = {}) => {
    setLoading(true);
    setError('');
    try {
      const result = await api('list');
      setNotes(result.notes);
      if (selectFirst && !noteRef.current && result.notes.length > 0) await openNote(result.notes[0].name, { skipFlush: true });
    } catch (listError) {
      setError(`${copy.listError} ${listError.message}`);
    } finally {
      setLoading(false);
    }
  }, [copy.listError, openNote]);

  React.useEffect(() => {
    if (visible === false) return;
    const firstLoad = !loadedRef.current;
    loadedRef.current = true;
    void loadNotes({ selectFirst: firstLoad });
  }, [visible]);

  function placeContextMenu(target, item, clientX, clientY) {
    const root = target.closest('.dmn-root')?.getBoundingClientRect();
    if (!root) return;
    const menuWidth = 128;
    const menuHeight = 64;
    setContextMenu({
      name: item.name,
      x: Math.max(6, Math.min(clientX - root.left, root.width - menuWidth - 6)),
      y: Math.max(6, Math.min(clientY - root.top, root.height - menuHeight - 6)),
    });
  }

  function showContextMenu(event, item) {
    event.preventDefault();
    event.stopPropagation();
    placeContextMenu(event.currentTarget, item, event.clientX, event.clientY);
  }

  function showKeyboardContextMenu(event, item) {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    placeContextMenu(event.currentTarget, item, rect.left + 16, rect.bottom - 4);
  }

  async function runContextAction(action) {
    const target = contextMenu?.name;
    setContextMenu(null);
    if (!target) return;
    if (noteRef.current?.name !== target && !(await openNote(target))) return;
    setDialog(action);
  }

  async function submitDialog(value) {
    setDialogBusy(true);
    setError('');
    try {
      if (dialog === 'rename' && noteRef.current) {
        if (!(await flushCurrent())) return;
        const current = noteRef.current;
        const result = await api('rename', { name: current.name, nextName: value, revision: current.revision });
        setNotes((items) => items.map((item) => item.name === current.name ? { name: result.note.name, title: result.note.title, size: result.note.size, updatedAt: result.note.updatedAt } : item));
        noteRef.current = result.note;
        savedContentRef.current = result.note.content;
        setNote(result.note);
        setSavedContent(result.note.content);
      } else if (dialog === 'delete' && noteRef.current) {
        if (!(await flushCurrent())) return;
        const current = noteRef.current;
        await api('delete', { name: current.name, revision: current.revision });
        const remaining = notes.filter((item) => item.name !== current.name);
        setNotes(remaining);
        noteRef.current = null;
        savedContentRef.current = '';
        setNote(null);
        setSavedContent('');
        if (remaining.length > 0) await openNote(remaining[0].name, { skipFlush: true });
      }
      setDialog(null);
    } catch (actionError) {
      setError(`${copy.actionError} ${actionError.message}`);
    } finally {
      setDialogBusy(false);
    }
  }

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle ? notes.filter((item) => item.title.toLocaleLowerCase().includes(needle)) : notes;
  }, [notes, query]);
  const previewHtml = React.useMemo(() => ({ __html: DOMPurify.sanitize(marked.parse(note?.content || '')) }), [note?.content]);
  const statusText = saveState === 'saving' ? copy.saving : saveState === 'unsaved' ? copy.unsaved : saveState === 'conflict' ? copy.conflict : copy.saved;

  async function createNote() {
    setLoading(true);
    setError('');
    try {
      if (!(await flushCurrent())) return;
      const result = await api('create', { workspaceName });
      setNotes((items) => [{ name: result.note.name, title: result.note.title, size: result.note.size, updatedAt: result.note.updatedAt }, ...items]);
      noteRef.current = result.note;
      savedContentRef.current = result.note.content;
      setNote(result.note);
      setSavedContent(result.note.content);
      setSaveState('saved');
      setMode('edit');
    } catch (createError) {
      setError(`${copy.actionError} ${createError.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function copyNote(kind) {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(kind === 'content' ? note.content : note.path);
      setCopiedKind(kind);
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedKind(null), 1200);
    } catch (copyError) {
      setError(`${copy.copyError} ${copyError.message}`);
    }
  }

  function toggleList() {
    setContextMenu(null);
    setListCollapsed((collapsed) => !collapsed);
  }

  return React.createElement('div', { className: `dmn-root${loading ? ' dmn-loading' : ''}` },
    React.createElement('header', { className: 'dmn-toolbar' },
      React.createElement('span', { className: 'dmn-title', title: note?.name }, note?.title || copy.title),
      React.createElement('span', { className: 'dmn-status' }, note ? statusText : ''),
      React.createElement('span', { className: 'dmn-spacer' }),
      React.createElement('button', {
        type: 'button', className: 'dmn-btn dmn-sidebar-toggle', 'aria-expanded': !listCollapsed,
        'aria-label': listCollapsed ? copy.showList : copy.hideList, title: listCollapsed ? copy.showList : copy.hideList,
        onClick: toggleList,
      }, React.createElement(SidebarIcon, { collapsed: listCollapsed })),
      React.createElement('button', { type: 'button', className: 'dmn-btn dmn-btn-primary', onClick: () => void createNote() }, `＋ ${copy.new}`)),
    error ? React.createElement('div', { className: 'dmn-error', role: 'alert' }, error) : null,
    React.createElement('div', { className: 'dmn-body', 'data-list-collapsed': listCollapsed ? 'true' : undefined },
      React.createElement('aside', { className: 'dmn-list-pane', 'aria-hidden': listCollapsed },
        React.createElement('div', { className: 'dmn-search-wrap' }, React.createElement('input', { className: 'dmn-input', value: query, placeholder: copy.search, 'aria-label': copy.search, onChange: (event) => setQuery(event.target.value) })),
        React.createElement('div', { className: 'dmn-list', onScroll: () => setContextMenu(null) }, filtered.map((item) => React.createElement('button', {
          key: item.name, type: 'button', className: 'dmn-list-item', 'aria-current': note?.name === item.name ? 'true' : undefined,
          'data-context': contextMenu?.name === item.name ? 'true' : undefined,
          title: `${copy.open}: ${item.title}`, onClick: () => void openNote(item.name),
          onContextMenu: (event) => showContextMenu(event, item),
          onKeyDown: (event) => showKeyboardContextMenu(event, item),
        }, React.createElement('span', { className: 'dmn-list-title' }, item.title), React.createElement('span', { className: 'dmn-list-meta' }, formatTime(item.updatedAt, copy)))))),
      React.createElement('main', { className: 'dmn-main' }, note
        ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'dmn-note-bar' },
            React.createElement('span', { className: 'dmn-note-name', title: note.name }, note.title),
            React.createElement('span', { className: 'dmn-spacer' }),
            React.createElement('div', { className: 'dmn-copy-actions' },
              React.createElement('button', {
                type: 'button', className: 'dmn-icon-btn', 'data-copied': copiedKind === 'content' ? 'true' : undefined,
                'aria-label': copiedKind === 'content' ? copy.copied : copy.copyContent,
                'data-tooltip': copiedKind === 'content' ? copy.copied : copy.copyContent,
                onClick: () => void copyNote('content'),
              }, React.createElement(CopyIcon, { kind: 'content', copied: copiedKind === 'content' })),
              React.createElement('button', {
                type: 'button', className: 'dmn-icon-btn', 'data-copied': copiedKind === 'path' ? 'true' : undefined,
                'aria-label': copiedKind === 'path' ? copy.copied : copy.copyPath,
                'data-tooltip': copiedKind === 'path' ? copy.copied : copy.copyPath,
                onClick: () => void copyNote('path'),
              }, React.createElement(CopyIcon, { kind: 'path', copied: copiedKind === 'path' }))),
            React.createElement('div', { className: 'dmn-segment' },
              React.createElement('button', { type: 'button', 'aria-pressed': mode === 'edit', onClick: () => setMode('edit') }, copy.edit),
              React.createElement('button', { type: 'button', 'aria-pressed': mode === 'preview', onClick: () => setMode('preview') }, copy.preview))),
          mode === 'edit'
            ? React.createElement('textarea', { className: 'dmn-editor', value: note.content, spellCheck: true, onChange: (event) => setNote((current) => ({ ...current, content: event.target.value })) })
            : React.createElement('article', { className: 'dmn-preview', dangerouslySetInnerHTML: previewHtml }))
        : React.createElement('div', { className: 'dmn-empty' }, React.createElement('div', null, React.createElement('strong', null, copy.emptyTitle), React.createElement('span', null, copy.emptyBody))))),
    contextMenu ? React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'dmn-context-dismiss', 'aria-hidden': 'true', onPointerDown: () => setContextMenu(null), onContextMenu: (event) => { event.preventDefault(); setContextMenu(null); } }),
      React.createElement('div', { ref: contextMenuRef, className: 'dmn-context-menu', role: 'menu', style: { left: contextMenu.x, top: contextMenu.y } },
        React.createElement('button', { type: 'button', className: 'dmn-context-item', role: 'menuitem', onClick: () => void runContextAction('rename') }, copy.rename),
        React.createElement('button', { type: 'button', className: 'dmn-context-item dmn-context-item-danger', role: 'menuitem', onClick: () => void runContextAction('delete') }, copy.delete))) : null,
    dialog ? React.createElement(Dialog, { type: dialog, note, copy, busy: dialogBusy, onCancel: () => setDialog(null), onSubmit: submitDialog }) : null);
}

function apply(ctx) {
  ctx.effect(() => {
    injectStyles();
    return () => document.getElementById(STYLE_ID)?.remove();
  });
  ctx.plugin({
    inject: ['betterSidebar'],
    apply(sidebarCtx) {
      const betterSidebar = sidebarCtx.betterSidebar;
      ctx.effect(() => betterSidebar.registerTab({
        id: 'dsh-notes-markdown:notes',
        title: () => (isChinese() ? 'Markdown 笔记' : 'Markdown Notes'),
        icon: (size) => React.createElement(NotesIcon, { size }),
        order: 65,
        single: true,
        component: ({ visible, scope }) => React.createElement(NotesView, { visible, workspaceName: workspaceNameOf(scope.cwd) }),
      }));
    },
  });
}

const inject = [];
export { apply, inject };
