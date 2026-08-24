import DOMPurify from 'dompurify';
import { marked } from 'marked';
import React from 'react';

const STYLE_ID = 'dsh-notes-markdown/css';
const API_PREFIX = '/notes-markdown/api';
const AUTOSAVE_MS = 700;

marked.setOptions({ gfm: true, breaks: false });

const CSS = `
.dmn-root{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#171717);font-family:var(--ds-font-family,system-ui,sans-serif)}
.dmn-toolbar{height:44px;flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:0 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.22));background:var(--dsw-alias-bg-layer-1,#fff)}
.dmn-title{font-size:13px;font-weight:650;white-space:nowrap}.dmn-spacer{flex:1}.dmn-status{font-size:11px;color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap}
.dmn-btn{appearance:none;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.28));border-radius:7px;background:transparent;color:inherit;min-height:28px;padding:3px 9px;font:12px/18px inherit;cursor:pointer;white-space:nowrap}.dmn-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.09))}.dmn-btn:focus-visible,.dmn-input:focus-visible,.dmn-editor:focus-visible{outline:2px solid var(--dsw-alias-button-primary-fill,#246bfd);outline-offset:1px}.dmn-root .dmn-btn.dmn-btn-primary,.dmn-root .dmn-btn.dmn-btn-primary:hover,.dmn-root .dmn-btn.dmn-btn-primary:active{border-color:var(--dsw-alias-button-primary-fill,#246bfd);background:var(--dsw-alias-button-primary-fill,#246bfd);color:var(--dsw-alias-button-primary-label,#fff)}.dmn-root .dmn-btn.dmn-btn-primary:hover{opacity:.86}.dmn-root .dmn-btn.dmn-btn-primary:active{opacity:.72}.dmn-btn-danger{color:var(--dsw-alias-state-error-primary,#d33)}.dmn-btn[disabled]{opacity:.45;cursor:not-allowed}
.dmn-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(150px,28%) minmax(0,1fr)}.dmn-list-pane{min-width:0;display:flex;flex-direction:column;border-right:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.025))}.dmn-search-wrap{padding:8px}.dmn-input{box-sizing:border-box;width:100%;height:30px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:7px;background:var(--dsw-alias-bg-base,#fff);color:inherit;padding:4px 8px;font:12px/20px inherit}.dmn-list{flex:1;min-height:0;overflow:auto;padding:0 6px 8px}.dmn-list-item{width:100%;display:block;border:0;border-radius:7px;background:transparent;color:inherit;text-align:left;padding:8px;cursor:pointer}.dmn-list-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}.dmn-list-item[aria-current='true']{background:var(--dsw-alias-interactive-bg-active,rgba(36,107,253,.12));color:var(--dsw-alias-button-primary-fill,#246bfd)}.dmn-list-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:560}.dmn-list-meta{display:block;margin-top:2px;font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}
.dmn-main{min-width:0;min-height:0;display:flex;flex-direction:column}.dmn-note-bar{height:40px;flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:0 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.16))}.dmn-note-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}.dmn-segment{display:flex;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:7px;overflow:hidden}.dmn-segment button{appearance:none;border:0;border-right:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:transparent;color:var(--dsw-alias-label-secondary,#666);padding:3px 8px;font:11px/20px inherit;cursor:pointer}.dmn-segment button:last-child{border-right:0}.dmn-segment button[aria-pressed='true']{background:var(--dsw-alias-interactive-bg-active,rgba(36,107,253,.12));color:var(--dsw-alias-button-primary-fill,#246bfd)}
.dmn-editor{box-sizing:border-box;flex:1;min-height:0;width:100%;resize:none;border:0;background:var(--dsw-alias-bg-base,#fff);color:inherit;padding:18px;font:13px/1.65 var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);tab-size:2}.dmn-preview{flex:1;min-height:0;overflow:auto;padding:18px 22px;font-size:13px;line-height:1.7}.dmn-preview>*:first-child{margin-top:0}.dmn-preview h1,.dmn-preview h2,.dmn-preview h3{line-height:1.3;margin:1.4em 0 .55em}.dmn-preview h1{font-size:1.65em}.dmn-preview h2{font-size:1.35em;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));padding-bottom:.3em}.dmn-preview h3{font-size:1.15em}.dmn-preview pre{overflow:auto;border-radius:8px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.08));padding:12px}.dmn-preview code{font-family:var(--ds-font-family-code,ui-monospace,monospace)}.dmn-preview blockquote{margin-left:0;border-left:3px solid var(--dsw-alias-button-primary-fill,#246bfd);padding-left:12px;color:var(--dsw-alias-label-secondary,#666)}.dmn-preview table{border-collapse:collapse}.dmn-preview th,.dmn-preview td{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));padding:5px 8px}.dmn-preview img{max-width:100%}.dmn-preview a{color:var(--dsw-alias-link-primary,#246bfd)}
.dmn-empty{flex:1;display:grid;place-items:center;padding:24px;text-align:center;color:var(--dsw-alias-label-tertiary,#888)}.dmn-empty strong{display:block;color:var(--dsw-alias-label-secondary,#666);margin-bottom:7px}.dmn-error{flex:0 0 auto;margin:8px 10px 0;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 35%,transparent);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 8%,transparent);color:var(--dsw-alias-state-error-primary,#d33);padding:7px 9px;font-size:11px}.dmn-loading{opacity:.62;pointer-events:none}
.dmn-modal-backdrop{position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:12px;background:rgba(15,17,21,.24);backdrop-filter:blur(2px)}.dmn-root form.dmn-modal{box-sizing:border-box;width:min(320px,calc(100% - 24px));max-width:320px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.24));border-radius:10px;background:var(--dsw-alias-bg-base,#fff);box-shadow:0 12px 36px rgba(0,0,0,.2);padding:14px}.dmn-root .dmn-modal h3{margin:0 0 12px;font-size:14px;line-height:20px}.dmn-root .dmn-modal p{margin:0 0 10px;color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.5}.dmn-root .dmn-modal label{display:block;margin:0 0 5px;font-size:11px;line-height:16px}.dmn-root .dmn-modal .dmn-input{height:32px;min-height:32px;border-radius:7px;padding:4px 8px;font-size:12px;line-height:22px;outline:none}.dmn-root .dmn-modal .dmn-input:focus,.dmn-root .dmn-modal .dmn-input:focus-visible{border-color:var(--dsw-alias-button-primary-fill,#246bfd);outline:none;box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-button-primary-fill,#246bfd) 16%,transparent)}.dmn-modal-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:12px}.dmn-root .dmn-modal-actions .dmn-btn{min-height:27px;padding:3px 9px}
@media(max-width:520px){.dmn-toolbar{padding:0 7px}.dmn-title{display:none}.dmn-body{grid-template-columns:120px minmax(0,1fr)}.dmn-list-item{padding:7px 5px}.dmn-editor,.dmn-preview{padding:12px}.dmn-note-bar{padding:0 7px}.dmn-note-bar .dmn-btn-label{display:none}}
`;

const COPY = {
  en: {
    title: 'Markdown Notes', new: 'New', search: 'Search notes', edit: 'Edit', preview: 'Preview',
    rename: 'Rename', delete: 'Delete', emptyTitle: 'No Markdown notes yet', emptyBody: 'Create a note to start writing.',
    loading: 'Loading…', saved: 'Saved', saving: 'Saving…', unsaved: 'Unsaved', conflict: 'Save conflict',
    createTitle: 'Create note', renameTitle: 'Rename note', nameLabel: 'Document name', cancel: 'Cancel', create: 'Create',
    confirmRename: 'Rename', deleteTitle: 'Delete note?', deleteBody: 'This permanently deletes the Markdown file.', confirmDelete: 'Delete',
    listError: 'Could not load notes.', readError: 'Could not open the note.', saveError: 'Could not save the note.',
    actionError: 'The operation failed.', justNow: 'just now', open: 'Open note',
  },
  zh: {
    title: 'Markdown 笔记', new: '新建', search: '搜索笔记', edit: '编辑', preview: '预览',
    rename: '重命名', delete: '删除', emptyTitle: '还没有 Markdown 笔记', emptyBody: '新建一篇文档开始记录。',
    loading: '加载中…', saved: '已保存', saving: '保存中…', unsaved: '未保存', conflict: '保存冲突',
    createTitle: '新建笔记', renameTitle: '重命名笔记', nameLabel: '文档名称', cancel: '取消', create: '创建',
    confirmRename: '重命名', deleteTitle: '删除笔记？', deleteBody: '这会永久删除对应的 Markdown 文件。', confirmDelete: '删除',
    listError: '无法加载笔记列表。', readError: '无法打开笔记。', saveError: '无法保存笔记。',
    actionError: '操作失败。', justNow: '刚刚', open: '打开笔记',
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

function formatTime(value, copy) {
  if (!value) return copy.justNow;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return copy.justNow;
  return new Intl.DateTimeFormat(isChinese() ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function Dialog({ type, note, copy, busy, onCancel, onSubmit }) {
  const [value, setValue] = React.useState(type === 'rename' ? note?.title || '' : '');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  const destructive = type === 'delete';
  function submit(event) {
    event.preventDefault();
    onSubmit(value);
  }
  return React.createElement('div', { className: 'dmn-modal-backdrop', onPointerDown: (event) => { if (event.target === event.currentTarget) onCancel(); } },
    React.createElement('form', { className: 'dmn-modal', onSubmit: submit, role: 'dialog', 'aria-modal': 'true' },
      React.createElement('h3', null, destructive ? copy.deleteTitle : type === 'rename' ? copy.renameTitle : copy.createTitle),
      destructive
        ? React.createElement('p', null, `${note?.title || ''} — ${copy.deleteBody}`)
        : React.createElement(React.Fragment, null,
          React.createElement('label', { htmlFor: 'dmn-name', className: 'dmn-list-meta' }, copy.nameLabel),
          React.createElement('input', { id: 'dmn-name', ref: inputRef, className: 'dmn-input', value, maxLength: 120, onChange: (event) => setValue(event.target.value) })),
      React.createElement('div', { className: 'dmn-modal-actions' },
        React.createElement('button', { type: 'button', className: 'dmn-btn', disabled: busy, onClick: onCancel }, copy.cancel),
        React.createElement('button', { type: 'submit', className: `dmn-btn ${destructive ? 'dmn-btn-danger' : 'dmn-btn-primary'}`, disabled: busy || (!destructive && !value.trim()) }, destructive ? copy.confirmDelete : type === 'rename' ? copy.confirmRename : copy.create))));
}

function NotesView({ visible }) {
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
  const noteRef = React.useRef(null);
  const savedContentRef = React.useRef('');
  const timerRef = React.useRef(null);
  const saveQueueRef = React.useRef(Promise.resolve());
  const loadedRef = React.useRef(false);

  React.useEffect(() => { noteRef.current = note; }, [note]);
  React.useEffect(() => { savedContentRef.current = savedContent; }, [savedContent]);

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
    if (noteRef.current?.name === name) return;
    if (!skipFlush && !(await flushCurrent())) return;
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
    } catch (readError) {
      setError(`${copy.readError} ${readError.message}`);
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

  async function submitDialog(value) {
    setDialogBusy(true);
    setError('');
    try {
      if (dialog === 'create') {
        if (!(await flushCurrent())) return;
        const result = await api('create', { name: value });
        setNotes((items) => [{ name: result.note.name, title: result.note.title, size: result.note.size, updatedAt: result.note.updatedAt }, ...items]);
        noteRef.current = result.note;
        savedContentRef.current = result.note.content;
        setNote(result.note);
        setSavedContent(result.note.content);
        setSaveState('saved');
        setMode('edit');
      } else if (dialog === 'rename' && noteRef.current) {
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

  return React.createElement('div', { className: `dmn-root${loading ? ' dmn-loading' : ''}` },
    React.createElement('header', { className: 'dmn-toolbar' },
      React.createElement('span', { className: 'dmn-title' }, copy.title),
      React.createElement('span', { className: 'dmn-status' }, note ? statusText : ''),
      React.createElement('span', { className: 'dmn-spacer' }),
      React.createElement('button', { type: 'button', className: 'dmn-btn dmn-btn-primary', onClick: () => setDialog('create') }, `＋ ${copy.new}`)),
    error ? React.createElement('div', { className: 'dmn-error', role: 'alert' }, error) : null,
    React.createElement('div', { className: 'dmn-body' },
      React.createElement('aside', { className: 'dmn-list-pane' },
        React.createElement('div', { className: 'dmn-search-wrap' }, React.createElement('input', { className: 'dmn-input', value: query, placeholder: copy.search, 'aria-label': copy.search, onChange: (event) => setQuery(event.target.value) })),
        React.createElement('div', { className: 'dmn-list' }, filtered.map((item) => React.createElement('button', {
          key: item.name, type: 'button', className: 'dmn-list-item', 'aria-current': note?.name === item.name ? 'true' : undefined,
          title: `${copy.open}: ${item.title}`, onClick: () => void openNote(item.name),
        }, React.createElement('span', { className: 'dmn-list-title' }, item.title), React.createElement('span', { className: 'dmn-list-meta' }, formatTime(item.updatedAt, copy)))))),
      React.createElement('main', { className: 'dmn-main' }, note
        ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'dmn-note-bar' },
            React.createElement('span', { className: 'dmn-note-name', title: note.name }, note.title),
            React.createElement('span', { className: 'dmn-spacer' }),
            React.createElement('div', { className: 'dmn-segment' },
              React.createElement('button', { type: 'button', 'aria-pressed': mode === 'edit', onClick: () => setMode('edit') }, copy.edit),
              React.createElement('button', { type: 'button', 'aria-pressed': mode === 'preview', onClick: () => setMode('preview') }, copy.preview)),
            React.createElement('button', { type: 'button', className: 'dmn-btn', onClick: () => setDialog('rename') }, React.createElement('span', { className: 'dmn-btn-label' }, copy.rename)),
            React.createElement('button', { type: 'button', className: 'dmn-btn dmn-btn-danger', onClick: () => setDialog('delete') }, React.createElement('span', { className: 'dmn-btn-label' }, copy.delete))),
          mode === 'edit'
            ? React.createElement('textarea', { className: 'dmn-editor', value: note.content, spellCheck: true, onChange: (event) => setNote((current) => ({ ...current, content: event.target.value })) })
            : React.createElement('article', { className: 'dmn-preview', dangerouslySetInnerHTML: previewHtml }))
        : React.createElement('div', { className: 'dmn-empty' }, React.createElement('div', null, React.createElement('strong', null, copy.emptyTitle), React.createElement('span', null, copy.emptyBody))))),
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
        component: ({ visible }) => React.createElement(NotesView, { visible }),
      }));
    },
  });
}

const inject = [];
export { apply, inject };
