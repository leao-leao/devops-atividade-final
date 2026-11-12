# Atividade Final – DevOps na Prática

- `app/` – API Node.js (Etapa 2): `npm install && npm test`
- `.github/workflows/main.yml` – pipeline CI/CD (Etapas 2 e 3)
- `helm/tarefas-api/` – chart Helm (Etapa 3)
- `elk/` – Filebeat + Elasticsearch + Kibana (Etapa 4): `docker compose up -d --build` e `./gerar-trafego.ps1`
- `Relatorio_DevOps.docx` – relatório (Etapas 1 e 5)

Antes do push: ajuste `image.repository` em `helm/tarefas-api/values.yaml` (opcional, o pipeline sobrescreve).
