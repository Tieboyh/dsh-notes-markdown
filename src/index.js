import { homedir } from 'node:os';
import { join } from 'node:path';
import { NoteError, NotesStore } from './storage.js';

const API_PREFIX = '/notes-markdown/api';
const MAX_BODY_BYTES = 3 * 1024 * 1024;

const name = 'dsh-notes-markdown';
const inject = ['webServer'];

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new NoteError('request_too_large', 'Request body is too large.', 413);
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new NoteError('invalid_json', 'Request body must be valid JSON.');
  }
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(value));
}

function apply(ctx) {
  const webServer = ctx.get('webServer');
  const configuredRoot = process.env.DSH_NOTES_MARKDOWN_DIR?.trim();
  const store = new NotesStore(configuredRoot || join(homedir(), '.dsh', 'docs'));

  const dispatch = {
    list: async () => ({ notes: await store.list() }),
    read: async (body) => ({ note: await store.read(body.name) }),
    create: async (body) => ({ note: await store.create(body.name) }),
    save: async (body) => ({ note: await store.save(body.name, body.content, body.revision) }),
    rename: async (body) => ({ note: await store.rename(body.name, body.nextName, body.revision) }),
    delete: async (body) => ({ deleted: await store.delete(body.name, body.revision) }),
  };

  ctx.effect(() => webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      const url = new URL(req.url, 'http://localhost');
      const method = url.pathname.slice(API_PREFIX.length).replace(/^\/+|\/+$/g, '');
      const operation = Object.prototype.hasOwnProperty.call(dispatch, method) ? dispatch[method] : null;
      if (req.method !== 'POST' || !operation) {
        sendJson(res, 404, { ok: false, error: { code: 'not_found', message: 'Unknown notes operation.' } });
        return;
      }
      try {
        const body = await readJsonBody(req);
        const result = await operation(body);
        sendJson(res, 200, { ok: true, ...result });
      } catch (error) {
        const status = error instanceof NoteError ? error.status : 500;
        const code = error instanceof NoteError ? error.code : 'internal_error';
        const message = error instanceof NoteError ? error.message : 'The notes operation failed.';
        if (!(error instanceof NoteError)) console.error('[dsh-notes-markdown]', error);
        sendJson(res, status, { ok: false, error: { code, message } });
      }
    },
  }));
}

export { API_PREFIX, apply, inject, name, readJsonBody };
