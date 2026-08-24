import { createHash, randomUUID } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { access, link, lstat, mkdir, readFile, readdir, rename as renameFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const MAX_NAME_LENGTH = 120;

class NoteError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'NoteError';
    this.code = code;
    this.status = status;
  }
}

function revisionOf(content) {
  return createHash('sha256').update(content).digest('hex');
}

function normalizeName(value) {
  if (typeof value !== 'string') throw new NoteError('invalid_name', 'Document name is required.');
  let name = value.trim().replace(/\s+/g, ' ');
  if (name.toLowerCase().endsWith('.md')) name = name.slice(0, -3).trim();
  if (!name || name === '.' || name === '..') throw new NoteError('invalid_name', 'Document name is required.');
  if (name.length > MAX_NAME_LENGTH) throw new NoteError('invalid_name', `Document name must be at most ${MAX_NAME_LENGTH} characters.`);
  if (/[\\/\u0000]/.test(name)) throw new NoteError('invalid_name', 'Document name cannot contain path separators.');
  if (/^[.]/.test(name)) throw new NoteError('invalid_name', 'Hidden document names are not allowed.');
  return `${name}.md`;
}

function titleOf(name) {
  return basename(name, extname(name));
}

class NotesStore {
  constructor(root, { maxBytes = DEFAULT_MAX_BYTES } = {}) {
    this.root = resolve(root);
    this.maxBytes = maxBytes;
    this.writeQueue = Promise.resolve();
  }

  async initialize() {
    await mkdir(this.root, { recursive: true });
  }

  pathFor(value) {
    const name = normalizeName(value);
    const target = resolve(this.root, name);
    if (dirname(target) !== this.root) throw new NoteError('invalid_name', 'Document path is outside the notes directory.');
    return { name, target };
  }

  validateContent(content) {
    if (typeof content !== 'string') throw new NoteError('invalid_content', 'Document content must be text.');
    if (Buffer.byteLength(content, 'utf8') > this.maxBytes) {
      throw new NoteError('too_large', `Document content exceeds ${this.maxBytes} bytes.`, 413);
    }
  }

  mutate(operation) {
    const task = this.writeQueue.then(operation, operation);
    this.writeQueue = task.catch(() => {});
    return task;
  }

  async list() {
    await this.initialize();
    const entries = await readdir(this.root, { withFileTypes: true });
    const notes = await Promise.all(entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.') && entry.name.toLowerCase().endsWith('.md'))
      .map(async (entry) => {
        const info = await stat(join(this.root, entry.name));
        return {
          name: entry.name,
          title: titleOf(entry.name),
          size: info.size,
          updatedAt: info.mtime.toISOString(),
        };
      }));
    return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title));
  }

  async read(value) {
    await this.initialize();
    const { name, target } = this.pathFor(value);
    let info;
    try {
      info = await lstat(target);
    } catch (error) {
      if (error?.code === 'ENOENT') throw new NoteError('not_found', 'Document not found.', 404);
      throw error;
    }
    if (!info.isFile()) throw new NoteError('invalid_file', 'Document must be a regular Markdown file.');
    if (info.size > this.maxBytes) throw new NoteError('too_large', `Document content exceeds ${this.maxBytes} bytes.`, 413);
    let content;
    try {
      content = await readFile(target, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') throw new NoteError('not_found', 'Document not found.', 404);
      throw error;
    }
    this.validateContent(content);
    return {
      name,
      title: titleOf(name),
      content,
      revision: revisionOf(content),
      size: info.size,
      updatedAt: info.mtime.toISOString(),
    };
  }

  async create(value) {
    return this.mutate(async () => {
      await this.initialize();
      const { name, target } = this.pathFor(value);
      const content = `# ${titleOf(name)}\n`;
      try {
        await writeFile(target, content, { encoding: 'utf8', flag: 'wx' });
      } catch (error) {
        if (error?.code === 'EEXIST') throw new NoteError('already_exists', 'A document with this name already exists.', 409);
        throw error;
      }
      return this.read(name);
    });
  }

  async save(value, content, expectedRevision) {
    return this.mutate(async () => {
      await this.initialize();
      this.validateContent(content);
      const { name, target } = this.pathFor(value);
      const current = await this.read(name);
      if (expectedRevision && current.revision !== expectedRevision) {
        throw new NoteError('conflict', 'This document changed in another window. Reload it before saving.', 409);
      }
      const temporary = join(this.root, `.${name}.${process.pid}.${randomUUID()}.tmp`);
      try {
        await writeFile(temporary, content, 'utf8');
        await renameFile(temporary, target);
      } catch (error) {
        await unlink(temporary).catch(() => {});
        throw error;
      }
      return this.read(name);
    });
  }

  async rename(value, nextValue, expectedRevision) {
    return this.mutate(async () => {
      await this.initialize();
      const current = await this.read(value);
      if (expectedRevision && current.revision !== expectedRevision) {
        throw new NoteError('conflict', 'This document changed in another window. Reload it before renaming.', 409);
      }
      const source = this.pathFor(value);
      const destination = this.pathFor(nextValue);
      if (source.name === destination.name) return current;
      try {
        await access(destination.target, fsConstants.F_OK);
        throw new NoteError('already_exists', 'A document with this name already exists.', 409);
      } catch (error) {
        if (error instanceof NoteError) throw error;
        if (error?.code !== 'ENOENT') throw error;
      }
      try {
        await link(source.target, destination.target);
        await unlink(source.target);
      } catch (error) {
        if (error?.code === 'EEXIST') throw new NoteError('already_exists', 'A document with this name already exists.', 409);
        throw error;
      }
      return this.read(destination.name);
    });
  }

  async delete(value, expectedRevision) {
    return this.mutate(async () => {
      await this.initialize();
      const current = await this.read(value);
      if (expectedRevision && current.revision !== expectedRevision) {
        throw new NoteError('conflict', 'This document changed in another window. Reload it before deleting.', 409);
      }
      await unlink(this.pathFor(value).target);
      return { name: current.name };
    });
  }
}

export { DEFAULT_MAX_BYTES, NoteError, NotesStore, normalizeName, revisionOf, titleOf };
