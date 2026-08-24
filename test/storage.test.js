import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NoteError, NotesStore, normalizeName } from '../src/storage.js';

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-notes-markdown-'));
  try {
    await run(new NotesStore(root), root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('normalizes document names and rejects traversal', () => {
  assert.equal(normalizeName('  会议记录  '), '会议记录.md');
  assert.equal(normalizeName('Roadmap.MD'), 'Roadmap.md');
  assert.throws(() => normalizeName('../secret'), (error) => error instanceof NoteError && error.code === 'invalid_name');
  assert.throws(() => normalizeName('.hidden'), (error) => error instanceof NoteError && error.code === 'invalid_name');
});

test('creates, lists, reads, and saves Markdown files', async () => fixture(async (store, root) => {
  const created = await store.create('Daily');
  assert.equal(created.name, 'Daily.md');
  assert.equal(created.content, '# Daily\n');
  assert.deepEqual((await store.list()).map((note) => note.name), ['Daily.md']);

  const saved = await store.save(created.name, '# Daily\n\nDone.\n', created.revision);
  assert.notEqual(saved.revision, created.revision);
  assert.equal(await readFile(join(root, 'Daily.md'), 'utf8'), '# Daily\n\nDone.\n');
}));

test('rejects stale saves instead of overwriting newer content', async () => fixture(async (store, root) => {
  const created = await store.create('Shared');
  await writeFile(join(root, 'Shared.md'), '# Changed elsewhere\n', 'utf8');
  await assert.rejects(
    store.save(created.name, '# My stale edit\n', created.revision),
    (error) => error instanceof NoteError && error.code === 'conflict',
  );
  assert.equal(await readFile(join(root, 'Shared.md'), 'utf8'), '# Changed elsewhere\n');
}));

test('serializes concurrent saves so one stale writer is rejected', async () => fixture(async (store) => {
  const created = await store.create('Concurrent');
  const results = await Promise.allSettled([
    store.save(created.name, '# First writer\n', created.revision),
    store.save(created.name, '# Second writer\n', created.revision),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected' && result.reason?.code === 'conflict').length, 1);
}));

test('rejects symlinks even when they use a Markdown filename', async () => fixture(async (store, root) => {
  const outside = join(root, '..', `outside-${Date.now()}.txt`);
  await writeFile(outside, 'secret', 'utf8');
  try {
    await symlink(outside, join(root, 'Linked.md'));
    await assert.rejects(store.read('Linked'), (error) => error instanceof NoteError && error.code === 'invalid_file');
  } finally {
    await rm(outside, { force: true });
  }
}));

test('renames and deletes a document with revision checks', async () => fixture(async (store) => {
  const created = await store.create('Old name');
  const renamed = await store.rename(created.name, 'New name', created.revision);
  assert.equal(renamed.name, 'New name.md');
  await assert.rejects(store.read('Old name'), (error) => error instanceof NoteError && error.code === 'not_found');
  await store.delete(renamed.name, renamed.revision);
  assert.deepEqual(await store.list(), []);
}));

test('never overwrites an existing document during create or rename', async () => fixture(async (store) => {
  const first = await store.create('First');
  await store.create('Second');
  await assert.rejects(store.create('First'), (error) => error instanceof NoteError && error.code === 'already_exists');
  await assert.rejects(
    store.rename(first.name, 'Second', first.revision),
    (error) => error instanceof NoteError && error.code === 'already_exists',
  );
}));
