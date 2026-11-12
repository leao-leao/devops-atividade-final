const { createApp } = require('./app');

const port = process.env.PORT || 3000;
const server = createApp().listen(port, () => {
  console.log(JSON.stringify({ '@timestamp': new Date().toISOString(), level: 'info', message: `tarefas-api ouvindo na porta ${port}` }));
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
