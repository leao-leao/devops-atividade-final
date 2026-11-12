const express = require('express');

const VERSION = process.env.APP_VERSION || '1.0.0';

function createApp({ logger = (entry) => console.log(JSON.stringify(entry)) } = {}) {
  const app = express();
  app.use(express.json());

  // Middleware de log estruturado (JSON): é isso que o Filebeat coleta e o Kibana usa nas métricas.
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      logger({
        '@timestamp': new Date().toISOString(),
        level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
        app: 'tarefas-api',
        version: VERSION,
        method: req.method,
        path: req.path,
        status_code: res.statusCode,
        response_time_ms: Math.round(ms * 100) / 100,
        message: `${req.method} ${req.path} ${res.statusCode}`,
      });
    });
    next();
  });

  let tarefas = [{ id: 1, titulo: 'Estudar DevOps', concluida: false }];
  let nextId = 2;

  app.get('/', (req, res) => res.json({ app: 'tarefas-api', version: VERSION }));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/api/tarefas', (req, res) => res.json(tarefas));

  app.post('/api/tarefas', (req, res) => {
    const { titulo } = req.body || {};
    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({ erro: 'campo "titulo" é obrigatório' });
    }
    const tarefa = { id: nextId++, titulo, concluida: false };
    tarefas.push(tarefa);
    res.status(201).json(tarefa);
  });

  app.delete('/api/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    const antes = tarefas.length;
    tarefas = tarefas.filter((t) => t.id !== id);
    if (tarefas.length === antes) return res.status(404).json({ erro: 'tarefa não encontrada' });
    res.status(204).end();
  });

  // Endpoints para gerar dados interessantes no dashboard (latência e erro 500).
  app.get('/api/lento', (req, res) => {
    const delay = 200 + Math.floor(Math.random() * 800);
    setTimeout(() => res.json({ atraso_ms: delay }), delay);
  });
  app.get('/api/erro', (req, res) => res.status(500).json({ erro: 'erro simulado' }));

  return app;
}

module.exports = { createApp };
