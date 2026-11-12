const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

let server, base;
const logs = [];

test.before(async () => {
  server = createApp({ logger: (e) => logs.push(e) }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test('GET /health retorna ok', async () => {
  const r = await fetch(`${base}/health`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: 'ok' });
});

test('POST /api/tarefas cria tarefa', async () => {
  const r = await fetch(`${base}/api/tarefas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ titulo: 'Fazer pipeline' }),
  });
  assert.equal(r.status, 201);
  const t = await r.json();
  assert.equal(t.titulo, 'Fazer pipeline');
});

test('POST /api/tarefas sem titulo retorna 400', async () => {
  const r = await fetch(`${base}/api/tarefas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(r.status, 400);
});

test('DELETE de tarefa inexistente retorna 404', async () => {
  const r = await fetch(`${base}/api/tarefas/9999`, { method: 'DELETE' });
  assert.equal(r.status, 404);
});

test('cada requisição gera log estruturado com status e tempo de resposta', async () => {
  await fetch(`${base}/health`);
  const e = logs.find((l) => l.path === '/health');
  assert.ok(e);
  assert.equal(e.status_code, 200);
  assert.equal(typeof e.response_time_ms, 'number');
});
